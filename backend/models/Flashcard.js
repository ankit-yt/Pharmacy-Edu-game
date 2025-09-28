const mongoose = require("mongoose")

const flashcardSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },
    answer: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "pharmacology",
        "anatomy",
        "physiology",
        "drug-interactions",
        "dosage-calculations",
        "clinical-pharmacy",
        "pharmaceutical-chemistry",
        "pharmacokinetics",
        "pharmacy-law",
        "patient-counseling",
      ],
    },
    difficulty: {
      type: String,
      required: true,
      enum: ["easy", "medium", "hard"],
    },
  },
  {
    timestamps: true,
  },
)

module.exports = mongoose.model("Flashcard", flashcardSchema)
