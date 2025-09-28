const express = require("express")
const Flashcard = require("../models/Flashcard")
const auth = require("../middleware/auth")

const router = express.Router()

// Get all flashcards (for students and admins)
router.get("/", auth, async (req, res) => {
  try {
    const { category, difficulty } = req.query

    const filter = {}
    if (category) filter.category = category
    if (difficulty) filter.difficulty = difficulty

    const flashcards = await Flashcard.find(filter).sort({ createdAt: -1 })

    res.json({ flashcards })
  } catch (error) {
    console.error("Get flashcards error:", error)
    res.status(500).json({ message: "Server error fetching flashcards" })
  }
})

// Get random flashcards (for students)
router.get("/random", auth, async (req, res) => {
  try {
    const { category, difficulty, limit = 10 } = req.query

    const filter = {}
    if (category && category !== "all") filter.category = category
    if (difficulty && difficulty !== "all") filter.difficulty = difficulty

    console.log("[v0] Random flashcards request:", { filter, limit })

    const flashcards = await Flashcard.aggregate([{ $match: filter }, { $sample: { size: Number.parseInt(limit) } }])

    console.log("[v0] Found flashcards:", flashcards.length)

    // Return consistent format with other endpoints
    res.json({ flashcards })
  } catch (error) {
    console.error("Get random flashcards error:", error)
    res.status(500).json({ message: "Server error fetching random flashcards" })
  }
})

// Get single flashcard by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const flashcard = await Flashcard.findById(req.params.id)

    if (!flashcard) {
      return res.status(404).json({ message: "Flashcard not found" })
    }

    res.json({ flashcard })
  } catch (error) {
    console.error("Get flashcard error:", error)
    res.status(500).json({ message: "Server error fetching flashcard" })
  }
})

// Create new flashcard (admin only)
router.post("/", auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin role required." })
    }

    const { question, answer, category, difficulty } = req.body

    // Validate required fields
    if (!question || !answer || !category || !difficulty) {
      return res.status(400).json({ message: "All fields are required" })
    }

    const newFlashcard = new Flashcard({
      question,
      answer,
      category,
      difficulty,
    })

    await newFlashcard.save()

    res.status(201).json({
      message: "Flashcard created successfully",
      flashcard: newFlashcard,
    })
  } catch (error) {
    console.error("Create flashcard error:", error)
    res.status(500).json({ message: "Server error creating flashcard" })
  }
})

// Update flashcard (admin only)
router.put("/:id", auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin role required." })
    }

    const { question, answer, category, difficulty } = req.body

    const flashcard = await Flashcard.findById(req.params.id)

    if (!flashcard) {
      return res.status(404).json({ message: "Flashcard not found" })
    }

    // Update fields
    if (question) flashcard.question = question
    if (answer) flashcard.answer = answer
    if (category) flashcard.category = category
    if (difficulty) flashcard.difficulty = difficulty

    await flashcard.save()

    res.json({
      message: "Flashcard updated successfully",
      flashcard,
    })
  } catch (error) {
    console.error("Update flashcard error:", error)
    res.status(500).json({ message: "Server error updating flashcard" })
  }
})

// Delete flashcard (admin only)
router.delete("/:id", auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin role required." })
    }

    const flashcard = await Flashcard.findById(req.params.id)

    if (!flashcard) {
      return res.status(404).json({ message: "Flashcard not found" })
    }

    await Flashcard.findByIdAndDelete(req.params.id)

    res.json({ message: "Flashcard deleted successfully" })
  } catch (error) {
    console.error("Delete flashcard error:", error)
    res.status(500).json({ message: "Server error deleting flashcard" })
  }
})

// Get flashcard statistics (admin only)
router.get("/admin/stats", auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin role required." })
    }

    const totalFlashcards = await Flashcard.countDocuments()

    const categoryStats = await Flashcard.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
    ])

    const difficultyStats = await Flashcard.aggregate([
      {
        $group: {
          _id: "$difficulty",
          count: { $sum: 1 },
        },
      },
    ])

    res.json({
      totalFlashcards,
      categoryStats,
      difficultyStats,
    })
  } catch (error) {
    console.error("Get flashcard stats error:", error)
    res.status(500).json({ message: "Server error fetching flashcard statistics" })
  }
})

module.exports = router
