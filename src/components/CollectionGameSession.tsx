"use client";

import { createContext, useContext, useReducer, type Dispatch, type ReactNode } from "react";
import { createGameState, gameReducer, type GameAction, type GameState } from "../lib/collection-game";

const Context = createContext<{ state: GameState; dispatch: Dispatch<GameAction> } | null>(null);

export function CollectionGameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, undefined, createGameState);
  return <Context.Provider value={{ state, dispatch }}>{children}</Context.Provider>;
}

export function useCollectionGame() {
  const game = useContext(Context);
  if (!game) throw new Error("Collection missions require their session provider");
  return game;
}
