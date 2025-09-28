const express = require("express")
const User = require("../models/User")
const Question = require("../models/Question")
const Score = require("../models/Score")
const { adminAuth } = require("../middleware/auth")

const router = express.Router()

// Get all users
router.get("/users", adminAuth, async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 })

    res.json({ users })
  } catch (error) {
    console.error("Get users error:", error)
    res.status(500).json({ message: "Server error fetching users" })
  }
})

// Get platform statistics
router.get("/stats", adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments()
    const totalStudents = await User.countDocuments({ role: "student" })
    const totalAdmins = await User.countDocuments({ role: "admin" })
    const totalQuestions = await Question.countDocuments()
    const totalGames = await Score.countDocuments()

    const recentUsers = await User.find().select("-password").sort({ createdAt: -1 }).limit(5)

    const topPerformers = await Score.aggregate([
      {
        $group: {
          _id: "$userId",
          averageScore: { $avg: { $divide: ["$score", "$totalQuestions"] } },
          totalGames: { $sum: 1 },
        },
      },
      { $sort: { averageScore: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          name: "$user.name",
          email: "$user.email",
          averageScore: 1,
          totalGames: 1,
        },
      },
    ])

    res.json({
      stats: {
        totalUsers,
        totalStudents,
        totalAdmins,
        totalQuestions,
        totalGames,
      },
      recentUsers,
      topPerformers,
    })
  } catch (error) {
    console.error("Get admin stats error:", error)
    res.status(500).json({ message: "Server error fetching admin statistics" })
  }
})

module.exports = router
