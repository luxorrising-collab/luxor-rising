import { NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";

// Dev-only inline text editing for the comment overlay. The browser sends the
// text it shows and the replacement; scripts/dev-edit.mjs finds it in the source
// and rewrites it. That work runs as a separate Node process so this route never
// reads the repo itself, and the production bundle has nothing to trace. Disabled
// (404) outside development, so it never exists on the live site.
export const runtime = "nodejs";

const devOnly = () => process.env.NODE_ENV !== "production";

export async function POST(req: Request) {
  if (!devOnly()) return new NextResponse("Not found", { status: 404 });
  const body = await req.text();
  try {
    const out = await new Promise<string>((resolve, reject) => {
      const child = spawn(process.execPath, [path.join(process.cwd(), "scripts", "dev-edit.mjs")], {
        cwd: process.cwd(),
      });
      let stdout = "";
      let stderr = "";
      child.stdout.on("data", (d) => (stdout += d));
      child.stderr.on("data", (d) => (stderr += d));
      child.on("error", reject);
      child.on("close", (code) => (code === 0 ? resolve(stdout) : reject(new Error(stderr || `exit ${code}`))));
      child.stdin.end(body);
    });
    return NextResponse.json(JSON.parse(out));
  } catch (e) {
    return NextResponse.json({ status: "error", error: e instanceof Error ? e.message : "Couldn't save." });
  }
}
