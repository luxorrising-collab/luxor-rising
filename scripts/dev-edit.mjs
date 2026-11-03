// Inline text editing for the dev comment overlay (components/DevComment.tsx).
//
//   echo '{"oldText":"…","newText":"…","pick":["file:index"]}' | node scripts/dev-edit.mjs
//
// Finds the text the page shows in the source (CMS content first, then code) and
// rewrites it in place, escaped for where it sits. Every write is re-parsed and
// rolled back if it would break the file. Prints one JSON result.
//
// app/api/dev-edit runs this in development only. It lives here rather than in
// the route so the production bundle never traces the repo it reads and writes.
import { promises as fs } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const ROOT = process.cwd();
const SEARCH_DIRS = ["content", "app", "components", "lib"];
const EXTENSIONS = /\.(ya?ml|mdoc|md|tsx|ts)$/;

// By name at runtime, so a bundler tracing this file never pulls them in.
const need = (name) => createRequire(import.meta.url)(name);

// The page shows rendered text; the source may hold it wrapped over several YAML
// lines, split by JSX {" "}, or written with entities. Match all of those.
const CHAR_FORMS = {
  "'": "(?:'|’|&apos;|&#39;|&rsquo;|\\\\')",
  "’": "(?:'|’|&apos;|&#39;|&rsquo;|\\\\')",
  '"': '(?:"|“|”|&quot;|&ldquo;|&rdquo;|\\\\")',
  "“": '(?:"|“|&quot;|&ldquo;|\\\\")',
  "”": '(?:"|”|&quot;|&rdquo;|\\\\")',
  "—": "(?:—|&mdash;)",
  "–": "(?:–|&ndash;)",
  "…": "(?:…|&hellip;|\\.\\.\\.)",
  "&": "(?:&|&amp;)",
  "<": "(?:<|&lt;)",
  ">": "(?:>|&gt;)",
  "{": "(?:\\{|&#123;|&lbrace;)",
  "}": "(?:\\}|&#125;|&rbrace;)",
};

function sourcePattern(text) {
  let re = "";
  for (const part of text.split(/(\s+)/)) {
    if (!part) continue;
    if (/^\s+$/.test(part)) {
      re += `(?:\\s|&nbsp;|\\{\\s*["'] ["']\\s*\\})+`;
      continue;
    }
    for (const ch of part) re += CHAR_FORMS[ch] ?? ch.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
  }
  return new RegExp(re, "g");
}

async function sourceFiles() {
  const files = [];
  for (const dir of SEARCH_DIRS) {
    const entries = await fs.readdir(path.join(ROOT, dir), { recursive: true }).catch(() => []);
    for (const rel of entries) {
      const file = path.join(dir, String(rel)).split(path.sep).join("/");
      if (EXTENSIONS.test(file) && !file.startsWith("app/api/dev-")) files.push(file);
    }
  }
  // CMS content first: where the page reads from Keystatic, that's the text it shows.
  return files.sort((a, b) => Number(!a.startsWith("content/")) - Number(!b.startsWith("content/")));
}

async function findMatches(text) {
  const pattern = sourcePattern(text);
  const out = [];
  for (const file of await sourceFiles()) {
    const src = await fs.readFile(path.join(ROOT, file), "utf8");
    for (const m of src.matchAll(pattern)) {
      const index = m.index ?? 0;
      const line = src.slice(0, index).split("\n").length;
      const preview = src.split("\n")[line - 1].trim().slice(0, 140);
      out.push({ id: `${file}:${index}`, file, index, length: m[0].length, line, preview });
    }
  }
  return out;
}

const normalise = (s) => s.replace(/\s+/g, " ").trim();

// ---- YAML (Keystatic content, and .mdoc front matter) ----------------------

const isMarkdownFile = (file) => /\.mdoc$|\.md$/.test(file);

function frontMatterEnd(src, file) {
  if (!isMarkdownFile(file)) return src.length;
  const m = /^---\r?\n[\s\S]*?\r?\n---\r?\n/.exec(src);
  return m ? m[0].length : 0;
}

