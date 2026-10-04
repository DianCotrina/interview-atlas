import { Children, cloneElement, isValidElement, type ReactNode } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { splitPlaceholders } from "../lib/placeholders";

function highlight(children: ReactNode): ReactNode {
  return Children.map(children, (child) => {
    if (typeof child === "string")
      return splitPlaceholders(child).map((token, index) =>
        token.kind === "placeholder" ? (
          <span
            className="needs-input"
            title="Necesita tu dato real"
            key={index}
          >
            {token.text}
          </span>
        ) : (
          token.text
        ),
      );
    if (isValidElement<{ children?: ReactNode; className?: string }>(child)) {
      if (child.props.className === "needs-input") return child;
      return cloneElement(child, {}, highlight(child.props.children));
    }
    return child;
  });
}
export function ConceptMarkdown({ body }: { body: string }) {
  return (
    <div className="prose">
      <Markdown
        remarkPlugins={[remarkGfm]}
        skipHtml
        components={{
          p: ({ children }) => <p>{highlight(children)}</p>,
          li: ({ children }) => <li>{highlight(children)}</li>,
          td: ({ children }) => <td>{highlight(children)}</td>,
          blockquote: ({ children }) => (
            <blockquote>{highlight(children)}</blockquote>
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
