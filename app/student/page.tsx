"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Brain, BookOpen, Clock, TrendingUp, Play } from "lucide-react"
import Link from "next/link"
import { apiClient } from "@/lib/api"
import { useAuth } from "@/hooks/use-auth"

interface DashboardStats {
  totalGames: number
  averageScore: number
  totalTimeSpent: number
  bestScore: number
  flashcardGames: number
  quizGames: number
}

interface RecentScore {
  _id: string
  gameType: string
  score: number
  totalQuestions: number
  timeSpent: number
  createdAt: string
  category?: string
  difficulty?: string
}

export default function StudentDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentScores, setRecentScores] = useState<RecentScore[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await apiClient.getScoreStats()
        setStats(response.stats)
        setRecentScores(response.recentScores)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  const getScorePercentage = (score: number, total: number) => {
    return Math.round((score / total) * 100)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-32 bg-muted rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Welcome back, {user?.name}!</h1>
        <p className="text-muted-foreground mt-2">Ready to continue your pharmacy education journey?</p>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-border/50 hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Quiz Game</CardTitle>
                <CardDescription>Test your pharmacy knowledge</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Link href="/student/quiz">
              <Button className="w-full gap-2">
                <Play className="w-4 h-4" />
                Start Quiz
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-border/50 hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Flashcards</CardTitle>
                <CardDescription>Study with interactive cards</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Link href="/student/flashcards">
              <Button variant="outline" className="w-full gap-2 bg-transparent">
                <Play className="w-4 h-4" />
                Study Cards
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Games</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalGames || 0}</div>
            <p className="text-xs text-muted-foreground">Quiz + Flashcard sessions</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flashcard Sessions</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.flashcardGames || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.totalGames ? Math.round(((stats?.flashcardGames || 0) / stats.totalGames) * 100) : 0}% of total
              games
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quiz Sessions</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.quizGames || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.totalGames ? Math.round(((stats?.quizGames || 0) / stats.totalGames) * 100) : 0}% of total games
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(stats?.totalTimeSpent || 0)}</div>
            <p className="text-xs text-muted-foreground">
              Avg:{" "}
              {stats?.totalGames ? formatTime(Math.round((stats?.totalTimeSpent || 0) / stats.totalGames)) : "0m 0s"}
              /session
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Flashcard-specific statistics section */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Flashcard Performance
            </CardTitle>
            <CardDescription>Your flashcard study statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Sessions Completed</span>
                <span className="font-medium">{stats?.flashcardGames || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Average Score</span>
                <span className="font-medium">{Math.round((stats?.averageScore || 0) * 100)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Best Score</span>
                <span className="font-medium">{Math.round((stats?.bestScore || 0) * 100)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Cards Studied</span>
                <span className="font-medium">
                  {recentScores
                    .filter((score) => score.gameType === "flashcard")
                    .reduce((total, score) => total + score.totalQuestions, 0)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Recent Flashcard Activity
            </CardTitle>
            <CardDescription>Your latest flashcard sessions</CardDescription>
          </CardHeader>
          <CardContent>
            {recentScores.filter((score) => score.gameType === "flashcard").length > 0 ? (
              <div className="space-y-3">
                {recentScores
                  .filter((score) => score.gameType === "flashcard")
                  .slice(0, 3)
                  .map((score) => (
                    <div key={score._id} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">
                          {score.category
                            ? score.category.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())
                            : "Mixed"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(score.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{getScorePercentage(score.score, score.totalQuestions)}%</p>
                        <p className="text-xs text-muted-foreground">{score.totalQuestions} cards</p>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <BookOpen className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No flashcard sessions yet</p>
                <Link href="/student/flashcards">
                  <Button size="sm" className="mt-2">
                    Start Studying
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest quiz and flashcard sessions</CardDescription>
        </CardHeader>
        <CardContent>
          {recentScores.length > 0 ? (
            <div className="space-y-4">
              {recentScores.slice(0, 5).map((score) => (
                <div key={score._id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      {score.gameType === "quiz" ? (
                        <Brain className="w-4 h-4 text-primary" />
                      ) : (
                        <BookOpen className="w-4 h-4 text-primary" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium capitalize">{score.gameType}</p>
                      <p className="text-sm text-muted-foreground">
                        {score.category && <span className="capitalize">{score.category.replace("-", " ")} • </span>}
                        {new Date(score.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{getScorePercentage(score.score, score.totalQuestions)}%</p>
                    <p className="text-sm text-muted-foreground">{formatTime(score.timeSpent)}</p>
                  </div>
                </div>
              ))}
              <div className="pt-2">
                <Link href="/student/progress">
                  <Button variant="outline" size="sm">
                    View All Activity
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No activity yet. Start your first game!</p>
              <div className="flex gap-2 justify-center">
                <Link href="/student/quiz">
                  <Button size="sm">Start Quiz</Button>
                </Link>
                <Link href="/student/flashcards">
                  <Button variant="outline" size="sm">
                    Study Cards
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
