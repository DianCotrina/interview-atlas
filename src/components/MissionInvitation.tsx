import Link from "next/link";
import { gameCopy } from "../lib/game-copy";
import { localeHref, type Locale } from "../lib/locale";

export function MissionInvitation({ locale, compact = false }: { locale: Locale; compact?: boolean }) {
  const text = gameCopy[locale];
  return <Link href={localeHref(locale, "/play/")} className={`mission-invitation ${compact ? "compact" : ""}`}>
    <span className="invitation-icon" aria-hidden="true">✦</span>
    <span><strong>{text.title}</strong><span>{text.campaign}</span></span>
    <span className="invitation-action">{text.enter}</span>
  </Link>;
}
