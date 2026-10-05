import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CollectionGame } from "@/components/CollectionGame";
import { gameCopy } from "@/lib/game-copy";
import { isLocale, localeHref } from "@/lib/locale";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return { title: gameCopy[locale].title, description: gameCopy[locale].intro,
    alternates: { languages: { es: localeHref("es", "/play/"), en: localeHref("en", "/play/") } } };
}
export default async function PlayPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <CollectionGame locale={locale} />;
}
