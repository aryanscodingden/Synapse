import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useGameState } from "../store/gameStore";

const SIGNAL_ID = 0;
const FOREPERIOD_MIN = 700;
const FOREPERIOD_RANGE = 1500;
const PENALTY_MS = 900;

function getRandomDelay() {
  return FOREPERIOD_MIN + Math.random() * FOREPERIOD_RANGE;
}

export default function ReactionArena() {
  const mode = useGameState((s) => s.mode);
  const phase = useGameState((s) => s.phase);
  const reaction = useGameState((s) => s.reaction);
  const spawnTarget = useGameState((s) => s.spawnTarget);
  const handleReactionClick = useGameState((s) => s.handleReactionClick);
  const incrementFalseStart = useGameState((s) => s.incrementFalseStart);

  const [isPenalized, setIsPenalized] = useState(false);
  const [cycleSeed, setCycleSeed] = useState(0);

  const spawnTimerRef = useRef(null);
  const penaltyTimerRef = useRef(null);

  const MotionButton = motion.button;

  useEffect(() => {
    if (mode !== "reaction" || phase !== "playing") return;
    if (reaction.activeTarget !== null) return;
    if (isPenalized) return;

    spawnTimerRef.current = window.setTimeout(() => {
      spawnTarget(SIGNAL_ID);
    }, getRandomDelay());

    return () => {
      if (spawnTimerRef.current) {
        window.clearTimeout(spawnTimerRef.current);
        spawnTimerRef.current = null;
      }
    };
  }, [mode, phase, reaction.activeTarget, spawnTarget, isPenalized, cycleSeed]);

  useEffect(() => {
    return () => {
      if (spawnTimerRef.current) window.clearTimeout(spawnTimerRef.current);
      if (penaltyTimerRef.current) window.clearTimeout(penaltyTimerRef.current);
    };
  }, []);

  const isHot =
    mode === "reaction" &&
    phase === "playing" &&
    reaction.activeTarget === SIGNAL_ID &&
    !isPenalized;

  const onPadPointerDown = () => {
    if (mode !== "reaction" || phase !== "playing") return;
    if (isPenalized) return;

    if (reaction.activeTarget === null) {
      incrementFalseStart();
      setIsPenalized(true);

      if (spawnTimerRef.current) {
        window.clearTimeout(spawnTimerRef.current);
        spawnTimerRef.current = null;
      }

      if (penaltyTimerRef.current) {
        window.clearTimeout(penaltyTimerRef.current);
      }

      penaltyTimerRef.current = window.setTimeout(() => {
        setIsPenalized(false);
        setCycleSeed((n) => n + 1);
      }, PENALTY_MS);

      return;
    }

    handleReactionClick(SIGNAL_ID);
  };

  const prompt = isPenalized
    ? "Invalid click - penalty..."
    : isHot
      ? "CLICK!"
      : "Wait for green...";

  return (
    <div className="flex h-[420px] items-center justify-center">
      <div className="relative flex h-[320px] w-[320px] items-center justify-center rounded-2xl border border-white/10 bg-black/40">
        <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.10),transparent_60%)]" />

        <MotionButton
          type="button"
          onPointerDown={onPadPointerDown}
          className="relative z-10 h-28 w-28 rounded-2xl border text-sm font-semibold tracking-wide text-white outline-none"
          animate={{
            scale: isPenalized ? 0.98 : isHot ? [1, 1.08, 1] : 1,
            backgroundColor: isPenalized
              ? "#7f1d1d"
              : isHot
                ? "#10b981"
                : "#334155",
            borderColor: isPenalized
              ? "#ef4444"
              : isHot
                ? "#6ee7b7"
                : "#64748b",
            boxShadow: isPenalized
              ? "0 0 24px rgba(239,68,68,0.5)"
              : isHot
                ? "0 0 35px rgba(16,185,129,0.75)"
                : "0 0 0px transparent",
          }}
          transition={{
            duration: 0.28,
            repeat: isHot ? Infinity : 0,
            repeatType: "mirror",
            ease: "easeInOut",
          }}
        >
          {isPenalized ? "INVALID" : isHot ? "CLICK" : "WAIT"}
        </MotionButton>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center text-xs text-white/70">
          <p>{prompt}</p>
          <p className="mt-1">False starts: {reaction.falseStarts}</p>
        </div>
      </div>
    </div>
  );
}