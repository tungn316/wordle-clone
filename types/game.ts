export type LetterState = "correct" | "present" | "absent" | "empty"

export type GameStatus = "playing" | "won" | "lost"

export interface GameState {
  board: string[][] // 6x5 characters
  currentRow: number
  currentCol: number
  gameStatus: GameStatus
  targetWord: string
  guesses: string[]
}

export interface LetterResult {
  letter: string
  state: LetterState
}

export interface ApiWordOfDay {
  word: string
  puzzleNumber: number
  validWord?: boolean
}

export interface ApiValidateWord {
  validWord: boolean
}

export type LetterStateMap = Record<string, LetterState>
