"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { RotateCcw, Play, Loader2 } from "lucide-react"
import GameManager from "@/lib/game-manager"
import { cn } from "@/lib/utils"

export default function GameBoard() {
  const [gridSize, setGridSize] = useState(6)
  const [gameState, setGameState] = useState<"idle" | "playing" | "won" | "lost">("idle")
  const [timeLeft, setTimeLeft] = useState(30)
  const [score, setScore] = useState(0)
  const [grid, setGrid] = useState<string[][]>([])
  const gameManagerRef = useRef<GameManager | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const checkMovesTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize game manager on mount
  useEffect(() => {
    gameManagerRef.current = new GameManager(6)
    setGrid(gameManagerRef.current.grid)
  }, [])

  // Start game
  const startGame = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    if (checkMovesTimerRef.current) {
      clearInterval(checkMovesTimerRef.current)
    }

    setScore(0)
    gameManagerRef.current = new GameManager(gridSize)
    setGrid(gameManagerRef.current.grid)
    setGameState("playing")
    setTimeLeft(30)

    // Set up timer for countdown
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current as NodeJS.Timeout)
          setGameState("lost")
          return 0
        }
        return prev - 1
      })
    }, 1000)

    // Set up periodic check for valid moves
    checkMovesTimerRef.current = setInterval(() => {
      if (gameManagerRef.current) {
        const hasValidMoves = gameManagerRef.current.hasValidMoves(gameManagerRef.current.grid)
        if (!hasValidMoves) {
          clearInterval(timerRef.current as NodeJS.Timeout)
          clearInterval(checkMovesTimerRef.current as NodeJS.Timeout)
          setGameState("lost")
        }
      }
    }, 500)
  }

  // Reset game
  const resetGame = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    if (checkMovesTimerRef.current) {
      clearInterval(checkMovesTimerRef.current)
    }
    setGameState("idle")
    setScore(0)
    setTimeLeft(30)

    gameManagerRef.current = new GameManager(gridSize)
    setGrid(gameManagerRef.current.grid)
  }

  // Handle square click
  const handleSquareClick = (row: number, col: number) => {
    if (gameState !== "playing" || !gameManagerRef.current) return

    const result = gameManagerRef.current.handleClick(row, col)

    if (result.validMove) {
      setScore((prev) => prev + result.removedCount * 10)
      setGrid([...gameManagerRef.current.grid])

      // Check win/lose conditions immediately after each move
      if (gameManagerRef.current.checkWinCondition()) {
        clearInterval(timerRef.current as NodeJS.Timeout)
        clearInterval(checkMovesTimerRef.current as NodeJS.Timeout)
        setGameState("won")
      } else if (gameManagerRef.current.checkLoseCondition()) {
        clearInterval(timerRef.current as NodeJS.Timeout)
        clearInterval(checkMovesTimerRef.current as NodeJS.Timeout)
        setGameState("lost")
      }
    }
  }

  // Handle grid size change
  const handleGridSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSize = Number.parseInt(e.target.value)
    setGridSize(newSize)
  }

  // Only regenerate grid when slider is released
  const handleGridSizeChangeComplete = () => {
    if (gameManagerRef.current && gameState !== "playing") {
      gameManagerRef.current = new GameManager(gridSize)
      setGrid(gameManagerRef.current.grid)
    }
  }

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (checkMovesTimerRef.current) {
        clearInterval(checkMovesTimerRef.current)
      }
    }
  }, [])

  return (
    <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-center lg:items-start">
      {/* Left side - Game Board */}
      <div
        className="order-2 lg:order-1 border-2 border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800"
        style={{
          width: "700px",
          height: "700px",
          maxWidth: "calc(100vw - 2rem)",
          maxHeight: "calc(100vw - 2rem)",
        }}
      >
        <div
          className="grid gap-1 w-full h-full"
          style={{
            gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${gridSize}, minmax(0, 1fr))`,
          }}
        >
          {grid.map((row, rowIndex) =>
            row.map((color, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={cn(
                  "rounded-lg transition-all duration-300 cursor-pointer",
                  gameState === "playing" && "hover:brightness-110 hover:scale-105",
                )}
                style={{
                  backgroundColor: color || "transparent",
                  transform: color ? "scale(1)" : "scale(0)",
                }}
                onClick={() => handleSquareClick(rowIndex, colIndex)}
              />
            )),
          )}
        </div>
      </div>

      {/* Right side - Controls */}
      <div className="flex flex-col w-full max-w-sm order-1 lg:order-2">
        <div className="text-left mb-8">
          <div className="uppercase text-sm tracking-wider text-gray-500 dark:text-gray-400 mb-2">Challenge</div>
          <h1 className="text-4xl font-medium mb-4 text-gray-900 dark:text-white">Roofrun</h1>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Click on adjacent squares of the same color to remove them. Clear all squares before time runs out.
          </p>
        </div>

        <div className="flex justify-between items-center mb-8">
          <div className="flex flex-col">
            <div className="text-5xl font-light mb-2 text-gray-900 dark:text-white">{score}</div>
            <div className="uppercase text-sm tracking-wider text-gray-500 dark:text-gray-400">Score</div>
          </div>

          <div className="relative w-24 h-24">
            <svg className="w-full h-full -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="44"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="4"
                className="dark:stroke-gray-700"
              />
              <circle
                cx="48"
                cy="48"
                r="44"
                fill="none"
                stroke="#84cc16"
                strokeWidth="4"
                strokeDasharray={`${2 * Math.PI * 44}`}
                strokeDashoffset={`${2 * Math.PI * 44 * (1 - timeLeft / 30)}`}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-2xl font-light text-gray-900 dark:text-white">{timeLeft}</div>
              <div className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">Seconds</div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between w-full mb-2">
            <span className="text-gray-600 dark:text-gray-300">
              Grid Size: {gridSize}×{gridSize}
            </span>
            <span className="text-gray-400 dark:text-gray-500">5×5 — 12×12</span>
          </div>
          <input
            type="range"
            min="5"
            max="12"
            value={gridSize}
            onChange={handleGridSizeChange}
            onMouseUp={handleGridSizeChangeComplete}
            onTouchEnd={handleGridSizeChangeComplete}
            disabled={gameState === "playing"}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        <div className="flex gap-4">
          <button
            onClick={resetGame}
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex-1"
          >
            <RotateCcw size={18} /> Reset
          </button>
          <button
            onClick={startGame}
            disabled={gameState === "playing"}
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90 transition-colors flex-1 disabled:opacity-80"
          >
            {gameState === "playing" ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Running
              </>
            ) : (
              <>
                <Play size={18} fill="currentColor" />
                Start Game
              </>
            )}
          </button>
        </div>

        {gameState === "won" && <div className="mt-4 text-center text-green-500 font-bold">You won! 🎉</div>}
        {gameState === "lost" && <div className="mt-4 text-center text-red-500 font-bold">Game over! Try again.</div>}
      </div>
    </div>
  )
}

