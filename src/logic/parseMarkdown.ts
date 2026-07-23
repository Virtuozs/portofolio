export type InlineNode =
  | { type: "text"; value: string }
  | { type: "bold"; children: InlineNode[] }
  | { type: "italic"; children: InlineNode[] };

export type MarkdownNode =
  | { type: "heading"; level: number; children: InlineNode[] }
  | { type: "paragraph"; children: InlineNode[] }
  | { type: "codeblock"; code: string }
  | { type: "image"; alt: string; src: string };

const HEADING_RE = /^(#{1,6})\s+(.*)$/;
const IMAGE_RE = /^!\[([^\]]*)\]\(([^)]*)\)\s*$/;
const INLINE_RE = /\*\*([^*]+)\*\*|\*([^*]+)\*/g;

function parseInline(text: string): InlineNode[] {
  const nodes: InlineNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  INLINE_RE.lastIndex = 0;
  while ((match = INLINE_RE.exec(text)) !== null) {
    if (match.index > last) {
      nodes.push({ type: "text", value: text.slice(last, match.index) });
    }
    if (match[1] !== undefined) {
      nodes.push({ type: "bold", children: [{ type: "text", value: match[1] }] });
    } else {
      nodes.push({ type: "italic", children: [{ type: "text", value: match[2] }] });
    }
    last = INLINE_RE.lastIndex;
  }
  if (last < text.length) {
    nodes.push({ type: "text", value: text.slice(last) });
  }
  return nodes;
}

export function parseMarkdown(source: string): MarkdownNode[] {
  const lines = source.split("\n");
  const nodes: MarkdownNode[] = [];
  let paragraph: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length > 0) {
      nodes.push({ type: "paragraph", children: parseInline(paragraph.join(" ")) });
      paragraph = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.trim().startsWith("```")) {
      flushParagraph();
      const code: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        code.push(lines[i]);
        i++;
      }
      nodes.push({ type: "codeblock", code: code.join("\n") });
      continue;
    }

    const imageMatch = IMAGE_RE.exec(line);
    if (imageMatch) {
      flushParagraph();
      nodes.push({ type: "image", alt: imageMatch[1], src: imageMatch[2] });
      continue;
    }

    const headingMatch = HEADING_RE.exec(line);
    if (headingMatch) {
      flushParagraph();
      nodes.push({ type: "heading", level: headingMatch[1].length, children: parseInline(headingMatch[2]) });
      continue;
    }

    if (line.trim() === "") {
      flushParagraph();
      continue;
    }

    paragraph.push(line.trim());
  }

  flushParagraph();
  return nodes;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderInline(nodes: InlineNode[]): string {
  return nodes
    .map((node) => {
      switch (node.type) {
        case "text":
          return escapeHtml(node.value);
        case "bold":
          return `<strong>${renderInline(node.children)}</strong>`;
        case "italic":
          return `<em>${renderInline(node.children)}</em>`;
      }
    })
    .join("");
}

export function renderMarkdownToHtml(nodes: MarkdownNode[]): string {
  return nodes
    .map((node) => {
      switch (node.type) {
        case "heading":
          return `<h${node.level}>${renderInline(node.children)}</h${node.level}>`;
        case "paragraph":
          return `<p>${renderInline(node.children)}</p>`;
        case "codeblock":
          return `<pre><code>${escapeHtml(node.code)}</code></pre>`;
        case "image":
          return `<img src="${escapeHtml(node.src)}" alt="${escapeHtml(node.alt)}">`;
      }
    })
    .join("\n");
}
