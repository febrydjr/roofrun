"use client"

import GameBoard from "@/components/game-board"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 bg-white dark:bg-gray-900 transition-colors relative overflow-hidden">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-7xl relative z-10">
        <GameBoard />
      </div>
      <BackgroundAnimation />
    </main>
  )
}

function BackgroundAnimation() {
  return (
    <div className="fixed inset-0 z-0">
      {Array.from({ length: 50 }).map((_, i) => {
        const size = Math.random() * 120 + 30
        const opacity = Math.random() * 0.15 + 0.05
        const duration = Math.random() * 30 + 20
        const delay = Math.random() * -30

        return (
          <div
            key={i}
            className="absolute rounded-lg dark:bg-gray-700 bg-gray-200"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              opacity: opacity,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float-${i} ${duration}s linear infinite`,
              animationDelay: `${delay}s`,
            }}
          />
        )
      })}
      <style jsx>{`
        ${Array.from({ length: 50 })
          .map((_, i) => {
            const x = Math.random() * 60 - 30
            const y = Math.random() * 60 - 30
            const rotateStart = Math.random() * 360
            const rotateEnd = rotateStart + 360

            return `
            @keyframes float-${i} {
              0% {
                transform: translate(0, 0) rotate(${rotateStart}deg);
              }
              50% {
                transform: translate(${x}px, ${y}px) rotate(${rotateStart + 180}deg);
              }
              100% {
                transform: translate(0, 0) rotate(${rotateEnd}deg);
              }
            }
          `
          })
          .join("\n")}
      `}</style>
    </div>
  )
}

