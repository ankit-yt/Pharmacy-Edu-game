const mongoose = require("mongoose")

const questionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },
    options: [
      {
        type: String,
        required: true,
        trim: true,
      },
    ],
    correctAnswer: {
      type: Number,
      required: true,
      min: 0,
      max: 3,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "pharmacology",
        "clinical-pharmacy",
        "pharmaceutical-chemistry",
        "pharmacokinetics",
        "drug-interactions",
        "dosage-forms",
        "pharmacy-law",
        "patient-counseling",
      ],
    },
    difficulty: {
      type: String,
      required: true,
      enum: ["easy", "medium", "hard"],
    },
    explanation: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
)

module.exports = mongoose.model("Question", questionSchema)
