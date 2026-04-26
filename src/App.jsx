import { useEffect, useRef } from "react";
import Grid from "./components/grid";
import { useGameState } from "./store/gameStore";
import ReactionArena from "./components/ReactionArena";
import {
  calcAverageMs,
  calcBestMs,
  calcConsistencyScore,
} from "./utils/reactionStats";
import { saveReactionSession } from "./utils/reactionMetricsDb";
import PuzzleArena from "./components/PuzzleArena";

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
  const puzzle = useGameState((s) => s.puzzle);
  const startPuzzleGame = useGameState((s) => s.startPuzzleGame);
  const avg = calcAverageMs(reaction.times);
  const best = calcBestMs(reaction.times);
  const consistency = calcConsistencyScore(reaction.times);
  const savedResultRef = useRef(false);

  useEffect(() => {
    if (mode === "reaction" && phase === "playing") {
      savedResultRef.current = false;
      return;
    }

    if (mode !== "reaction" || phase !== "result") return;
    if (savedResultRef.current) return;
    if (reaction.times.length === 0) return;

    const session = {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      created_at: new Date().toISOString(),
      reaction_time_ms: avg,
      false_starts: reaction.falseStarts,
      consistency,
      times_ms: reaction.times,
    };

    saveReactionSession(session);
    savedResultRef.current = true;
  }, [mode, phase, reaction.times, reaction.falseStarts, avg, consistency]);

  const statusText =
    mode === "reaction"
      ? phase === "playing"
        ? "Tap when green as fast as you can"
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
          <button
            onClick={startPuzzleGame}
            className="bg-emerald-600 text-white px-4 py-2 rounded"
          >
            Puzzle Mode
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

      {mode === "puzzle" && <PuzzleArena />}

      {mode === "puzzle" && (
        <>
          <p className="text-sm opacity-80">Solved: {puzzle.solvedCount}</p>
          <p className="text-sm opacity-70">{statusText}</p>
        </>
      )}

      {mode === "puzzle" && phase === "result" && (
        <div className="text-center">
          <p>Solved: {puzzle.solvedCount}</p>
          <p>Total Shown: {puzzle.totalShown}</p>
          <p>Moves: {puzzle.moves}</p>
          <button
            onClick={startPuzzleGame}
            className="mt-3 bg-emerald-600 text-white px-4 py-2 rounded"
          >
            Play Again
          </button>
        </div>
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
          <p>False starts: {reaction.falseStarts}</p>
          <p>Consistency: {consistency}</p>
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

