import type { BoardRow } from "../lib/collection-traces";

export function CollectionBoard({ rows, before, empty, label }: {
  rows: BoardRow[]; before: BoardRow[]; empty: string; label: string;
}) {
  return (
    <section className="collection-board" aria-label={label}>
      <h3>{label}</h3>
      {rows.length === 0 ? <p className="collection-empty">{empty}</p> : (
        <dl>
          {rows.map((row) => (
            <div key={row.key} className={before.find((r) => r.key === row.key)?.value !== row.value ? "board-updated" : ""}>
              <dt><code>{row.key}</code></dt>
              <dd><code>{row.value}</code></dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}
