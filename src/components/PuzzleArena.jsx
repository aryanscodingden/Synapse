import { useEffect, useState } from "react";
import { useGameState } from "../store/gameStore";

function formatSeconds(ms) {
  const value = Number(ms);
  if (!Number.isFinite(value) || value < 0) return "0.0";
  return (value / 1000).toFixed(1);
}

function tileImageStyle(tileValue, dim, imageSrc) {
  const idx = Number(tileValue) - 1;
  const row = Math.floor(idx / dim);
  const col = idx % dim;

  const x = dim > 1 ? (col / (dim - 1)) * 100 : 0;
  const y = dim > 1 ? (row / (dim - 1)) * 100 : 0;

  return {
    backgroundImage: `url(${imageSrc})`,
    backgroundSize: `${dim * 100}% ${dim * 100}%`,
    backgroundPosition: `${x}% ${y}%`,
    backgroundRepeat: "no-repeat",
  };
}

function beep(type="ok") {
    try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type === "ok" ? "triangle" : "sawtooth";
        osc.frequency.value = type === "ok" ? 820 : 220;
        gain.gain.value = 0.045;

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + (type === "ok" ? 0.09 : 0.07));
    } catch {
        // NA
    }
}

export default function PuzzleArena() {
  const mode = useGameState((s) => s.mode);
  const phase = useGameState((s) => s.phase);
  const puzzle = useGameState((s) => s.puzzle);
  const tickPuzzleTimer = useGameState((s) => s.tickPuzzleTimer);
  const swapPuzzleTiles = useGameState((s) => s.swapPuzzleTiles);

  const [dragIndex, setDragIndex] = useState(null);

  const totalTiles = dim * dim;
  const [slots, setSlots] = useState([]);
  const [pool, setPool] = useState([]);
  const [moves, setMoves] = useState(0);
  const [dragTile, setDragTile] = useState(null);

  const dim = Number.isFinite(puzzle?.dim) ? puzzle.dim : 3;
  const board = Array.isArray(puzzle?.board) ? puzzle.board : [];
  const imageSrc = puzzle?.imageSrc || "";
  const timeLeftMs = Number.isFinite(puzzle?.timeLeftMs) ? puzzle.timeLeftMs : 0;
  const solvedCount = Number.isFinite(puzzle?.solvedCount) ? puzzle.solvedCount : 0;
  const moves = Number.isFinite(puzzle?.moves) ? puzzle.moves : 0;

  useEffect(() => {
    if (mode !== "puzzle" || phase !== "playing") return;

    const id = window.setInterval(() => {
      tickPuzzleTimer(100);
    }, 100);

    return () => window.clearInterval(id);
  }, [mode, phase, tickPuzzleTimer]);

  useEffect(() => {
    const startPool = 
        board.length === totalTiles
        ? [...board]
        : Array.from({length: totalTiles}, (_, i) => i + 1);

    setPool(startPool);
    setSlots(Array.from({length: totalTiles}, () => null));
    setMoves(0);
    setDragIndex(null);
  }, [imageSrc, totalTiles, board]);

  const placedCount = useMemo(
    () => slots.reduce((n, v) => (v == null ? n : n + 1), 0),
    [slots]
  );

  useEffect(() => {
    if (phase !== "playing") return;
    
  })

  const onDrop = (toIndex) => {
    if (!Number.isInteger(dragIndex)) return;
    if (!Number.isInteger(toIndex)) return;
    if (dragIndex === toIndex) {
      setDragIndex(null);
      return;
    }

    swapPuzzleTiles(dragIndex, toIndex);
    setDragIndex(null);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-sm opacity-70">
        Drag any tile onto another tile to swap
      </p>


      <div
        className="grid gap-3"
        style={{
            width: "min(94vw, 720px)",
            gridTemplateColumns: `repeat(${dim}, minmax(0,1fr))`
        }}
      >
        {board.map((tile, index) => (
          <div
            key={`${index}-${tile}`}
            draggable
            onDragStart={() => setDragIndex(index)}
            onDragEnd={() => setDragIndex(null)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => onDrop(index)}
            className="aspect-square w-full rounded-xl border border-white/25 bh-white/5 p-4 shadow-lg"
            style={tileImageStyle(tile, dim, imageSrc)}
          />
        ))}
      </div>

      <div className="text-center text-sm opacity-80">
        <p>Time left: {formatSeconds(timeLeftMs)}s</p>
        <p>Solved: {solvedCount}</p>
        <p>Moves: {moves}</p>
      </div>
    </div>
  );
}
