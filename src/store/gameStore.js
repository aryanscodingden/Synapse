import { create } from "zustand";

const MANUAL_PATTERNS = [
    [0, 5, 10],
    [3, 7, 11, 15],
    [1, 2, 6, 10, 14],
    [4, 8, 9, 13, 12, 0],
];

const COLORS = [
    "#ff4d4d",
    "#4dff88",
    "#4da6ff",
    "#ffd24d",
    "#ff66cc",
    "#66ffff",
    "#ffa64d",
    "#b366ff",
];

const buildPattern = (ids) =>
    ids.map((id) => ({
        id,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
    }));

export const useGameState = create((set) => ({
    phase: "idle",
    level: 1,
    totalLevels: MANUAL_PATTERNS.length,
    currentPattern: [],
    playerSequence: [],

    setPhase: (phase) => set({ phase }),

    startGame: () =>
        set({
            phase: "watch",
            level: 1,
            currentPattern: buildPattern(MANUAL_PATTERNS[0]),
            playerSequence: [],
        }),

    retryLevel: () =>
        set((state) => ({
            phase: "watch",
            playerSequence: [],
            currentPattern: buildPattern(
                MANUAL_PATTERNS[state.level - 1] || [],
            ),
        })),

    submitRecallInput: (id) =>
        set((state) => {
            if (state.phase !== "recall") return {};

            const expectedStep = state.currentPattern[state.playerSequence.length];
            const nextPlayerSequence = [...state.playerSequence, id];

            if (!expectedStep || id !== expectedStep.id) {
                return {
                    phase: "failed",
                    playerSequence: nextPlayerSequence,
                };
            }

            const levelComplete =
                nextPlayerSequence.length === state.currentPattern.length;

            if (!levelComplete) {
                return { playerSequence: nextPlayerSequence };
            }

            const nextLevel = state.level + 1;
            const nextPatternIds = MANUAL_PATTERNS[nextLevel - 1];

            if (!nextPatternIds) {
                return {
                    phase: "completed",
                    playerSequence: nextPlayerSequence,
                };
            }

            return {
                phase: "watch",
                level: nextLevel,
                currentPattern: buildPattern(nextPatternIds),
                playerSequence: [],
            };
        }),
}));