const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const dotenv = require("dotenv")

// Import routes
const authRoutes = require("./routes/auth")
const questionRoutes = require("./routes/questions")
const scoreRoutes = require("./routes/scores")
const adminRoutes = require("./routes/admin")
const flashcardRoutes = require("./routes/flashcards")

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/questions", questionRoutes)
app.use("/api/scores", scoreRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/flashcards", flashcardRoutes)

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ message: "PharmaLearn API is running!" })
})

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB")
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`)
    })
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error)
  })

module.exports = app
