const mongoose = require("mongoose")

const scoreSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    gameType: {
      type: String,
      required: true,
      enum: ["quiz", "flashcard"],
    },
    score: {
      type: Number,
      required: true,
      min: 0,
    },
    totalQuestions: {
      type: Number,
      required: true,
      min: 1,
    },
    timeSpent: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      enum: [
        "pharmacology",
        "clinical-pharmacy",
        "pharmaceutical-chemistry",
        "pharmacokinetics",
        "drug-interactions",
        "dosage-forms",
        "dosage-calculations", // Added missing category from flashcards
        "pharmacy-law",
        "patient-counseling",
        "anatomy", // Added missing category from flashcards
        "physiology", // Added missing category from flashcards
      ],
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
    },
  },
  {
    timestamps: true,
  },
)

// Index for better query performance
scoreSchema.index({ userId: 1, createdAt: -1 })
scoreSchema.index({ gameType: 1, createdAt: -1 })

module.exports = mongoose.model("Score", scoreSchema)
