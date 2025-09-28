const express = require("express")
const Score = require("../models/Score")
const auth = require("../middleware/auth")
const { default: mongoose } = require("mongoose")

const router = express.Router()

// Submit score
router.post("/", auth, async (req, res) => {
  try {
    const { gameType, score, totalQuestions, timeSpent, category, difficulty } = req.body

    const newScore = new Score({
      userId: req.user.userId,
      gameType,
      score,
      totalQuestions,
      timeSpent,
      category,
      difficulty,
    })

    await newScore.save()

    res.status(201).json({
      message: "Score submitted successfully",
      score: newScore,
    })
  } catch (error) {
    console.error("Submit score error:", error)
    res.status(500).json({ message: "Server error submitting score" })
  }
})

// Get user scores
router.get("/", auth, async (req, res) => {
  try {
    const { userId } = req.query
    const targetUserId = userId || req.user.userId

    // Only allow users to see their own scores unless they're admin
    if (req.user.role !== "admin" && targetUserId !== req.user.userId) {
      return res.status(403).json({ message: "Access denied" })
    }

    const scores = await Score.find({ userId: targetUserId }).sort({ createdAt: -1 }).populate("userId", "name email")

    res.json({ scores })
  } catch (error) {
    console.error("Get scores error:", error)
    res.status(500).json({ message: "Server error fetching scores" })
  }
})

// Get score statistics
router.get("/stats", auth, async (req, res) => {
  try {
    const { userId } = req.query
    const targetUserId = userId || req.user.userId

    // Only allow users to see their own stats unless they're admin
    if (req.user.role !== "admin" && targetUserId !== req.user.userId) {
      return res.status(403).json({ message: "Access denied" })
    }

    const stats = await Score.aggregate([
       { $match: { userId: new mongoose.Types.ObjectId(targetUserId) } },
      {
        $group: {
          _id: null,
          totalGames: { $sum: 1 },
          averageScore: { $avg: { $divide: ["$score", "$totalQuestions"] } },
          totalTimeSpent: { $sum: "$timeSpent" },
          bestScore: { $max: { $divide: ["$score", "$totalQuestions"] } },
          quizGames: {
            $sum: { $cond: [{ $eq: ["$gameType", "quiz"] }, 1, 0] },
          },
          flashcardGames: {
            $sum: { $cond: [{ $eq: ["$gameType", "flashcard"] }, 1, 0] },
          },
          gameTypeStats: {
            $push: {
              gameType: "$gameType",
              score: { $divide: ["$score", "$totalQuestions"] },
              timeSpent: "$timeSpent",
            },
          },
        },
      },
    ])

    const recentScores = await Score.find({ userId: targetUserId })
      .sort({ createdAt: -1 })
      .limit(10)
      .select("gameType score totalQuestions timeSpent createdAt category difficulty")

    res.json({
      stats: stats[0] || {
        totalGames: 0,
        averageScore: 0,
        totalTimeSpent: 0,
        bestScore: 0,
        quizGames: 0,
        flashcardGames: 0,
        gameTypeStats: [],
      },
      recentScores,
    })
  } catch (error) {
    console.error("Get score stats error:", error)
    res.status(500).json({ message: "Server error fetching score statistics" })
  }
})

// Get score history for analytics
router.get("/history", auth, async (req, res) => {
  try {
    const { days = 30 } = req.query
    const targetUserId = req.user.userId

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - Number.parseInt(days))

    const scores = await Score.find({
      userId: targetUserId,
      createdAt: { $gte: startDate },
    })
      .sort({ createdAt: 1 })
      .select("score totalQuestions timeSpent category createdAt")

    const formattedScores = scores.map((score) => ({
      date: score.createdAt.toISOString().split("T")[0],
      score: Math.round((score.score / score.totalQuestions) * 100),
      category: score.category,
      timeSpent: score.timeSpent,
    }))

    res.json(formattedScores)
  } catch (error) {
    console.error("Get score history error:", error)
    res.status(500).json({ message: "Server error fetching score history" })
  }
})

// Get category statistics for analytics
router.get("/category-stats", auth, async (req, res) => {
  try {
    const targetUserId = req.user.userId

    const categoryStats = await Score.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(targetUserId) } },
      {
        $group: {
          _id: "$category",
          averageScore: { $avg: { $multiply: [{ $divide: ["$score", "$totalQuestions"] }, 100] } },
          questionsAnswered: { $sum: "$totalQuestions" },
          timeSpent: { $sum: "$timeSpent" },
        },
      },
      {
        $project: {
          category: "$_id",
          averageScore: { $round: ["$averageScore", 0] },
          questionsAnswered: 1,
          timeSpent: { $round: [{ $divide: ["$timeSpent", 60] }, 0] }, // Convert to minutes
          _id: 0,
        },
      },
    ])

    res.json(categoryStats)
  } catch (error) {
    console.error("Get category stats error:", error)
    res.status(500).json({ message: "Server error fetching category statistics" })
  }
})

module.exports = router
