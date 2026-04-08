import Grid from "./components/grid";
import { useGameState } from "./store/gameStore"
import { generateSequence } from "./utils/sequence"

export default function App() {
  const phase = useGameState((s) => s.phase);
  const setPhase = useGameState((s) => s.setPhase)
  const setFlashSequence = useGameState((s) => s.setFlashSequence)

  const startGame = () => {
    const sequence = generateSequence(3); 

    setFlashSequence(sequence);
    setPhase("watch")
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6">
      <h1 className="text-2xl font-bold">Synapse</h1>
      <button
        onClick={startGame}
        className="bg-white text-black px-4 py-2 rounded"
        >
          Start Game
        </button>
        <Grid/>
        <p className="text-sm opacity-60">Phase: {phase}</p>
    </div>
  )

}