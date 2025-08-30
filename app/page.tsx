"use client"

import { useEffect, useState, useCallback } from "react"
import GameBoard from "@/components/game-board"
import Keyboard from "@/components/keyboard"
import type { GameState, LetterState, ApiWordOfDay, ApiValidateWord } from "@/types/game"

const ROWS = 6
const COLS = 5

export default function WordleGame() {
  const [gameState, setGameState] = useState<GameState>({
    board: Array.from({ length: ROWS }, () => Array(COLS).fill("")),
    currentRow: 0,
    currentCol: 0,
    gameStatus: "playing", // 'playing' | 'won' | 'lost'
    targetWord: "",
    guesses: [], // store per-letter states for each submitted guess
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTargetWord = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch("https://words.dev-apis.com/word-of-the-day", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      })
      if (!res.ok) throw new Error(`Failed to fetch target word: ${res.status}`)
      const data: ApiWordOfDay = await res.json()
      const target = data.word?.toUpperCase?.() ?? ""
      console.log(target)
      if (!target || target.length !== COLS) {
        throw new Error("Invalid target word received from API")
      }
      setGameState((prev) => ({
        ...prev,
        board: Array.from({ length: ROWS }, () => Array(COLS).fill("")),
        currentRow: 0,
        currentCol: 0,
        gameStatus: "playing",
        targetWord: target,
        guesses: [],
      }))
    } catch (e: any) {
      setError(e?.message || "Failed to load word of the day")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTargetWord()
  }, [fetchTargetWord])

  const validateWord = async (word: string): Promise<boolean> => {
    try {
      const res = await fetch("https://words.dev-apis.com/validate-word", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word }),
      })
      if (!res.ok) return false
      const data: ApiValidateWord = await res.json()
      return !!data.validWord
    } catch {
      return false
    }
  }

  const checkGuess = (guess: string): LetterState[] => {
    const target = gameState.targetWord
    const result: LetterState[] = Array(COLS).fill("absent") as LetterState[]

    const freq: Record<string, number> = {}
    for (let i = 0; i < COLS; i++) {
      const t = target[i]
      freq[t] = (freq[t] || 0) + 1
    }

    // greens
    for (let i = 0; i < COLS; i++) {
      if (guess[i] === target[i]) {
        result[i] = "correct"
        freq[guess[i]] -= 1
      }
    }

    // yellows
    for (let i = 0; i < COLS; i++) {
      if (result[i] === "correct") continue
      const g = guess[i]
      if (freq[g] > 0) {
        result[i] = "present"
        freq[g] -= 1
      } else {
        result[i] = "absent"
      }
    }

    return result
  }

  const isGameOver = (states: LetterState[], row: number): "won" | "lost" | "playing" => {
    const won = states.every((s) => s === "correct")
    if (won) return "won"
    if (row >= ROWS - 1) return "lost"
    return "playing"
  }

  const commitGuess = async () => {
    const { currentRow, board } = gameState
    const guess = board[currentRow].join("").toUpperCase()

    if (guess.length !== 5 || board[currentRow].some((c) => c === "")) {
      return
    }

    const isValid = await validateWord(guess.toLowerCase())
    if (!isValid) {
      console.warn("Invalid word:", guess)
      return
    }

    const states = checkGuess(guess)
    const status = isGameOver(states, currentRow)
    const isLastRow = gameState.currentRow >= ROWS - 1
    const nextRow =
      status === "playing"
        ? gameState.currentRow + 1
        :
        isLastRow
          ? gameState.currentRow
          : gameState.currentRow + 1

    setGameState((prev) => ({
      ...prev,
      guesses: [...prev.guesses, guess],
      currentRow: nextRow,
      currentCol: 0,
      gameStatus: status,
    }))
  }

  const handleKeyPress = useCallback((rawKey: string) => {
    if (gameState.gameStatus !== "playing" || loading) return

    const key = rawKey.toUpperCase()
    const { currentRow, currentCol, board } = gameState

    if (key === "BACKSPACE") {
      if (currentCol > 0) {
        const nextBoard = board.map((r) => [...r])
        nextBoard[currentRow][currentCol - 1] = ""
        setGameState((prev) => ({
          ...prev,
          board: nextBoard,
          currentCol: prev.currentCol - 1,
        }))
      }
      return
    }

    if (key === "ENTER") {
      commitGuess()
      return
    }

    if (/^[A-Z]$/.test(key)) {
      if (currentCol < COLS) {
        const nextBoard = board.map((r) => [...r])
        nextBoard[currentRow][currentCol] = key
        setGameState((prev) => ({
          ...prev,
          board: nextBoard,
          currentCol: Math.min(prev.currentCol + 1, COLS),
        }))
      }
      return
    }

  }, [gameState, loading])

  const resetGame = () => {
    fetchTargetWord()
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col">
      <header className="border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Wordle Clone
          </h1>
          <button
            onClick={resetGame}
            className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            disabled={loading}
          >
            {loading ? "Loading..." : "New Game"}
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 gap-8">
        <div className="w-full max-w-md">
          {gameState.gameStatus !== "playing" && (
            <div className="text-center mb-4">
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {gameState.gameStatus === "won" ? "🎉 You Won!" : "😔 Game Over"}
              </p>
              {gameState.gameStatus === "lost" && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  The word was:{" "}
                  <span className="font-bold">{gameState.targetWord}</span>
                </p>
              )}
            </div>
          )}

          {error && (
            <div className="text-center mb-4 text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <GameBoard
            board={gameState.board}
            currentRow={gameState.currentRow}
            currentCol={gameState.currentCol}
            targetWord={gameState.targetWord}
          />
        </div>

        <div className="w-full max-w-lg">
          <Keyboard
            onKeyPress={handleKeyPress}
            guesses={gameState.guesses}
            targetWord={gameState.targetWord}
          />
        </div>
      </main>

      <footer className="p-4 text-center text-sm text-gray-600 dark:text-gray-400">
        <p>Guess the word in 6 tries. Each guess must be a valid 5-letter word.</p>
      </footer>
    </div>
  )
}
