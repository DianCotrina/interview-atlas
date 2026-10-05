import { notFound } from "next/navigation";
import { loadConcepts } from "@/lib/content";
import { LocaleEntry } from "@/components/LocaleEntry";
export const dynamicParams = false;
export function generateStaticParams() {
  return loadConcepts().map(({ id }) => ({ id }));
}
export default async function LegacyConceptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!loadConcepts().some((concept) => concept.id === id)) notFound();
  return <LocaleEntry pathname={`/concepts/${id}/`} />;
}
