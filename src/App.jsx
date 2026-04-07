import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

import { useGameState } from "./store/gameStore";

export default function App() {
  const { round, nextRound } = useGameState();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-2xl">Round: {round}</h1>
      <button
        onClick={nextRound}
        className="bg-white text-black px-4 py-2 rounded"
      >
        Next Round
      </button>
    </div>
  );
}
