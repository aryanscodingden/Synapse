import { useEffect } from "react";
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

function beep(type = "ok") {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type === "ok" ? "triangle" : "sawtooth";
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

  const dim = Number.isFinite(puzzle?.dim) ? puzzle.dim : 3;
  const board = Array.isArray(puzzle?.board) ? puzzle.board : [];
  const imageSrc = puzzle?.imageSrc || "";
  const timeLeftMs = Number.isFinite(puzzle?.timeLeftMs) ? puzzle.timeLeftMs : 0;

  const totalTiles = dim * dim;

  useEffect(() => {
    if (mode !== "puzzle" || phase !== "playing") return;

    const id = window.setInterval(() => {
      tickPuzzleTimer(100);
    }, 100);

    return () => window.clearInterval(id);
  }, [mode, phase, tickPuzzleTimer]);

  const onDropToSlot = (fromIndex, toIndex) => {
    if (!Number.isInteger(fromIndex)) return;
    if (!Number.isInteger(toIndex)) return;
    if (fromIndex === toIndex) return;
    swapPuzzleTiles(fromIndex, toIndex);
  };

  // const onPoolTileDragStart = (e, tileValue) => {
  //   e.dataTransfer.setData("tileId", String(tileValue));
  // };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div
        className="border-4 border-white/50 rounded-lg p-3 bg-white/5"
        style={{
          width: "min(94vw, 760px)",
        }}
      >
        <div
          className="grid gap-2"
          style={{
            gridTemplateColumns: `repeat(${dim}, minmax(0, 1fr))`,
            aspectRatio: "1",
          }}
        >
          {Array.from({ length: totalTiles }, (_, i) => {
            const tile = board[i];
            return (
              <div
                key={`slot-${i}`}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData("fromIndex", String(i));
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const fromIndex = Number(e.dataTransfer.getData("fromIndex"));
                  onDropToSlot(fromIndex, i);
                }}
                className="aspect-square border border-white/30 rounded-lg bg-white/5 cursor-grab active:cursor-grabbing"
                style={tile != null ? tileImageStyle(tile, dim, imageSrc) : {}}
              />
            );
          })}
        </div>
      </div>

      {/*
      <div>
        <p className="text-xs opacity-60 mb-2">Drag tiles to correct positions:</p>
        <div
          className="grid gap-2"
          style={{
            gridTemplateColumns: `repeat(${Math.min(dim, 5)}, minmax(0, 1fr))`,
          }}
        >
          {pool.map((tile) => (
            <div
              key={`pool-${tile}`}
              draggable
              onDragStart={(e) => onPoolTileDragStart(e, tile)}
              className="aspect-square border-2 border-white/50 rounded-lg cursor-grab active:cursor-grabbing shadow-lg"
              style={tileImageStyle(tile, dim, imageSrc)}
            />
          ))}
        </div>
      </div>
      */}

      <div className="text-center text-sm opacity-80 mt-2">
        <p>Time: {formatSeconds(timeLeftMs)}</p>
        <p>Moves: {puzzle?.moves ?? 0}</p>
      </div>
    </div>
  );
}