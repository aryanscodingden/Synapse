import Grid from "./components/grid";
import { useGameState } from "./store/gameStore";

export default function App() {
  const phase = useGameState((s) => s.phase);
  const level = useGameState((s) => s.level);
  const totalLevels = useGameState((s) => s.totalLevels);
  const currentPattern = useGameState((s) => s.currentPattern);
  const playerSequence = useGameState((s) => s.playerSequence);
  const startGame = useGameState((s) => s.startGame);
  const retryLevel = useGameState((s) => s.retryLevel);

  const statusText =
    phase === "idle"
      ? "Press Start Game"
      : phase === "watch"
        ? "Memorize the pattern"
        : phase === "recall"
          ? "Repeat the same nodes"
          : phase === "failed"
            ? "Wrong node. Try this level again."
            : "You completed all levels!";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6">
      <h1 className="text-2xl font-bold">Synapse</h1>

      {phase === "idle" && (
        <button
          onClick={startGame}
          className="bg-white text-black px-4 py-2 rounded"
        >
          Start Game
        </button>
      )}

      {phase === "failed" && (
        <button
          onClick={retryLevel}
          className="bg-white text-black px-4 py-2 rounded"
        >
          Retry Level {level}
        </button>
      )}

      {phase === "completed" && (
        <button
          onClick={startGame}
          className="bg-white text-black px-4 py-2 rounded"
        >
          Restart
        </button>
      )}

      <Grid />
      <p className="text-sm opacity-80">Level: {level}/{totalLevels}</p>
      <p className="text-sm opacity-70">Phase: {phase}</p>
      <p className="text-sm opacity-70">{statusText}</p>
      <p className="text-xs opacity-50">
        Progress: {playerSequence.length}/{currentPattern.length}
      </p>
    </div>
  );
}