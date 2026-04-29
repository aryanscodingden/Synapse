import { useEffect, useRef, useState } from "react";
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

export default function PuzzleArena() {
  const mode = useGameState((s) => s.mode);
  const phase = useGameState((s) => s.phase);
  const puzzle = useGameState((s) => s.puzzle);
  const tickPuzzleTimer = useGameState((s) => s.tickPuzzleTimer);
  const swapPuzzleTiles = useGameState((s) => s.swapPuzzleTiles);

  const [selectedIndex, setSelectedIndex] = useState(null);
  const lastTickRef = useRef(null);

  const dim = Number.isFinite(puzzle?.dim) ? puzzle.dim : 3;
  const board = Array.isArray(puzzle?.board) ? puzzle.board : [];
  const imageSrc = puzzle?.imageSrc || "";
  const timeLeftMs = Number.isFinite(puzzle?.timeLeftMs) ? puzzle.timeLeftMs : 0;
  const isPlaying = mode === "puzzle" && phase === "playing";
  const totalTiles = dim * dim;

  useEffect(() => {
    if (!isPlaying) {
      lastTickRef.current = null;
      return;
    }

    lastTickRef.current = performance.now();

    const id = window.setInterval(() => {
      const now = performance.now();
      const previous = lastTickRef.current ?? now;
      lastTickRef.current = now;
      tickPuzzleTimer(now - previous);
    }, 100);

    return () => {
      window.clearInterval(id);
      lastTickRef.current = null;
    };
  }, [isPlaying, tickPuzzleTimer]);

  const onSwapRequest = (fromIndex, toIndex) => {
    if (!isPlaying) return;
    if (!Number.isInteger(fromIndex) || !Number.isInteger(toIndex)) return;
    if (fromIndex === toIndex) return;
    swapPuzzleTiles(fromIndex, toIndex);
    setSelectedIndex(null);
  };

  const onTilePress = (index) => {
    if (!isPlaying) return;

    if (selectedIndex === null) {
      setSelectedIndex(index);
      return;
    }

    if (selectedIndex === index) {
      setSelectedIndex(null);
      return;
    }

    onSwapRequest(selectedIndex, index);
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div
        className="border-4 border-white/50 rounded-lg p-3 bg-white/5"
        style={{ width: "min(94vw, 760px)" }}
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
            const isSelected = selectedIndex === i;

            return (
              <button
                key={`slot-${i}`}
                type="button"
                draggable={isPlaying}
                onClick={() => onTilePress(i)}
                onDragStart={(e) => {
                  if (!isPlaying) return;
                  e.dataTransfer.setData("fromIndex", String(i));
                }}
                onDragOver={(e) => {
                  if (isPlaying) e.preventDefault();
                }}
                onDrop={(e) => {
                  if (!isPlaying) return;
                  e.preventDefault();
                  const fromIndex = Number(e.dataTransfer.getData("fromIndex"));
                  onSwapRequest(fromIndex, i);
                }}
                className={`aspect-square rounded-lg border bg-white/5 outline-none transition ${
                  isSelected
                    ? "border-emerald-300 ring-2 ring-emerald-400/70"
                    : "border-white/30"
                } ${
                  isPlaying
                    ? "cursor-pointer active:scale-[0.98]"
                    : "cursor-default"
                }`}
                style={tile != null ? tileImageStyle(tile, dim, imageSrc) : {}}
                aria-label={`Puzzle tile ${tile ?? i + 1}`}
              />
            );
          })}
        </div>
      </div>

      <div className="text-center text-sm opacity-80 mt-2">
        <p>Time: {formatSeconds(timeLeftMs)}</p>
        <p>Moves: {puzzle?.moves ?? 0}</p>
        {isPlaying && (
          <p className="opacity-70">
            Tap two tiles to swap, or drag one tile onto another.
          </p>
        )}
      </div>
    </div>
  );
}
