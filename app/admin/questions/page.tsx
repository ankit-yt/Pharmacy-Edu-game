"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Plus, Brain, Edit, Trash2 } from "lucide-react"
import { apiClient } from "@/lib/api"

interface Question {
  _id: string
  question: string
  options: string[]
  correctAnswer: number
  category: string
  difficulty: string
  explanation?: string
  createdAt: string
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

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Form state
  const [formData, setFormData] = useState({
    question: "",
    options: ["", "", "", ""],
    correctAnswer: 0,
    category: "",
    difficulty: "",
    explanation: "",
  })

  useEffect(() => {
    fetchQuestions()
  }, [])

  useEffect(() => {
    const filtered = questions.filter(
      (question) =>
        question.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        question.category.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredQuestions(filtered)
  }, [searchTerm, questions])

  const fetchQuestions = async () => {
    try {
      const response = await apiClient.request("/questions?limit=100")
      setQuestions(response.questions)
      setFilteredQuestions(response.questions)
    } catch (error) {
      console.error("Error fetching questions:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      category: "",
      difficulty: "",
      explanation: "",
    })
    setEditingQuestion(null)
    setError("")
    setSuccess("")
  }

  const handleOpenDialog = (question?: Question) => {
    if (question) {
      setEditingQuestion(question)
      setFormData({
        question: question.question,
        options: [...question.options],
        correctAnswer: question.correctAnswer,
        category: question.category,
        difficulty: question.difficulty,
        explanation: question.explanation || "",
      })
    } else {
      resetForm()
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    resetForm()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    // Validation
    if (!formData.question.trim()) {
      setError("Question is required")
      return
    }

    if (formData.options.some((option) => !option.trim())) {
      setError("All options are required")
      return
    }

    if (!formData.category || !formData.difficulty) {
      setError("Category and difficulty are required")
      return
    }

    try {
      if (editingQuestion) {
        await apiClient.updateQuestion(editingQuestion._id, formData)
        setSuccess("Question updated successfully")
      } else {
        await apiClient.createQuestion(formData)
        setSuccess("Question created successfully")
      }

      await fetchQuestions()
      setTimeout(() => {
        handleCloseDialog()
      }, 1500)
    } catch (error: any) {
      setError(error.message || "Failed to save question")
    }
  }

  const handleDelete = async (questionId: string) => {
    if (!confirm("Are you sure you want to delete this question?")) return

    try {
      await apiClient.deleteQuestion(questionId)
      await fetchQuestions()
    } catch (error: any) {
      console.error("Error deleting question:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
        <div className="animate-pulse">
          <div className="h-64 bg-muted rounded-lg"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Question Management</h1>
        <p className="text-muted-foreground mt-2">Create and manage quiz questions</p>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{questions.length}</div>
            <p className="text-xs text-muted-foreground">In database</p>
          </CardContent>
        </Card>

        {difficulties.map((diff) => (
          <Card key={diff.value} className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium capitalize">{diff.label}</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{questions.filter((q) => q.difficulty === diff.value).length}</div>
              <p className="text-xs text-muted-foreground">Questions</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Questions Table */}
      <Card className="border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Questions</CardTitle>
              <CardDescription>Manage quiz questions and answers</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search questions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => handleOpenDialog()}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Question
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingQuestion ? "Edit Question" : "Add New Question"}</DialogTitle>
                    <DialogDescription>
                      {editingQuestion ? "Update the question details" : "Create a new quiz question"}
                    </DialogDescription>
                  </DialogHeader>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    {success && (
                      <Alert>
                        <AlertDescription>{success}</AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="question">Question</Label>
                      <Textarea
                        id="question"
                        placeholder="Enter the question"
                        value={formData.question}
                        onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Answer Options</Label>
                      {formData.options.map((option, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <span className="text-sm font-medium w-6">{String.fromCharCode(65 + index)}.</span>
                          <Input
                            placeholder={`Option ${String.fromCharCode(65 + index)}`}
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...formData.options]
                              newOptions[index] = e.target.value
                              setFormData({ ...formData, options: newOptions })
                            }}
                          />
                          <input
                            type="radio"
                            name="correctAnswer"
                            checked={formData.correctAnswer === index}
                            onChange={() => setFormData({ ...formData, correctAnswer: index })}
                            className="w-4 h-4"
                          />
                        </div>
                      ))}
                      <p className="text-xs text-muted-foreground">Select the correct answer using the radio buttons</p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select
                          value={formData.category}
                          onValueChange={(value) => setFormData({ ...formData, category: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat.value} value={cat.value}>
                                {cat.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="difficulty">Difficulty</Label>
                        <Select
                          value={formData.difficulty}
                          onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select difficulty" />
                          </SelectTrigger>
                          <SelectContent>
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
                      <Label htmlFor="explanation">Explanation (Optional)</Label>
                      <Textarea
                        id="explanation"
                        placeholder="Provide an explanation for the correct answer"
                        value={formData.explanation}
                        onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                        rows={2}
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={handleCloseDialog}>
                        Cancel
                      </Button>
                      <Button type="submit">{editingQuestion ? "Update Question" : "Create Question"}</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Question</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuestions.length > 0 ? (
                  filteredQuestions.map((question) => (
                    <TableRow key={question._id}>
                      <TableCell>
                        <div className="max-w-md">
                          <p className="font-medium line-clamp-2">{question.question}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Correct: {String.fromCharCode(65 + question.correctAnswer)}.{" "}
                            {question.options[question.correctAnswer]}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {question.category.replace("-", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            question.difficulty === "easy"
                              ? "secondary"
                              : question.difficulty === "medium"
                                ? "default"
                                : "destructive"
                          }
                          className="capitalize"
                        >
                          {question.difficulty}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(question.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(question)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(question._id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        {searchTerm ? "No questions found matching your search" : "No questions found"}
                      </p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
