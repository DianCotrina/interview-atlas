import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";

export type StudyStatus = "learned" | "in-progress" | "pending";
export type DrillQuestion = { id: string; question: string; answer: string };
export type Concept = {
  id: string;
  title: string;
  section: string;
  tags: string[];
  status: StudyStatus;
  summary: string;
  interviewLine: string;
  body: string;
  drillQuestions: DrillQuestion[];
};
export type CatalogEntry = Pick<
  Concept,
  "id" | "title" | "section" | "tags" | "status" | "summary"
>;
const slug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function record(value: unknown, file: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error(`${file}: expected metadata object`);
  return value as Record<string, unknown>;
}
function text(value: unknown, field: string, file: string): string {
  if (typeof value !== "string" || !value.trim())
    throw new Error(`${file}: ${field} must be a non-empty string`);
  return value;
}
function id(value: unknown, field: string, file: string): string {
  const result = text(value, field, file);
  if (!slug.test(result))
    throw new Error(`${file}: invalid ${field} '${result}'`);
  return result;
}
export function parseConcept(source: string, file: string): Concept {
  try {
    const parsed = matter(source);
    const data = record(parsed.data as unknown, file);
    const status = data.status;
    if (
      status !== "learned" &&
      status !== "in-progress" &&
      status !== "pending"
    )
      throw new Error(`${file}: invalid status`);
    if (!Array.isArray(data.tags))
      throw new Error(`${file}: tags must be an array`);
    if (!Array.isArray(data.drillQuestions))
      throw new Error(`${file}: drillQuestions must be an array`);
    const questionIds = new Set<string>();
    const drillQuestions = data.drillQuestions.map((value: unknown) => {
      const question = record(value, file);
      const questionId = id(question.id, "question ID", file);
      if (questionIds.has(questionId))
        throw new Error(`${file}: duplicate question ID '${questionId}'`);
      questionIds.add(questionId);
      return {
        id: questionId,
        question: text(question.question, "question", file),
        answer: text(question.answer, "answer", file),
      };
    });
    return {
      id: id(data.id, "concept ID", file),
      title: text(data.title, "title", file),
      section: text(data.section, "section", file),
      tags: data.tags.map((tag) => text(tag, "tag", file)),
      status,
      summary: text(data.summary, "summary", file),
      interviewLine: text(data.interviewLine, "interviewLine", file),
      body: text(parsed.content.trim(), "body", file),
      drillQuestions,
    };
  } catch (error) {
    if (error instanceof Error && error.message.startsWith(`${file}:`))
      throw error;
    throw new Error(`${file}: invalid Markdown/frontmatter`, { cause: error });
  }
}
export function loadConcepts(
  directory = join(process.cwd(), "content"),
): Concept[] {
  const files = (folder: string): string[] =>
    readdirSync(folder, { withFileTypes: true }).flatMap((entry) => {
      const path = join(folder, entry.name);
      return entry.isDirectory()
        ? files(path)
        : entry.isFile() && entry.name.endsWith(".md")
          ? [path]
          : [];
    });
  const ids = new Set<string>();
  return files(directory)
    .sort()
    .map((file) => {
      const concept = parseConcept(readFileSync(file, "utf8"), file);
      if (ids.has(concept.id))
        throw new Error(`${file}: duplicate concept ID '${concept.id}'`);
      ids.add(concept.id);
      return concept;
    });
}
