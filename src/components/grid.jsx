import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useGameState } from "../store/gameStore";

const GRID_SIZE = 16;

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export default function Grid() {
    const phase = useGameState((s) => s.phase);
    const flashSequence = useGameState((s) => s.flashSequence);
    const setPhase = useGameState((s) => s.setPhase);
    const addPlayerInput = useGameState((s) => s.addPlayerInput);

    const [activeNode, setActiveNode] = useState(null);
    const [activeColor, setActiveColor] = useState("#fff");
    const [holdStart, setHoldStart] = useState(null);

    console.log("PHASE:", phase);

    useEffect(() => {
        if (phase !== "watch" || flashSequence.length === 0) return;

        let cancelled = false;

        const play = async () => {
            for (let step of flashSequence) {
                if (cancelled) return;

                setActiveNode(step.id);
                setActiveColor(step.color);

                await sleep(300);
                setActiveNode(null);
                await sleep(150);
            }

            setPhase("recall");
        };

        play();
        return () => (cancelled = true);
    }, [phase, flashSequence, setPhase]);

    const handlePointerDown = (id) => {
        if (phase !== "recall") return;

        setActiveNode(id);
        setHoldStart(performance.now());
    };

    const handlePointerUp = (id) => {
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