import { create } from "zustand";

const LEVEL_LENGTHS = [3, 4, 5, 6];
const GRID_SIZE = 16;

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

const buildRandomPattern = (length) => {
    const used = new Set();
    const pattern = [];

    while (pattern.length < length) {
        const id = Math.floor(Math.random() * GRID_SIZE);
        if (used.has(id)) continue;
        used.add(id);

        pattern.push({
            id,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
        });
    }

    return pattern;
};

const makeDefaultReactionState = () => ({
    activeTarget: null,
    startTime: null, 
    times: [],
    round: 0,
    totalRounds: 10, 
    falseStarts: 0,
});

export const useGameState = create((set) => ({
    mode: null,
    phase: "idle",
    level: 1,
    totalLevels: LEVEL_LENGTHS.length,
    currentPattern: [],
    playerSequence: [],
    reaction: makeDefaultReactionState(),
    setPhase: (phase) => set({ phase }),

    startGame: () =>
        set({
            mode: "recall",
            phase: "watch",
            level: 1,
            currentPattern: buildRandomPattern(LEVEL_LENGTHS[0]),
            playerSequence: [],
            reaction: makeDefaultReactionState(),
        }),

    retryLevel: () =>
        set((state) => ({
            mode: "recall",
            phase: "watch",
            currentPattern: buildRandomPattern(LEVEL_LENGTHS[state.level - 1] || 0),
            playerSequence: [],
            reaction: {
                ...state.reaction,
                activeTarget: null,
                startTime: null,
            },
        })),

    submitRecallInput: (id) =>
        set((state) => {
            if (state.phase !== "recall") return {};

            const expectedStep =
                state.currentPattern[state.playerSequence.length];
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
            const nextPatternLength = LEVEL_LENGTHS[nextLevel - 1];

            if (!nextPatternLength) {
                return {
                    phase: "completed",
                    playerSequence: nextPlayerSequence,
                };
            }

            return {
                phase: "watch",
                level: nextLevel,
                currentPattern: buildRandomPattern(nextPatternLength),
                playerSequence: [],
            };
        }),
    startReactionGame: () =>
        set({
            mode: "reaction",
            phase: "playing",
            reaction: makeDefaultReactionState(),
        }),
    
    incrementFalseStart: () => 
        set((state) => ({
            reaction: {
                ...state.reaction,
                falseStarts: state.reaction.falseStarts + 1,
            }
        })),

    spawnTarget: (id) =>
        set((state) => ({
            reaction: {
                ...state.reaction,
                activeTarget: id,
                startTime: performance.now(),
            },
        })),

    handleReactionClick: (id) =>
        set((state) => {
            const { activeTarget, startTime, times, round, totalRounds } =
                state.reaction;

            if (id !== activeTarget || startTime == null) return {};

            const reactionTime = performance.now() - startTime;
            const newTimes = [...times, reactionTime];
            const nextRound = round + 1;

            if (nextRound >= totalRounds) {
                return {
                    phase: "result",
                    reaction: {
                        ...state.reaction,
                        times: newTimes,
                        round: nextRound,
                        activeTarget: null,
                        startTime: null,
                    },
                };
            }

            return {
                reaction: {
                    ...state.reaction,
                    times: newTimes,
                    round: nextRound,
                    activeTarget: null,
                    startTime: null,
                },
            };
        }),
}));