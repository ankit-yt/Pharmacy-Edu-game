"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Brain, Clock, Trophy, RotateCcw, ArrowRight, CheckCircle, XCircle } from "lucide-react"
import { apiClient } from "@/lib/api"

interface Question {
  _id: string
  question: string
  options: string[]
  category: string
  difficulty: string
}

interface QuizResult {
  questionId: string
  selectedAnswer: number
  correctAnswer: number
  isCorrect: boolean
  explanation?: string
}

const categories = [
  { value: "pharmacology", label: "Pharmacology" },
  { value: "clinical-pharmacy", label: "Clinical Pharmacy" },
  { value: "pharmaceutical-chemistry", label: "Pharmaceutical Chemistry" },
  { value: "pharmacokinetics", label: "Pharmacokinetics" },
  { value: "drug-interactions", label: "Drug Interactions" },
  { value: "dosage-forms", label: "Dosage Forms" },
  { value: "pharmacy-law", label: "Pharmacy Law" },
  { value: "patient-counseling", label: "Patient Counseling" },
]

const difficulties = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
]

export default function QuizPage() {
  const [gameState, setGameState] = useState<"setup" | "playing" | "results">("setup")
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [results, setResults] = useState<QuizResult[]>([])
  const [timeLeft, setTimeLeft] = useState(30)
  const [totalTime, setTotalTime] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  // Quiz settings
  const [category, setCategory] = useState<string>("all-categories")
  const [difficulty, setDifficulty] = useState<string>("all-difficulties")
  const [questionCount, setQuestionCount] = useState(10)

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (gameState === "playing" && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1)
        setTotalTime(totalTime + 1)
      }, 1000)
    } else if (gameState === "playing" && timeLeft === 0) {
      handleNextQuestion()
    }
    return () => clearTimeout(timer)
  }, [gameState, timeLeft, totalTime])

  const startQuiz = async () => {
    setIsLoading(true)
    try {
      const response = await apiClient.getQuestions(category, difficulty)
      const shuffledQuestions = response.questions.sort(() => Math.random() - 0.5).slice(0, questionCount)

      setQuestions(shuffledQuestions)
      setGameState("playing")
      setCurrentQuestionIndex(0)
      setSelectedAnswer(null)
      setResults([])
      setTimeLeft(30)
      setTotalTime(0)
    } catch (error) {
      console.error("Error starting quiz:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex)
  }

  const handleNextQuestion = async () => {
    if (selectedAnswer === null && timeLeft > 0) return

    const currentQuestion = questions[currentQuestionIndex]

    try {
      // Get correct answer from backend
      const answerResponse = await apiClient.request(`/questions/${currentQuestion._id}/answer`)

      const result: QuizResult = {
        questionId: currentQuestion._id,
        selectedAnswer: selectedAnswer ?? -1,
        correctAnswer: answerResponse.correctAnswer,
        isCorrect: selectedAnswer === answerResponse.correctAnswer,
        explanation: answerResponse.explanation,
      }

      const newResults = [...results, result]
      setResults(newResults)

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1)
        setSelectedAnswer(null)
        setTimeLeft(30)
      } else {
        // Quiz finished
        await submitQuizResults(newResults)
        setGameState("results")
      }
    } catch (error) {
      console.error("Error processing answer:", error)
    }
  }

  const submitQuizResults = async (quizResults: QuizResult[]) => {
    const score = quizResults.filter((r) => r.isCorrect).length
    try {
      await apiClient.submitScore("quiz", score, questions.length, totalTime, category, difficulty)
    } catch (error) {
      console.error("Error submitting score:", error)
    }
  }

  const resetQuiz = () => {
    setGameState("setup")
    setQuestions([])
    setCurrentQuestionIndex(0)
    setSelectedAnswer(null)
    setResults([])
    setTimeLeft(30)
    setTotalTime(0)
  }

  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  if (gameState === "setup") {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Brain className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Quiz Game</h1>
          <p className="text-muted-foreground">Test your pharmacy knowledge with interactive quizzes</p>
        </div>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Quiz Settings</CardTitle>
            <CardDescription>Customize your quiz experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-categories">All Categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Difficulty</label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger>
                    <SelectValue placeholder="All difficulties" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-difficulties">All Difficulties</SelectItem>
                    {difficulties.map((diff) => (
                      <SelectItem key={diff.value} value={diff.value}>
                        {diff.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Number of Questions</label>
              <Select
                value={questionCount.toString()}
                onValueChange={(value) => setQuestionCount(Number.parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 Questions</SelectItem>
                  <SelectItem value="10">10 Questions</SelectItem>
                  <SelectItem value="15">15 Questions</SelectItem>
                  <SelectItem value="20">20 Questions</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={startQuiz} className="w-full" disabled={isLoading}>
              {isLoading ? "Loading Questions..." : "Start Quiz"}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (gameState === "playing" && currentQuestion) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Progress Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Badge variant="outline">
              Question {currentQuestionIndex + 1} of {questions.length}
            </Badge>
            <Badge variant="outline" className="capitalize">
              {currentQuestion.difficulty}
            </Badge>
            <Badge variant="outline" className="capitalize">
              {currentQuestion.category.replace("-", " ")}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span className="font-mono">{timeLeft}s</span>
          </div>
        </div>

        <Progress value={progress} className="h-2" />

        {/* Question Card */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-xl leading-relaxed">{currentQuestion.question}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <Button
                key={index}
                variant={selectedAnswer === index ? "default" : "outline"}
                className="w-full text-left justify-start h-auto p-4 text-wrap"
                onClick={() => handleAnswerSelect(index)}
              >
                <span className="font-medium mr-3">{String.fromCharCode(65 + index)}.</span>
                {option}
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={resetQuiz}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Restart
          </Button>
          <Button onClick={handleNextQuestion} disabled={selectedAnswer === null && timeLeft > 0}>
            {currentQuestionIndex < questions.length - 1 ? (
              <>
                Next Question
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            ) : (
              "Finish Quiz"
            )}
          </Button>
        </div>
      </div>
    )
  }

  if (gameState === "results") {
    const score = results.filter((r) => r.isCorrect).length
    const percentage = Math.round((score / questions.length) * 100)

    return (
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Results Header */}
        <div className="text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Quiz Complete!</h1>
          <p className="text-muted-foreground">Here's how you performed</p>
        </div>

        {/* Score Summary */}
        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="grid gap-6 md:grid-cols-3 text-center">
              <div>
                <div className="text-3xl font-bold text-primary">{score}</div>
                <p className="text-sm text-muted-foreground">Correct Answers</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">{percentage}%</div>
                <p className="text-sm text-muted-foreground">Score</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">
                  {Math.floor(totalTime / 60)}m {totalTime % 60}s
                </div>
                <p className="text-sm text-muted-foreground">Time Taken</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Question Review */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Question Review</CardTitle>
            <CardDescription>Review your answers and explanations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {results.map((result, index) => {
              const question = questions.find((q) => q._id === result.questionId)
              if (!question) return null

              return (
                <div key={result.questionId} className="border border-border rounded-lg p-4">
                  <div className="flex items-start gap-3 mb-3">
                    {result.isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium mb-2">
                        {index + 1}. {question.question}
                      </p>
                      <div className="space-y-1 text-sm">
                        <p>
                          <span className="text-muted-foreground">Your answer:</span>{" "}
                          <span className={result.isCorrect ? "text-green-600" : "text-red-600"}>
                            {result.selectedAnswer >= 0
                              ? `${String.fromCharCode(65 + result.selectedAnswer)}. ${
                                  question.options[result.selectedAnswer]
                                }`
                              : "No answer selected"}
                          </span>
                        </p>
                        {!result.isCorrect && (
                          <p>
                            <span className="text-muted-foreground">Correct answer:</span>{" "}
                            <span className="text-green-600">
                              {String.fromCharCode(65 + result.correctAnswer)}. {question.options[result.correctAnswer]}
                            </span>
                          </p>
                        )}
                        {result.explanation && (
                          <p className="text-muted-foreground italic mt-2">{result.explanation}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <Button onClick={resetQuiz}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Take Another Quiz
          </Button>
          <Button variant="outline" onClick={() => window.history.back()}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return null
}
