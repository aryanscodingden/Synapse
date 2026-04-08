import './App.css'
import Grid from './components/grid'
import { useGameState } from "./store/gameStore";

export default function App() {
  const { phase, setPhase } = useGameState();

  return (
    <div className='min-h-screen flex flex-col items-center justify-center gap-6'>
      <h1 className='text-2xl font-bold'>Synapse</h1>
      <button
        onClick={() => setPhase("recall")}
        className='bg-white text-black px-4 py-2 rounded'
      >
        Start Recall
      </button>
      <Grid />
      <p className='text-sm opacity-60'>Phase: {phase}</p>
    </div>
  );
}