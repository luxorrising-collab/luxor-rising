import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

// Dev-only feedback store for the point-and-click comment overlay. Writes to
// .dev-notes.json at the repo root. Disabled (404) outside development, so it
// never exists on the live site.
export const runtime = "nodejs";

const FILE = path.join(process.cwd(), ".dev-notes.json");
const devOnly = () => process.env.NODE_ENV !== "production";

type Note = {
  id: number;
  note: string;
  text: string;
  selector: string;
  context: string;
  url: string;
  x: number;
  y: number;
  at: string;
};

async function readNotes(): Promise<Note[]> {
  try {
    const raw = await fs.readFile(FILE, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function GET() {
  if (!devOnly()) return new NextResponse("Not found", { status: 404 });
  return NextResponse.json(await readNotes());
}

export async function POST(req: Request) {
  if (!devOnly()) return new NextResponse("Not found", { status: 404 });
  const body = (await req.json().catch(() => null)) as Partial<Note> | null;
  if (!body || typeof body.note !== "string" || !body.note.trim()) {
    return NextResponse.json({ error: "note required" }, { status: 400 });
  }
  const notes = await readNotes();
  const entry: Note = {
    id: Date.now(),
    note: String(body.note).slice(0, 2000),
    text: String(body.text ?? "").slice(0, 300),
    selector: String(body.selector ?? "").slice(0, 500),
    context: String(body.context ?? "").slice(0, 300),
    url: String(body.url ?? "").slice(0, 500),
    x: Math.round(Number(body.x) || 0),
    y: Math.round(Number(body.y) || 0),
    at: new Date().toISOString(),
  };
  notes.push(entry);
  await fs.writeFile(FILE, JSON.stringify(notes, null, 2));
  return NextResponse.json({ ok: true, id: entry.id });
}

export async function DELETE(req: Request) {
  if (!devOnly()) return new NextResponse("Not found", { status: 404 });
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (id) {
    const notes = (await readNotes()).filter((n) => String(n.id) !== id);
    await fs.writeFile(FILE, JSON.stringify(notes, null, 2));
  } else {
    await fs.writeFile(FILE, "[]");
  }
  return NextResponse.json({ ok: true });
}
