import { motion } from "framer-motion";
import { useState } from "react";
import { useGameState } from "../store/gameStore";

const GRID_SIZE = 16; 

export default function Grid() {
    const { phase, addPlayerInput } = useGameState();
    const [activeNode, setActiveNode] = useState(null);
    const [holdStart, setHoldStart] = useState(null);

    console.log("PHASE:", phase);

    const handlePointerDown = (id) => {
        console.log("Phase check (pointer down):", phase);
        if (phase !== "recall") return; 

        setActiveNode(id);
        setHoldStart(performance.now());
    };

    const handlePointerUp = (id) => {
        console.log("Phase check (pointer up):", phase, "holdStart:", holdStart);
        if (phase !== "recall" || holdStart === null) return;

        const duration = performance.now() - holdStart;
        addPlayerInput({
            id,
            duration,
            color: null,
        });

        console.log("INPUT:", id, duration);

        setActiveNode(null);
        setHoldStart(null);
    };

    return (
        <div className="grid grid-cols-4 gap-4 w-[320px] mx-auto mt-10">
            {Array.from({ length: GRID_SIZE }, (_, id) => {
                const isActive = activeNode === id;

                return (
                    <motion.div
                        key={id}
                        onPointerDown={() => handlePointerDown(id)}
                        onPointerUp={() => handlePointerUp(id)}
                        className="w-16 h-16 rounded-full cursor-pointer bg-[#1a1a1a]"
                        animate={{
                            scale: isActive ? 1.2 : 1,
                            opacity: isActive ? 1 : 0.4,
                            boxShadow: isActive
                                ? "0 0 20px #ffffff"
                                : "0 0 0px transparent",
                        }}
                        transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 30,
                        }}
                    />
                );
            })}
        </div>
    );
}