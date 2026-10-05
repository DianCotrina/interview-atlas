import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { loadLocalizedConcepts } from "@/lib/content";
import { isLocale, locales } from "@/lib/locale";
import { messages } from "@/lib/messages";
import { Sidebar } from "@/components/Sidebar";
import { ReviewNavigationProvider } from "@/components/ReviewNavigation";
import { CollectionGameProvider } from "@/components/CollectionGameSession";
import "../globals.css";
export const dynamicParams = false;
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const text = messages[locale].site;
  return {
    title: {
      default: `Interview Atlas — ${text.title}`,
      template: "%s | Interview Atlas",
    },
    description: text.description,
    alternates: { languages: { es: "/es/", en: "/en/" } },
  };
}
export default async function StudyLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const entries = loadLocalizedConcepts(locale).map(
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
    <html lang={locale}>
      <body>
        <a href="#main" className="skip-link">
          {messages[locale].site.skip}
        </a>
        <ReviewNavigationProvider>
          <CollectionGameProvider>
          <div className="app-shell">
            <Sidebar concepts={entries} locale={locale} />
            <main id="main" className="main-content">
              {children}
            </main>
          </div>
          </CollectionGameProvider>
        </ReviewNavigationProvider>
      </body>
    </html>
  );
}
