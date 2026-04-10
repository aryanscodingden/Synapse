import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useGameState } from "../store/gameStore";

const GRID_SIZE = 16;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default function Grid() {
    const phase = useGameState((s) => s.phase);
    const currentPattern = useGameState((s) => s.currentPattern);
    const setPhase = useGameState((s) => s.setPhase);
    const submitRecallInput = useGameState((s) => s.submitRecallInput);

    const [activeNode, setActiveNode] = useState(null);
    const [activeColor, setActiveColor] = useState("#4da6ff");

    useEffect(() => {
        if (phase !== "watch" || currentPattern.length === 0) return;

        let cancelled = false;

        const playPattern = async () => {
            for (const id of currentPattern) {
                if (cancelled) return;

                setActiveNode(id);
                setActiveColor("#4da6ff");
                await sleep(320);

                setActiveNode(null);
                await sleep(140);
            }

            if (!cancelled) {
                setPhase("recall");
            }
        };

        playPattern();
        return () => {
            cancelled = true;
        };
    }, [phase, currentPattern, setPhase]);

    const handlePointerDown = (id) => {
        if (phase !== "recall") return;

        setActiveColor("#ffd24d");
        setActiveNode(id);
        submitRecallInput(id);

        setTimeout(() => {
            setActiveNode(null);
        }, 140);
    };

    return (
        <div className="grid grid-cols-4 gap-4 w-[320px] mx-auto mt-10">
            {Array.from({ length: GRID_SIZE }, (_, id) => {
                const isActive = activeNode === id;

                return (
                    <motion.div
                        key={id}
                        onPointerDown={() => handlePointerDown(id)}
                        className="w-16 h-16 rounded-full cursor-pointer bg-[#1a1a1a]"
                        animate={{
                            scale: isActive ? 1.2 : 1,
                            opacity: isActive ? 1 : 0.45,
                            backgroundColor: isActive ? activeColor : "#1a1a1a",
                            boxShadow: isActive
                                ? `0 0 20px ${activeColor}`
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