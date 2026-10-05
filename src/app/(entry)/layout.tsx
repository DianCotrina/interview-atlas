import type { ReactNode } from "react";
import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "Interview Atlas — Español / English",
  description: "Tu biblioteca de entrevistas / Your interview library",
};
export default function EntryLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
