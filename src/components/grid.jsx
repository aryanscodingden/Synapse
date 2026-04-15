 import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useGameState } from "../store/gameStore";

const GRID_SIZE = 16;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default function Grid() {
    const mode = useGameState((s) => s.mode);
    const phase = useGameState((s) => s.phase);
    const currentPattern = useGameState((s) => s.currentPattern);
    const submitRecallInput = useGameState((s) => s.submitRecallInput);

    const reaction = useGameState((s) => s.reaction);
    const setPhase = useGameState((s) => s.setPhase);
    const spawnTarget = useGameState((s) => s.spawnTarget);
    const handleReactionClick = useGameState((s) => s.handleReactionClick);

    const [activeNode, setActiveNode] = useState(null);
    const [activeColor, setActiveColor] = useState("#4da6ff");
    const resetTimeoutRef = useRef(null);
    const MotionDiv = motion.div;

    useEffect(() => {
        if (phase !== "watch" || currentPattern.length === 0) return;

        let cancelled = false;

        const playPattern = async () => {
            for (const step of currentPattern) {
                if (cancelled) return;

                setActiveNode(step.id);
                setActiveColor(step.color);
                const basespeed = 320;
                const speed = Math.max(
                    140,
                    basespeed - (useGameState.getState().level - 1) * 40,
                );

                await sleep(speed);
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

    useEffect(() => {
        if (mode !== "reaction") return;
        if (phase !== "playing") return;

        if (reaction.activeTarget === null) {
            const delay = 400 + Math.random() * 600;

            const timeout = setTimeout(() => {
                const id = Math.floor(Math.random() * GRID_SIZE);
                spawnTarget(id);
            }, delay);
            return () => clearTimeout(timeout);
        }
    }, [reaction.activeTarget, mode, phase, spawnTarget]);

    const handlePointerDown = (id) => {
        if (mode === "reaction") {
            if (phase === "playing") {
                handleReactionClick(id);
            }
            return;
        }

        if (phase !== "recall") return;

        const playerIndex = useGameState.getState().playerSequence.length;
        const expectedStep = currentPattern[playerIndex];

        if (resetTimeoutRef.current) {
            clearTimeout(resetTimeoutRef.current);
        }

        setActiveNode(id);

        if (expectedStep && id === expectedStep.id) {
            setActiveColor(expectedStep.color);
        } else {
            setActiveColor("#ff4d4d");
        }

        submitRecallInput(id);

        resetTimeoutRef.current = setTimeout(() => {
            setActiveNode(null);
        }, 140);
    };

    return (
        <div className="grid grid-cols-4 gap-4 w-[320px] mx-auto mt-10">
            {Array.from({ length: GRID_SIZE }, (_, id) => {
                const isActive = activeNode === id;
                const isReactionTarget =
                    mode === "reaction" &&
                    phase === "playing" &&
                    reaction.activeTarget === id;

                return (
                    <MotionDiv
                        key={id}
                        onPointerDown={() => handlePointerDown(id)}
                        className="w-16 h-16 rounded-full cursor-pointer"
                        animate={{
                            scale: isReactionTarget
                                ? 1.2
                                : isActive
                                ? 1.2
                                : 1,
                            backgroundColor: isReactionTarget
                                ? "#3b82f6"
                                : isActive
                                ? activeColor
                                : "#1a1a1a",
                            opacity:
                                isReactionTarget || isActive ? 1 : 0.4,
                            boxShadow: isReactionTarget
                                ? "0 0 20px rgba(59,130,246,0.7)"
                                : isActive
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














