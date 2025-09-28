const express = require("express")
const Question = require("../models/Question")
const auth = require("../middleware/auth")
const { adminAuth } = require("../middleware/auth")

const router = express.Router()

// Get questions (with optional filtering)
router.get("/", auth, async (req, res) => {
  try {
    const { category, difficulty, limit = 10 } = req.query

    const filter = {}
    if (category) filter.category = category
    if (difficulty) filter.difficulty = difficulty

    const questions = await Question.find(filter).limit(Number.parseInt(limit)).sort({ createdAt: -1 })

    // Remove correct answers for students (only show for quiz results)
    const questionsForStudent = questions.map((q) => ({
      _id: q._id,
      question: q.question,
      options: q.options,
      category: q.category,
      difficulty: q.difficulty,
    }))

    res.json({ questions: questionsForStudent })
  } catch (error) {
    console.error("Get questions error:", error)
    res.status(500).json({ message: "Server error fetching questions" })
  }
})

// Get single question with answer (for quiz checking)
router.get("/:id/answer", auth, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
    if (!question) {
      return res.status(404).json({ message: "Question not found" })
    }

    res.json({
      questionId: question._id,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
    })
  } catch (error) {
    console.error("Get question answer error:", error)
    res.status(500).json({ message: "Server error fetching question answer" })
  }
})

// Create question (admin only)
router.post("/", adminAuth, async (req, res) => {
  try {
    const { question, options, correctAnswer, category, difficulty, explanation } = req.body

    const newQuestion = new Question({
      question,
      options,
      correctAnswer,
      category,
      difficulty,
      explanation,
    })

    await newQuestion.save()

    res.status(201).json({
      message: "Question created successfully",
      question: newQuestion,
    })
  } catch (error) {
    console.error("Create question error:", error)
    res.status(500).json({ message: "Server error creating question" })
  }
})

// Update question (admin only)
router.put("/:id", adminAuth, async (req, res) => {
  try {
    const { question, options, correctAnswer, category, difficulty, explanation } = req.body

    const updatedQuestion = await Question.findByIdAndUpdate(
      req.params.id,
      { question, options, correctAnswer, category, difficulty, explanation },
      { new: true },
    )

    if (!updatedQuestion) {
      return res.status(404).json({ message: "Question not found" })
    }

    res.json({
      message: "Question updated successfully",
      question: updatedQuestion,
    })
  } catch (error) {
    console.error("Update question error:", error)
    res.status(500).json({ message: "Server error updating question" })
  }
})

// Delete question (admin only)
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const deletedQuestion = await Question.findByIdAndDelete(req.params.id)

    if (!deletedQuestion) {
      return res.status(404).json({ message: "Question not found" })
    }

    res.json({ message: "Question deleted successfully" })
  } catch (error) {
    console.error("Delete question error:", error)
    res.status(500).json({ message: "Server error deleting question" })
  }
})

module.exports = router
