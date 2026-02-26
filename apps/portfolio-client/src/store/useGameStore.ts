import { create } from 'zustand';

export const GamePhase = {
  START_MENU: 0,
  PLAYING: 1,
  TRANSITION: 2,
  CUTSCENE: 3,
  GAME_OVER: 4,
} as const;

export type GamePhase = typeof GamePhase[keyof typeof GamePhase];

interface GameStore {
  isModalOpen: boolean;
  gamePhase: GamePhase;
  score: number;
  isMuted: boolean;

  openModal: () => void;
  closeModal: () => void;
  setGamePhase: (phase: GamePhase) => void;
  incrementScore: (points: number) => void;
  resetScore: () => void;
  toggleMute: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
  isModalOpen: false,
  gamePhase: GamePhase.START_MENU,
  score: 0,
  isMuted: false,

  openModal: () => set({ isModalOpen: true }),
  closeModal: () => set({ isModalOpen: false, gamePhase: GamePhase.START_MENU }),
  setGamePhase: (phase) => set({ gamePhase: phase }),
  incrementScore: (points) => set((state) => ({ score: state.score + points })),
  resetScore: () => set({ score: 0 }),
  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
}));
