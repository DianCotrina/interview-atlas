import { Children, cloneElement, isValidElement, type ReactNode } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { splitPlaceholders } from "../lib/placeholders";
import { defaultLocale, type Locale } from "../lib/locale";
import { messages } from "../lib/messages";

function highlight(children: ReactNode, title: string): ReactNode {
  return Children.map(children, (child) => {
    if (typeof child === "string")
      return splitPlaceholders(child).map((token, index) =>
        token.kind === "placeholder" ? (
          <span className="needs-input" title={title} key={index}>
            {token.text}
          </span>
        ) : (
          token.text
        ),
      );
    if (isValidElement<{ children?: ReactNode; className?: string }>(child)) {
      if (child.props.className === "needs-input") return child;
      return cloneElement(child, {}, highlight(child.props.children, title));
    }
    return child;
  });
}
export function ConceptMarkdown({
  body,
  locale = defaultLocale,
}: {
  body: string;
  locale?: Locale;
}) {
  const title = messages[locale].concept.placeholder;
  return (
    <div className="prose">
      <Markdown
        remarkPlugins={[remarkGfm]}
        skipHtml
        components={{
          p: ({ children }) => <p>{highlight(children, title)}</p>,
          li: ({ children }) => <li>{highlight(children, title)}</li>,
          td: ({ children }) => <td>{highlight(children, title)}</td>,
          blockquote: ({ children }) => (
            <blockquote>{highlight(children, title)}</blockquote>
          ),
          table: ({ children }) => (
            <div className="table-scroll">
              <table>{children}</table>
            </div>
          ),
        }}
      >
        {body}
      </Markdown>
    </div>
  );
}
