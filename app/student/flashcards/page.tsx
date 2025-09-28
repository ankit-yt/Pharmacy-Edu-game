"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { RotateCcw, CheckCircle, XCircle, Brain, Clock } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { api } from "@/lib/api"

interface Flashcard {
  _id: string
  question: string
  answer: string
  category: string
  difficulty: "easy" | "medium" | "hard"
}

interface FlashcardSession {
  flashcards: Flashcard[]
  currentIndex: number
  showAnswer: boolean
  correctCount: number
  incorrectCount: number
  startTime: Date
}

export default function FlashcardsPage() {
  const { user } = useAuth()
  const [session, setSession] = useState<FlashcardSession | null>(null)
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState({
    category: "all",
    difficulty: "all",
    count: 10,
  })

  const startSession = async () => {
    try {
      setLoading(true)
      console.log("[v0] Starting flashcard session with settings:", settings)

      const params: Record<string, any> = {
        limit: settings.count.toString(),
      }

      if (settings.category !== "all") {
        params.category = settings.category
      }

      if (settings.difficulty !== "all") {
        params.difficulty = settings.difficulty
      }

      console.log("[v0] API request params:", params)

      const response = await api.get("/flashcards/random", { params })

      console.log("[v0] Flashcard API response:", response)
      console.log("[v0] Response data:", response.data)
      console.log("[v0] Response data type:", typeof response.data)
      console.log("[v0] Response data keys:", Object.keys(response.data || {}))

      let flashcards = null

      if (response && response.flashcards && Array.isArray(response.flashcards)) {
        flashcards = response.flashcards
        console.log("[v0] Using response.flashcards:", flashcards.length, "cards")
      } else {
        console.error("[v0] Unexpected response structure:", {
          hasResponse: !!response,
          hasFlashcards: response && "flashcards" in response,
          flashcardsType: response && typeof response.flashcards,
          responseKeys: response && Object.keys(response),
        })
        alert("Unexpected response format from server. Please try again.")
        return
      }

      if (flashcards.length === 0) {
        console.error("[v0] No flashcards found with current filters")
        alert("No flashcards found with the selected filters. Try different settings.")
        return
      }

      console.log("[v0] Creating session with", flashcards.length, "flashcards")
      console.log("[v0] First flashcard sample:", flashcards[0])

      setSession({
        flashcards: flashcards,
        currentIndex: 0,
        showAnswer: false,
        correctCount: 0,
        incorrectCount: 0,
        startTime: new Date(),
      })
      console.log("[v0] Session created successfully")
    } catch (error) {
      console.error("[v0] Failed to start flashcard session:", error)
      console.error("[v0] Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      })
      alert("Failed to load flashcards. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const flipCard = () => {
    if (session) {
      setSession({ ...session, showAnswer: !session.showAnswer })
    }
  }

  const markAnswer = (correct: boolean) => {
    if (!session) return

    const newSession = {
      ...session,
      correctCount: correct ? session.correctCount + 1 : session.correctCount,
      incorrectCount: correct ? session.incorrectCount : session.incorrectCount + 1,
      currentIndex: session.currentIndex + 1,
      showAnswer: false,
    }

    setSession(newSession)

    // Save progress
    if (newSession.currentIndex >= newSession.flashcards.length) {
      saveSession(newSession)
    }
  }

  const saveSession = async (completedSession: FlashcardSession) => {
    try {
      const timeSpent = Math.round((Date.now() - completedSession.startTime.getTime()) / 1000)
      const score = completedSession.correctCount

      await api.post("/scores", {
        score,
        totalQuestions: completedSession.flashcards.length,
        timeSpent,
        gameType: "flashcard",
        category: settings.category === "all" ? undefined : settings.category,
        difficulty: settings.difficulty === "all" ? undefined : settings.difficulty,
      })
    } catch (error) {
      console.error("Failed to save session:", error)
    }
  }

  const resetSession = () => {
    setSession(null)
  }

  const currentFlashcard = session?.flashcards?.[session.currentIndex]
  const progress = session && session.flashcards ? (session.currentIndex / session.flashcards.length) * 100 : 0
  const isComplete = session && session.flashcards && session.currentIndex >= session.flashcards.length

  if (!session) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Flashcards</h1>
          <p className="text-muted-foreground">Study with interactive flashcards</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Start Flashcard Session</CardTitle>
            <CardDescription>Configure your study session</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={settings.category}
                  onChange={(e) => setSettings({ ...settings, category: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                >
                  <option value="all">All Categories</option>
                  <option value="pharmacology">Pharmacology</option>
                  <option value="anatomy">Anatomy</option>
                  <option value="physiology">Physiology</option>
                  <option value="drug-interactions">Drug Interactions</option>
                  <option value="dosage-calculations">Dosage Calculations</option>
                  <option value="clinical-pharmacy">Clinical Pharmacy</option>
                  <option value="pharmaceutical-chemistry">Pharmaceutical Chemistry</option>
                  <option value="pharmacokinetics">Pharmacokinetics</option>
                  <option value="pharmacy-law">Pharmacy Law</option>
                  <option value="patient-counseling">Patient Counseling</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Difficulty</label>
                <select
                  value={settings.difficulty}
                  onChange={(e) => setSettings({ ...settings, difficulty: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                >
                  <option value="all">All Levels</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Number of Cards</label>
                <select
                  value={settings.count}
                  onChange={(e) => setSettings({ ...settings, count: Number.parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                >
                  <option value={5}>5 Cards</option>
                  <option value={10}>10 Cards</option>
                  <option value={20}>20 Cards</option>
                  <option value={50}>50 Cards</option>
                </select>
              </div>
            </div>

            <Button onClick={startSession} disabled={loading} className="w-full">
              {loading ? "Loading..." : "Start Session"}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isComplete) {
    const accuracy = Math.round((session.correctCount / session.flashcards.length) * 100)
    const timeSpent = Math.round((Date.now() - session.startTime.getTime()) / 1000 / 60)

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Session Complete!</CardTitle>
            <CardDescription>Great job studying with flashcards</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">{session.correctCount}</div>
                <div className="text-sm text-muted-foreground">Correct</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{session.incorrectCount}</div>
                <div className="text-sm text-muted-foreground">Incorrect</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{accuracy}%</div>
                <div className="text-sm text-muted-foreground">Accuracy</div>
              </div>
            </div>

            <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4 mr-2" />
                <span>{timeSpent} minutes</span>
              </div>
              <div className="flex items-center space-x-1">
                <Brain className="h-4 w-4 mr-2" />
                <span>{session.flashcards.length} cards</span>
              </div>
            </div>

            <Button onClick={resetSession} className="w-full">
              Start New Session
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Flashcards</h1>
          <p className="text-muted-foreground">
            Card {session.currentIndex + 1} of {session.flashcards.length}
          </p>
        </div>
        <Button variant="outline" onClick={resetSession}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset
        </Button>
      </div>

      <Progress value={progress} className="w-full" />

      <Card className="min-h-[400px] cursor-pointer" onClick={flipCard}>
        <CardContent className="flex flex-col items-center justify-center h-full p-8 text-center">
          {!session.showAnswer ? (
            <div className="space-y-4">
              <Badge variant="secondary">{currentFlashcard?.category}</Badge>
              <h2 className="text-xl font-semibold">{currentFlashcard?.question}</h2>
              <p className="text-muted-foreground">Click to reveal answer</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Answer:</h3>
                <p className="text-primary font-medium">{currentFlashcard?.answer}</p>
              </div>

              <div className="flex space-x-4">
                <Button
                  onClick={(e) => {
                    e.stopPropagation()
                    markAnswer(false)
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Incorrect
                </Button>
                <Button
                  onClick={(e) => {
                    e.stopPropagation()
                    markAnswer(true)
                  }}
                  className="flex-1"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Correct
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-center space-x-4 text-sm">
        <div className="flex items-center space-x-1 text-green-600">
          <CheckCircle className="h-4 w-4" />
          <span>{session.correctCount} correct</span>
        </div>
        <div className="flex items-center space-x-1 text-red-600">
          <XCircle className="h-4 w-4" />
          <span>{session.incorrectCount} incorrect</span>
        </div>
      </div>
    </div>
  )
}
