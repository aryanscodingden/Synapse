import Grid from "./components/grid";
import { useGameState } from "./store/gameStore";
import ReactionArena from "./components/ReactionArena";

export default function App() {
  const mode = useGameState((s) => s.mode);
  const phase = useGameState((s) => s.phase);

  const level = useGameState((s) => s.level);
  const totalLevels = useGameState((s) => s.totalLevels);
  const currentPattern = useGameState((s) => s.currentPattern);
  const playerSequence = useGameState((s) => s.playerSequence);
  const startGame = useGameState((s) => s.startGame);
  const retryLevel = useGameState((s) => s.retryLevel);

  const reaction = useGameState((s) => s.reaction);
  const startReactionGame = useGameState((s) => s.startReactionGame);

  const avg =
    reaction.times.length > 0
      ? Math.round(
          reaction.times.reduce((a, b) => a + b, 0) / reaction.times.length,
        )
      : 0;

  const best =
    reaction.times.length > 0 ? Math.round(Math.min(...reaction.times)) : 0;

  const statusText =
    mode === "reaction"
      ? phase === "playing"
        ? "Tap the blue node as fast as you can"
        : phase === "result"
          ? "Reaction session complete"
          : "Choose a mode"
      : phase === "idle"
        ? "Press Recall Mode"
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

      {!mode && (
        <div className="flex gap-4">
          <button
            onClick={startGame}
            className="bg-black text-white px-4 py-2 rounded"
          >
            Recall Mode
          </button>
          <button
            onClick={startReactionGame}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Reaction Mode
          </button>
        </div>
      )}

      {mode === "recall" && phase === "failed" && (
        <button
          onClick={retryLevel}
          className="bg-white text-black px-4 py-2 rounded"
        >
          Retry Level {level}
        </button>
      )}

      {mode === "recall" && phase === "completed" && (
        <button
          onClick={startGame}
          className="bg-white text-black px-4 py-2 rounded"
        >
          Restart
        </button>
      )}

      {mode === "recall" && <Grid />}
      {mode === "reaction" && <ReactionArena />}

      {mode === "recall" && (
        <>
          <p className="text-sm opacity-80">
            Level: {level}/{totalLevels}
          </p>
          <p className="text-sm opacity-70">Phase: {phase}</p>
          <p className="text-sm opacity-70">{statusText}</p>
          <p className="text-xs opacity-50">
            Progress: {playerSequence.length}/{currentPattern.length}
          </p>
        </>
      )}

      {mode === "reaction" && (
        <>
          <p className="text-sm opacity-80">
            Round: {reaction.round}/{reaction.totalRounds}
          </p>
          <p className="text-sm opacity-70">{statusText}</p>
        </>
      )}

      {mode === "reaction" && phase === "result" && (
        <div className="text-center">
          <p>Average: {avg} ms</p>
          <p>Best: {best} ms</p>
          <button
            onClick={startReactionGame}
            className="mt-3 bg-blue-500 text-white px-4 py-2 rounded"
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
}
