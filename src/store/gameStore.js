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

const PUZZLE_DIM = 3;
const PUZZLE_TILE_COUNT = PUZZLE_DIM * PUZZLE_DIM;
const PUZZLE_TEST_DURATION_MS = 90000;

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

const buildPuzzleTarget = () => 
    Array.from({length: PUZZLE_TILE_COUNT}, (_, i) => i + 1);

const shuffle = (arr) => {
    const out = [...arr];
    for (let i = out.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        const t = out[i];
        out[i] = out[j];
        out[j] = t;
    }
    return out;
};

const boardsMatch = (a, b) => 
    a.length === b.length && a.every((v, i) => v === b[i]);

const buildPuzzleBoard = (target) => {
    let board = shuffle(target);
    while (boardsMatch(board, target)) {
        board = shuffle(target);
    }
    return board;
};

const makeDefaultPuzzleState = () => {
    const target = buildPuzzleTarget();
    return {
        dim: PUZZLE_DIM,
        board: buildPuzzleBoard(target),
        target, 
        moves: 0,
        solvedCount: 0, 
        totalShown: 1,
        timeLeftMs: PUZZLE_TEST_DURATION_MS,
        startedAt: null, 
        endedAt: null,
    };
};

export const useGameState = create((set) => ({
    mode: null,
    phase: "idle",
    level: 1,
    totalLevels: LEVEL_LENGTHS.length,
    currentPattern: [],
    playerSequence: [],
    reaction: makeDefaultReactionState(),
    puzzle: makeDefaultPuzzleState(),
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

    startPuzzleGame: () => 
        set(() => {
            const puzzle = makeDefaultPuzzleState();
            puzzle.startedAt = performance.now();

            return {
                mode: "puzzle",
                phase: "playing",
                puzzle,
            };
        }),

    tickPuzzleTimer: (deltaMs) =>
        set((state) => {
            if (state.mode !== "puzzle" || state.phase !== "playing") return {};

            const next = Math.max(0, state.puzzle.timeLeftMs - deltaMs);

            if (next === 0) {
                return {
                    phase: "result",
                    puzzle: {
                        ...state.puzzle,
                        timeLeftMs: 0,
                        endedAt: performance.now(),
                    },
                };
            }

            return {
                puzzle: {
                    ...state.puzzle,
                    timeLeftMs: next,
                },
            };
        }),

    swapPuzzleTiles: (fromIndex, toIndex) => 
        set((state) => {
            if (state.mode !== "puzzle" || state.phase !== "playing") return {};
            if (fromIndex === toIndex) return {};

            const size = state.puzzle.board.length;
            if (
                fromIndex < 0 ||
                toIndex < 0 ||
                fromIndex >= size ||
                toIndex >= size
            ) {
                return {};
            }

            const board = [...state.puzzle.board];
            const temp = board[fromIndex];
            board[fromIndex] = board[toIndex];
            board[toIndex] = temp;

            const solved = boardsMatch(board, state.puzzle.target);

            if (!solved) {
                return {
                    puzzle: {
                        ...state.puzzle,
                        board,
                        moves: state.puzzle.moves + 1,
                    },
                };
            }

            const nextBoard = buildPuzzleBoard(state.puzzle.target);

            return {
                puzzle: {
                    ...state.puzzle,
                    board: nextBoard,
                    moves: state.puzzle.moves + 1,
                    solvedCount: state.puzzle.solvedCount + 1,
                    totalShown: state.puzzle.totalShown + 1,
                },
            };
        }),
}));