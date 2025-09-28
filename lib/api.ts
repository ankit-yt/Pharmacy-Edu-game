// API configuration for backend communication
const API_BASE_URL =  "https://pharmacy-edu-game.onrender.com/api"

export class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor() {
    this.baseURL = API_BASE_URL
    // Get token from localStorage if available
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("token")
    }
  }

  setToken(token: string) {
    this.token = token
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token)
    }
  }

  clearToken() {
    this.token = null
    if (typeof window !== "undefined") {
      localStorage.removeItem("token")
    }
  }

  request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    return fetch(url, {
      ...options,
      headers,
    }).then(async (response) => {
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Network error" }))
        throw new Error(error.message || "Request failed")
      }

      return response.json()
    })
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
  }

  async register(name: string, email: string, password: string, role = "student") {
    return this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password, role }),
    })
  }

  async getProfile() {
    return this.request("/auth/profile")
  }

  // Questions endpoints
  async getQuestions(category?: string, difficulty?: string) {
    const params = new URLSearchParams()
    if (category) params.append("category", category)
    if (difficulty) params.append("difficulty", difficulty)

    return this.request(`/questions?${params.toString()}`)
  }

  async createQuestion(question: any) {
    return this.request("/questions", {
      method: "POST",
      body: JSON.stringify(question),
    })
  }

  async updateQuestion(id: string, question: any) {
    return this.request(`/questions/${id}`, {
      method: "PUT",
      body: JSON.stringify(question),
    })
  }

  async deleteQuestion(id: string) {
    return this.request(`/questions/${id}`, {
      method: "DELETE",
    })
  }

  // Flashcard endpoints
  async getFlashcards(category?: string, difficulty?: string) {
    const params = new URLSearchParams()
    if (category) params.append("category", category)
    if (difficulty) params.append("difficulty", difficulty)

    return this.request(`/flashcards?${params.toString()}`)
  }

  async getFlashcard(id: string) {
    return this.request(`/flashcards/${id}`)
  }

  async createFlashcard(flashcard: any) {
    return this.request("/flashcards", {
      method: "POST",
      body: JSON.stringify(flashcard),
    })
  }

  async updateFlashcard(id: string, flashcard: any) {
    return this.request(`/flashcards/${id}`, {
      method: "PUT",
      body: JSON.stringify(flashcard),
    })
  }

  async deleteFlashcard(id: string) {
    return this.request(`/flashcards/${id}`, {
      method: "DELETE",
    })
  }

  async getFlashcardStats() {
    return this.request("/flashcards/admin/stats")
  }

  // Scores endpoints
  async submitScore(gameType: string, score: number, totalQuestions: number, timeSpent: number) {
    return this.request("/scores", {
      method: "POST",
      body: JSON.stringify({ gameType, score, totalQuestions, timeSpent }),
    })
  }

  async getScores(userId?: string) {
    const params = userId ? `?userId=${userId}` : ""
    return this.request(`/scores${params}`)
  }

  async getScoreStats(userId?: string) {
    const params = userId ? `?userId=${userId}` : ""
    return this.request(`/scores/stats${params}`)
  }

  // Admin endpoints
  async getAllUsers() {
    return this.request("/admin/users")
  }

  async getUserStats() {
    return this.request("/admin/stats")
  }
}

export const apiClient = new ApiClient()

export const api = {
  get: (endpoint: string, options?: { params?: Record<string, any> }) => {
    let url = endpoint
    if (options?.params) {
      const filteredParams = Object.entries(options.params)
        .filter(([_, value]) => value !== undefined && value !== null && value !== "")
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})

      if (Object.keys(filteredParams).length > 0) {
        url = `${endpoint}?${new URLSearchParams(filteredParams).toString()}`
      }
    }
    return apiClient.request(url, { method: "GET" })
  },
  post: (endpoint: string, data?: any) => {
    return apiClient.request(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    })
  },
  put: (endpoint: string, data?: any) => {
    return apiClient.request(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  },
  delete: (endpoint: string) => {
    return apiClient.request(endpoint, { method: "DELETE" })
  },
}

// Make request method public for the api object
declare module "./api" {
  interface ApiClient {
    request(endpoint: string, options?: RequestInit): Promise<any>
  }
}

Object.defineProperty(ApiClient.prototype, "request", {
  enumerable: true,
  configurable: true,
  writable: true,
})
