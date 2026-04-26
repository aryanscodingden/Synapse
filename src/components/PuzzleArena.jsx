import { useEffect, useState } from "react";
import { useGameState } from "../store/gameStore";
import { g, image } from "framer-motion/client";

function formatSeconds(ms) {
    const value = Number(ms);
    if (!Number.isFinite(value) || value < 0) return "0.0";
    return (value / 1000).toFixed(1);
}

function tileImageStyle(tileValue, dim, imageSrc) {
    const idx = Number(tileValue) - 1;
    const row = Math.floor(idx/dim);
    const col = idx % dim;

    const x = dim > 1 ? (col/(dim - 1)) * 100 : 0;
    const y = dim > 1 ?(row/(dim - 1)) * 100 : 0;

    return {
        backgroundImage: `url($(imageSrc))`,
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

    const [dragIndex, setDragIndex] = useState(null);

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
    }, 100);
    
    useEffect(() => {
        const base = board.length === totalTiles
        ? [...board]
        : Array.from({length: totalTiles}, (_,i) => i + 1);
        
        setPool(base);
        setSlots(Array.from({length: totalTiles}, () => null));
        setDragTile(null);
    }, [imageSrc, totalTiles, board]);

    const solvedCount = useMemo(
        () => slots.filter(Boolean).length,
        [slots],
    );

    const moves = useMemo(
        () => totalTiles - pool.length,
        [totalTiles, pool.length],
    );

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
                style={{gridTemplateColumns: `repeat(${dim}, minmax(0,1fr))`}}       
                >
                {board.map((tile, index) => (
                    <div 
                        key={`${index}-${tile}`}
                        draggable
                        onDragStart={() => setDragIndex(index)}
                        onDragEnd={() => setDragIndex(null)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(() => onDrop(index))}
                        className="h-20 w-20 rounded-xl border border-white/20 cursor-grab active:cursor-grabbing"
                        style={tileImageStyle(tile, dim, imageSrc)}
                        />
                ))}
                </div>
        
                <div className="text-center text-sm opactiy-80">
                    <p>Time Left: {formatSeconds(timeLeftMs)}s</p>
                    <p>Solved: {solvedCount}</p>
                    <p>Moves: {moves}</p>
                </div>
        </div>
    )
}
