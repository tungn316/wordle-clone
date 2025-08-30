"use client"

import { useEffect, useMemo } from "react"
import type { LetterState } from "@/types/game"

interface KeyboardProps {
  onKeyPress: (key: string) => void
  guesses: string[]
  targetWord: string
}

const KEYBOARD_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "BACKSPACE"],
]

const priority: Record<LetterState, number> = {
  correct: 3,
  present: 2,
  absent: 1,
  empty: 0,
}

export default function Keyboard({
  onKeyPress,
  guesses,
  targetWord,
}: KeyboardProps) {
  const target = (targetWord || "").toUpperCase()

  const letterStates = useMemo(() => {
    const states = new Map<string, LetterState>()

    for (const guessRaw of guesses) {
      const guess = (guessRaw || "").toUpperCase()
      if (guess.length !== 5 || target.length !== 5) continue

      const freq: Record<string, number> = {}
      for (let i = 0; i < 5; i++) {
        const t = target[i]
        freq[t] = (freq[t] || 0) + 1
      }

      const interim: LetterState[] = Array(5).fill("absent")
      for (let i = 0; i < 5; i++) {
        if (guess[i] === target[i]) {
          interim[i] = "correct"
          freq[guess[i]] -= 1
        }
      }

      for (let i = 0; i < 5; i++) {
        if (interim[i] === "correct") continue
        const g = guess[i]
        if (freq[g] > 0) {
          interim[i] = "present"
          freq[g] -= 1
        } else {
          interim[i] = "absent"
        }
      }

      for (let i = 0; i < 5; i++) {
        const ch = guess[i]
        const next = interim[i] as LetterState
        const prev = states.get(ch) || "empty"
        if (priority[next] > priority[prev]) {
          states.set(ch, next)
        }
      }
    }

    return states
  }, [guesses, target])

  const getKeyState = (key: string): LetterState => {
    if (key === "ENTER" || key === "BACKSPACE") return "empty"
    return letterStates.get(key) ?? "empty"
  }

  const getKeyClassName = (key: string): string => {
    const baseClasses =
      "font-bold rounded transition-all duration-200 active:scale-95"
    const keyState = getKeyState(key)

    if (key === "ENTER" || key === "BACKSPACE") {
      return `${baseClasses} px-3 py-4 text-xs bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white hover:bg-gray-400 dark:hover:bg-gray-500`
    }

    let stateClasses = ""
    switch (keyState) {
      case "correct":
        stateClasses = "bg-green-500 text-white hover:bg-green-600"
        break
      case "present":
        stateClasses = "bg-yellow-500 text-white hover:bg-yellow-600"
        break
      case "absent":
        stateClasses = "bg-gray-500 text-white hover:bg-gray-600"
        break
      default:
        stateClasses =
          "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
    }

    return `${baseClasses} px-3 py-4 text-sm min-w-[2.5rem] ${stateClasses}`
  }

  const handleKeyClick = (key: string) => {
    onKeyPress(key)
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const { key } = event

      if (key === "Enter") {
        onKeyPress("ENTER")
        event.preventDefault()
        return
      }

      if (key === "Backspace" || key === "Delete") {
        onKeyPress("BACKSPACE")
        event.preventDefault()
        return
      }

      const ch = key.toUpperCase()
      if (/^[A-Z]$/.test(ch)) {
        onKeyPress(ch)
        event.preventDefault()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onKeyPress])

  return (
    <div className="flex flex-col gap-2">
      {KEYBOARD_ROWS.map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-center gap-1">
          {row.map((key) => (
            <button
              key={key}
              onClick={() => handleKeyClick(key)}
              className={getKeyClassName(key)}
              aria-label={
                key === "BACKSPACE"
                  ? "Delete"
                  : key === "ENTER"
                    ? "Submit"
                    : key
              }
            >
              {key === "BACKSPACE" ? "⌫" : key}
            </button>
          ))}
        </div>
      ))}
    </div>
  )
}
