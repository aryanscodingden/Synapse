import { round } from "culori";
import { mark } from "framer-motion/client";
import { create } from "zustand";

export const useGameState = create((set, get) => ({
    mode: "solo",
    round: 1,
    phase: "idle",

     flashSequence: /** @type {FlashNode[]} */ ([]),
     playerSequence: /** @type {PlayerInput[]} */ ([]),

    scores: {
        sequence: 0,
        color: 0,
        timing: 0,
        final: 0,
    },

    dailyAttempted: false,

    setMode: (mode) => set({mode}),
    setPhase: (phase) => set({phase}),
  setFlashSequence: (sequence) =>
    set({ flashSequence: sequence }),

    addPlayerInput: (input) => 
        set((state) => ({
            playerSequence: [...state.playerSequence, input],
        })),
    
    updatePlayerColor: (index, color) => 
        set((state) => {
            const updated = [...state.playerSequence];
            if (updated[index]) {
                updated[index].color = color;
            }
            return {playerSequence: updated};
        }),

    setScores: (scores) => 
        set({scores}),

    nextRound: () => 
        set((state) => ({
            round: state.round + 1, 
            playerSequence: [],
            flashSequence: [],
            phase: "idle",
        })),

    resetGame: () => 
        set({
            round: 1,
            phase: "idle",
            flashSequence: [],
            playerSequence: [],
            scores: {
                sequence: 0, 
                color: 0,
                timing: 0,
                final: 0, 
            },
        }),

    markDailyAttempt: () => 
        set({dailyAttempted: true}),
}));
