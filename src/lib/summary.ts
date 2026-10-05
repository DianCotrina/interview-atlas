export function plainSummary(summary: string): string {
  return summary.replace(/\*\*([^\n]+?)\*\*/g, "$1")
    .replace(/(?<!\*)\*([^*\n]+?)\*(?!\*)/g, "$1")
    .replace(/`([^`\n]+?)`/g, "$1");
}
