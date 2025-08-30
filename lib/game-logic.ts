import type { LetterState, LetterResult } from "@/types/game"

// TODO: Implement your game logic functions here

export const WORD_LENGTH = 5
export const MAX_GUESSES = 6

// TODO: Add your word list here
export const VALID_WORDS: string[] = [
  // Add your list of valid 5-letter words
  "ABOUT",
  "ABOVE",
  "ABUSE",
  "ACTOR",
  "ACUTE",
  "ADMIT",
  "ADOPT",
  "ADULT",
  "AFTER",
  "AGAIN",
  // ... add more words
]

export const TARGET_WORDS: string[] = [
  // Add your list of possible target words (subset of VALID_WORDS)
  "ABOUT",
  "ABOVE",
  "ABUSE",
  "ACTOR",
  "ACUTE",
  // ... add more words
]

export function getRandomTargetWord(): string {
  // TODO: Return a random word from TARGET_WORDS
  return TARGET_WORDS[Math.floor(Math.random() * TARGET_WORDS.length)]
}

export function isValidWord(word: string): boolean {
  // TODO: Check if the word is in VALID_WORDS
  return VALID_WORDS.includes(word.toUpperCase())
}

export function checkGuess(guess: string, targetWord: string): LetterResult[] {
  // TODO: Implement the core Wordle logic
  // For each letter in the guess, determine if it's:
  // - 'correct': right letter in right position
  // - 'present': right letter in wrong position
  // - 'absent': letter not in target word

  const result: LetterResult[] = []
  const guessArray = guess.toUpperCase().split("")
  const targetArray = targetWord.toUpperCase().split("")

  // TODO: Implement your logic here
  // Hint: You'll need to handle duplicate letters correctly

  return result
}

export function isGameWon(guess: string, targetWord: string): boolean {
  // TODO: Check if the guess matches the target word
  return guess.toUpperCase() === targetWord.toUpperCase()
}

export function getKeyboardState(guesses: string[], targetWord: string): Map<string, LetterState> {
  // TODO: Return the state of each letter on the keyboard
  // based on all previous guesses
  const keyStates = new Map<string, LetterState>()

  // TODO: Implement logic to track keyboard states

  return keyStates
}