const yamlDoubleQuoted = (text) => text.replace(/\\/g, "\\\\").replace(/"/g, '\\"');

function encodeYaml(src, index, length, text) {
  const lineStart = src.lastIndexOf("\n", index - 1) + 1;
  const before = src.slice(lineStart, index);
  const opener = /^\s*(?:-\s+)?(?:[\w-]+:\s+)?(["'])/.exec(before);
  if (opener?.[1] === '"') return yamlDoubleQuoted(text);
  if (opener?.[1] === "'") return text.replace(/'/g, "''");
  // A whole one-line plain value (key: text) gets quoted when the new text needs it.
  const lineEnd = src.indexOf("\n", index + length);
  const rest = src.slice(index + length, lineEnd < 0 ? src.length : lineEnd);
  const risky = /: |\s#|^[-?:,[\]{}#&*!|>'"%@`]/.test(text);
  if (risky && /^\s*(?:-\s+)?(?:[\w-]+:\s+)?$/.test(before) && !rest.trim()) return `"${yamlDoubleQuoted(text)}"`;
  // Text that was wrapped over several lines (folded block text) stays wrapped.
  const wrap = /\n([ \t]*)/.exec(src.slice(index, index + length));
  if (!wrap) return text;
  const lines = [];
  let line = "";
  let width = 80 - before.length;
  for (const word of text.split(" ")) {
    if (line && line.length + 1 + word.length > width) {
      lines.push(line);
      line = word;
      width = 80 - wrap[1].length;
    } else line = line ? `${line} ${word}` : word;
  }
  lines.push(line);
  return lines.join(`\n${wrap[1]}`);
}

function yamlHolds(src, file, expected) {
  const yaml = need("js-yaml");
  const doc = isMarkdownFile(file)
    ? src.slice(0, frontMatterEnd(src, file)).replace(/^---\r?\n|\r?\n---\r?\n$/g, "")
    : src;
  let data;
  try {
    data = yaml.load(doc);
  } catch {
    return false;
  }
  const strings = [];
  const walk = (v) => {
    if (typeof v === "string") strings.push(normalise(v));
    else if (v && typeof v === "object") Object.values(v).forEach(walk);
  };
  walk(data);
  return strings.some((s) => s.includes(normalise(expected)));
}

// ---- TSX / TS ---------------------------------------------------------------

function encodeCode(src, file, index, length, text) {
  const ts = need("typescript");
  const kind = file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  let node = ts.createSourceFile(file, src, ts.ScriptTarget.Latest, true, kind);
  for (;;) {
    const child = ts.forEachChild(node, (c) => (c.getStart() <= index && index + length <= c.end ? c : undefined));
    if (!child) break;
    node = child;
  }
  const k = ts.SyntaxKind;
  if (node.kind === k.StringLiteral) {
    // JSX attribute strings don't take backslash escapes.
    if (node.parent?.kind === k.JsxAttribute) return text.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
    const quote = src[node.getStart()];
    return text.replace(/\\/g, "\\\\").split(quote).join(`\\${quote}`);
  }
  if ([k.NoSubstitutionTemplateLiteral, k.TemplateHead, k.TemplateMiddle, k.TemplateTail].includes(node.kind)) {
    return text.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
  }
  if ([k.JsxText, k.JsxElement, k.JsxFragment].includes(node.kind)) {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\{/g, "&#123;")
      .replace(/\}/g, "&#125;")
      .replace(/'/g, "&apos;")
      .replace(/"/g, "&quot;");
  }
  return null;
}

function codeParses(src, file) {
  const ts = need("typescript");
  const out = ts.transpileModule(src, {
    fileName: file,
    reportDiagnostics: true,
    compilerOptions: { jsx: ts.JsxEmit.Preserve, target: ts.ScriptTarget.Latest },
  });
  return (out.diagnostics ?? []).length === 0;
}

// ---- Apply ------------------------------------------------------------------

async function apply(targets, newText) {
  const byFile = new Map();
  for (const t of targets) byFile.set(t.file, [...(byFile.get(t.file) ?? []), t]);
  const originals = new Map();
  try {
    for (const [file, list] of byFile) {
      const filePath = path.join(ROOT, file);
      const original = await fs.readFile(filePath, "utf8");
      originals.set(file, original);
      let src = original;
      // Back to front, so earlier offsets stay valid.
      for (const t of [...list].sort((a, b) => b.index - a.index)) {
        const isYaml = /\.ya?ml$/.test(file) || (isMarkdownFile(file) && t.index < frontMatterEnd(src, file));
        const encoded = isYaml
          ? encodeYaml(src, t.index, t.length, newText)
          : isMarkdownFile(file)
            ? newText
            : encodeCode(src, file, t.index, t.length, newText);
        if (encoded === null) throw new Error(`${file}:${t.line} isn't plain text in the code, so it can't be edited here.`);
        src = src.slice(0, t.index) + encoded + src.slice(t.index + t.length);
        if (isYaml && !yamlHolds(src, file, newText)) throw new Error(`That text would break ${file}; edit it in Keystatic instead.`);
      }
      if (/\.tsx?$/.test(file) && !codeParses(src, file)) throw new Error(`That text would break ${file}.`);
      await fs.writeFile(filePath, src);
    }
    return null;
  } catch (e) {
    for (const [file, original] of originals) await fs.writeFile(path.join(ROOT, file), original);
    return e instanceof Error ? e.message : "Couldn't save.";
  }
}

async function run(body) {
  const oldText = normalise(String(body?.oldText ?? ""));
  const newText = normalise(String(body?.newText ?? ""));
  if (oldText.length < 2 || oldText.length > 3000 || newText.length > 3000) {
    return { status: "error", error: "Select some text to edit (up to 3,000 characters)." };
  }
  if (oldText === newText) return { status: "unchanged" };

  const matches = await findMatches(oldText);
  if (matches.length === 0) {
    return {
      status: "notFound",
      error: "This text isn't written anywhere as-is (it may be built from several pieces). Edit it in Keystatic or ask Claude.",
    };
  }
  const pick = Array.isArray(body?.pick) ? body.pick.map(String) : null;
  if (!pick && matches.length > 1) {
    return { status: "choose", matches: matches.map(({ id, file, line, preview }) => ({ id, file, line, preview })) };
  }
  const targets = pick ? matches.filter((m) => pick.includes(m.id)) : matches;
  if (targets.length === 0) return { status: "error", error: "The text changed on disk; try again." };

  const error = await apply(targets, newText);
  if (error) return { status: "error", error };
  return { status: "saved", changes: targets.map(({ file, line }) => ({ file, line })) };
}

let input = "";
for await (const chunk of process.stdin) input += chunk;
let body = null;
try {
  body = JSON.parse(input);
} catch {
  /* reported below as an empty request */
}
process.stdout.write(JSON.stringify(await run(body)));
