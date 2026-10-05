"use client";
import {
  createContext,
  useCallback,
  useContext,
  useReducer,
  type ReactNode,
} from "react";
import { reviewNavigationReducer } from "@/lib/review-navigation";

const Context = createContext<{
  pending: boolean;
  setPending: (id: string, pending: boolean) => void;
} | null>(null);

export function ReviewNavigationProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [reviews, dispatch] = useReducer(
    reviewNavigationReducer,
    new Set<string>(),
  );
  const setPending = useCallback(
    (id: string, pending: boolean) => dispatch({ id, pending }),
    [],
  );
  return (
    <Context.Provider value={{ pending: reviews.size > 0, setPending }}>
      {children}
    </Context.Provider>
  );
}

export function useReviewNavigation() {
  const value = useContext(Context);
  if (!value) throw new Error("Review navigation requires its provider");
  return value;
}
