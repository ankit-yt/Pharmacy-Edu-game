const mongoose = require("mongoose")
const dotenv = require("dotenv")

// Load environment variables
dotenv.config({ path: "../backend/.env" })

// Import the Flashcard model
const Flashcard = require("../backend/models/Flashcard")

const sampleFlashcards = [
  {
    question: "What is the mechanism of action of ACE inhibitors?",
    answer:
      "ACE inhibitors block the conversion of angiotensin I to angiotensin II, reducing vasoconstriction and aldosterone secretion, thereby lowering blood pressure.",
    category: "pharmacology",
    difficulty: "medium",
  },
  {
    question: "What is the first-pass effect?",
    answer:
      "The first-pass effect is the metabolism of a drug by the liver before it reaches systemic circulation, reducing the bioavailability of orally administered drugs.",
    category: "pharmacokinetics",
    difficulty: "easy",
  },
  {
    question: "Name three contraindications for aspirin therapy.",
    answer: "Active bleeding, severe liver disease, and known hypersensitivity to salicylates or NSAIDs.",
    category: "clinical-pharmacy",
    difficulty: "medium",
  },
  {
    question: "What is the antidote for warfarin overdose?",
    answer:
      "Vitamin K (phytonadione) is the antidote for warfarin overdose. Fresh frozen plasma may be used for immediate reversal in severe cases.",
    category: "drug-interactions",
    difficulty: "easy",
  },
  {
    question:
      "Calculate the creatinine clearance using the Cockcroft-Gault equation for a 65-year-old male, 80kg, with serum creatinine of 1.5 mg/dL.",
    answer: "CrCl = [(140-65) × 80] / (72 × 1.5) = 6000 / 108 = 55.6 mL/min",
    category: "dosage-calculations",
    difficulty: "hard",
  },
  {
    question: "What are the main branches of the aortic arch?",
    answer:
      "The three main branches are: brachiocephalic trunk, left common carotid artery, and left subclavian artery.",
    category: "anatomy",
    difficulty: "medium",
  },
  {
    question: "Explain the Frank-Starling mechanism.",
    answer:
      "The Frank-Starling mechanism states that the stroke volume of the heart increases in response to an increase in venous return (preload), due to increased stretch of cardiac muscle fibers.",
    category: "physiology",
    difficulty: "hard",
  },
  {
    question: "What is the difference between a generic and brand name drug?",
    answer:
      "Generic drugs contain the same active ingredient as brand name drugs but are typically less expensive. They must demonstrate bioequivalence to the original brand name product.",
    category: "pharmaceutical-chemistry",
    difficulty: "easy",
  },
  {
    question: "Under what circumstances can a pharmacist refuse to fill a prescription?",
    answer:
      "A pharmacist can refuse if the prescription appears fraudulent, is for an inappropriate indication, has dangerous drug interactions, or violates professional judgment regarding patient safety.",
    category: "pharmacy-law",
    difficulty: "medium",
  },
  {
    question: "What key points should be covered when counseling a patient on antibiotic therapy?",
    answer:
      "Complete the full course even if feeling better, take at prescribed intervals, report severe side effects, avoid alcohol if contraindicated, and proper storage instructions.",
    category: "patient-counseling",
    difficulty: "easy",
  },
  {
    question: "What is the mechanism of action of proton pump inhibitors?",
    answer:
      "PPIs irreversibly bind to and inhibit the H+/K+-ATPase enzyme (proton pump) in gastric parietal cells, reducing gastric acid secretion.",
    category: "pharmacology",
    difficulty: "medium",
  },
  {
    question: "Define bioavailability and bioequivalence.",
    answer:
      "Bioavailability is the fraction of administered drug that reaches systemic circulation. Bioequivalence means two formulations have similar bioavailability and produce similar therapeutic effects.",
    category: "pharmacokinetics",
    difficulty: "medium",
  },
  {
    question: "What are the signs and symptoms of digoxin toxicity?",
    answer:
      "Nausea, vomiting, visual disturbances (yellow halos), cardiac arrhythmias, confusion, and fatigue. Serum levels >2.0 ng/mL are typically toxic.",
    category: "clinical-pharmacy",
    difficulty: "hard",
  },
  {
    question: "List five major drug interactions with warfarin.",
    answer:
      "Aspirin (increased bleeding), antibiotics (increased INR), amiodarone (increased INR), phenytoin (variable effects), and vitamin K-rich foods (decreased INR).",
    category: "drug-interactions",
    difficulty: "hard",
  },
  {
    question: "A patient needs 2.5 mg/kg of a drug. If the patient weighs 154 lbs, what dose should be given?",
    answer: "154 lbs ÷ 2.2 = 70 kg; 70 kg × 2.5 mg/kg = 175 mg",
    category: "dosage-calculations",
    difficulty: "medium",
  },
]

async function seedFlashcards() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })

    console.log("Connected to MongoDB")

    // Clear existing flashcards
    await Flashcard.deleteMany({})
    console.log("Cleared existing flashcards")

    // Insert sample flashcards
    const insertedFlashcards = await Flashcard.insertMany(sampleFlashcards)
    console.log(`Inserted ${insertedFlashcards.length} flashcards`)

    // Display summary
    const categoryCount = await Flashcard.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ])

    console.log("\nFlashcards by category:")
    categoryCount.forEach((cat) => {
      console.log(`  ${cat._id}: ${cat.count}`)
    })

    console.log("\nFlashcard seeding completed successfully!")
  } catch (error) {
    console.error("Error seeding flashcards:", error)
  } finally {
    await mongoose.connection.close()
    console.log("Database connection closed")
  }
}

// Run the seeding function
seedFlashcards()
