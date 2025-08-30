import type { LetterState } from "@/types/game"

interface GameBoardProps {
  board: string[][]
  currentRow: number
  currentCol: number
  targetWord: string
}

export default function GameBoard({
  board,
  currentRow,
  currentCol,
  targetWord,
}: GameBoardProps) {
  const ROWS = board.length
  const COLS = board[0]?.length ?? 5
  const target = (targetWord || "").toUpperCase()

  const computeRowStates = (rowIndex: number): LetterState[] => {
    const guessArr = board[rowIndex]
    const guess = guessArr.join("").toUpperCase()

    const isSubmitted =
      rowIndex < currentRow && guessArr.every((c) => c && c.length === 1)
    if (!isSubmitted || target.length !== COLS) {
      return Array(COLS).fill("empty") as LetterState[]
    }

    const result: LetterState[] = Array(COLS).fill("absent") as LetterState[]

    const freq: Record<string, number> = {}
    for (let i = 0; i < COLS; i++) {
      const t = target[i]
      freq[t] = (freq[t] || 0) + 1
    }

    for (let i = 0; i < COLS; i++) {
      if (guess[i] === target[i]) {
        result[i] = "correct"
        freq[guess[i]] -= 1
      }
    }

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

  const getLetterState = (row: number, col: number): LetterState => {
    if (row >= currentRow) {
      return board[row][col] ? "empty" : "empty"
    }
    const states = computeRowStates(row)
    return states[col]
  }

  const getTileClassName = (row: number, col: number): string => {
    const baseClasses =
      "w-14 h-14 border-2 flex items-center justify-center text-2xl font-bold transition-all duration-300"
    const letterState = getLetterState(row, col)
    const isCurrentCell = row === currentRow && col === currentCol
    const hasLetter = !!board[row][col]

    let stateClasses = ""
    switch (letterState) {
      case "correct":
        stateClasses = "bg-green-500 border-green-500 text-white"
        break
      case "present":
        stateClasses = "bg-yellow-500 border-yellow-500 text-white"
        break
      case "absent":
        stateClasses = "bg-gray-500 border-gray-500 text-white"
        break
      default:
        if (hasLetter) {
          stateClasses =
            "border-gray-400 dark:border-gray-600 bg-white dark:bg-gray-800"
        } else {
          stateClasses =
            "border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
        }
    }

    const currentClasses = isCurrentCell
      ? "border-gray-600 dark:border-gray-400"
      : ""

    return `${baseClasses} ${stateClasses} ${currentClasses}`
  }

  return (
    <div className="grid grid-rows-6 gap-2 p-4">
      {board.map((row, rowIndex) => (
        <div key={rowIndex} className="grid grid-cols-5 gap-2">
          {row.map((letter, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={getTileClassName(rowIndex, colIndex)}
            >
              <span className="text-gray-900 dark:text-white">
                {letter.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
