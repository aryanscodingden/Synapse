import { useState } from "react";
import { useGameState } from "../store/gameStore";

function formatSeconds(ms) {
    const value = Number(ms);
    if (!Number.isFinite(value) || value < 0) return "0.0";
    return (value / 1000).toFixed(1);
}

export default function PuzzleArena() {
    const mode = useGameState((s) => s.mode)
    const puzzle = useGameState((s) => s.puzzle);
    const phase = useGameState((s) => s.phase);
    const tickPuzzleTimer = useGameState((s) => s.tickPuzzleTimer);
    const swapPuzzleTiles = useGameState((s) => s.swapPuzzleTiles);

    const [dragIndex, setDragIndex] = useState(null);

    const board = Array.isArray(puzzle?.board) ? puzzle.board : [];
    const timeLeftMs = Number.isFinite(puzzle?.timeLeftMs) ? puzzle.timeLeftMs : 0;
    const solvedCount = Number.isFinite(puzzle?.solvedCount) ? puzzle.solvedCount : 0;
    const moves = Number.isFinite(puzzle?.moves) ? puzzle.moves : 0;

    useEffect(() => {
        if (mode !== "puzzle" || phase !== "playing") return;

        const id = window.setInterval(() => {
            tickPuzzleTimer(100)
        })
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
            <p className="text-sm opacity-70">Drag any tile onto another tile to swap</p>

            <div 
                className="grid gap-3"
                style={{gridTemplateColumns: "repeat(3, minmax(0,1fr))"}}
                >
                    {board.map((tile, index) => (
                        <div 
                            key={`${index}-${tile}`}
                            draggable
                            onDragStart={() => setDragIndex(index)}
                            onDragEnd={() => setDragIndex(null)}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={() => onDrop(index)}
                            className="h-20 w-20 rounded-xl border border-white/20 bg-slate-800 text-white flex items-center justify-center text-2xl font-bold cursor-grab active:cursor-grabbing"
                            >
                                {tile}
                         </div>
                    ))}
        </div>

        <div className="text-center text-sm opacity-80">
            <p> Time left: {formatSeconds(timeLeftMs)}s </p>
            <p>Solved: {solvedCount}</p>
            <p>Moves: {moves}</p>
        </div>
        </div>
    )
}