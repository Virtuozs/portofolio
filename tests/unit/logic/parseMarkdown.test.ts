import { describe, expect, it } from "vitest";
import { parseMarkdown, renderMarkdownToHtml } from "../../../src/logic/parseMarkdown.ts";

function render(src: string): string {
  return renderMarkdownToHtml(parseMarkdown(src));
}

describe("headings", () => {
  it("parses an h1", () => {
    expect(render("# Title")).toBe("<h1>Title</h1>");
  });

  it("parses an h3", () => {
    expect(render("### Sub")).toBe("<h3>Sub</h3>");
  });
});

describe("paragraphs and inline emphasis", () => {
  it("wraps plain text in a paragraph", () => {
    expect(render("just text")).toBe("<p>just text</p>");
  });

  it("renders bold", () => {
    expect(render("a **bold** word")).toBe("<p>a <strong>bold</strong> word</p>");
  });

  it("renders italic", () => {
    expect(render("a *soft* word")).toBe("<p>a <em>soft</em> word</p>");
  });

  it("renders bold and italic in the same paragraph", () => {
    expect(render("**x** and *y*")).toBe("<p><strong>x</strong> and <em>y</em></p>");
  });
});

describe("code blocks", () => {
  it("renders a fenced code block, preserving its raw content", () => {
    expect(render("```\nconst x = 1;\n```")).toBe("<pre><code>const x = 1;</code></pre>");
  });

  it("does not apply emphasis inside a code block", () => {
    expect(render("```\n**not bold**\n```")).toBe("<pre><code>**not bold**</code></pre>");
  });
});

describe("images", () => {
  it("renders a block-level image", () => {
    expect(render("![a shot](/x.png)")).toBe('<img src="/x.png" alt="a shot">');
  });
});

describe("XSS safety", () => {
  it("escapes a script tag in paragraph text so it is inert", () => {
    const out = render("<script>alert(1)</script>");
    expect(out).not.toContain("<script>");
    expect(out).toContain("&lt;script&gt;");
  });

  it("escapes html inside a code block", () => {
    const out = render("```\n<img onerror=x>\n```");
    expect(out).not.toContain("<img onerror");
    expect(out).toContain("&lt;img onerror=x&gt;");
  });

  it("escapes quotes in an image src attribute", () => {
    const out = render('![x]("onerror="alert(1))');
    expect(out).not.toContain('"onerror="');
    expect(out).toContain("&quot;");
  });
});
