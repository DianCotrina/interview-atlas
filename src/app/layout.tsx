import type { Metadata } from "next";
import type { ReactNode } from "react";
import { loadConcepts } from "../lib/content";
import { Sidebar } from "../components/Sidebar";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Interview Atlas — Tu biblioteca de entrevistas",
    template: "%s | Interview Atlas",
  },
  description:
    "Conceptos, patrones y práctica para explicar tus decisiones con claridad en una entrevista técnica.",
};
export default function RootLayout({ children }: { children: ReactNode }) {
  const entries = loadConcepts().map(
    ({ id, title, section, tags, status, summary }) => ({
      id,
      title,
      section,
      tags,
      status,
      summary,
    }),
  );
  return (
    <html lang="es">
      <body>
        <a href="#main" className="skip-link">
          Saltar al contenido
        </a>
        <div className="app-shell">
          <Sidebar concepts={entries} />
          <main id="main" className="main-content">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
