export function reviewNavigationReducer(
  state: ReadonlySet<string>,
  action: { id: string; pending: boolean },
): ReadonlySet<string> {
  if (state.has(action.id) === action.pending) return state;
  const next = new Set(state);
  if (action.pending) next.add(action.id);
  else next.delete(action.id);
  return next;
}
