"use client";

import * as React from "react";
import { createPortal } from "react-dom";

// ── Dev-only point-and-click comment overlay ────────────────────────────────
// Toggle it on, click any element, type a note. Each note pins on the page and
// is saved to .dev-notes.json (via /api/dev-notes) so it can be read back.
// "Edit text" mode lets you type over any text on the page and saves it straight
// into the source file (via /api/dev-edit).
// Mounted only in development; never ships to the live site.

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

const Z = 2147483000;

// A short, human-readable CSS-ish path to an element (for locating it later).
function cssPath(el: Element): string {
  const parts: string[] = [];
  let node: Element | null = el;
  let depth = 0;
  while (node && node.nodeType === 1 && node.tagName !== "BODY" && depth < 6) {
    let part = node.tagName.toLowerCase();
    if (node.id) {
      part += `#${node.id}`;
      parts.unshift(part);
      break;
    }
    const cls = (node.getAttribute("class") || "")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 1)
      .map((c) => `.${c}`)
      .join("");
    part += cls;
    const parent = node.parentElement;
    if (parent) {
      const sameTag = Array.from(parent.children).filter((c) => c.tagName === node!.tagName);
      if (sameTag.length > 1) part += `:nth-of-type(${sameTag.indexOf(node) + 1})`;
    }
    parts.unshift(part);
    node = node.parentElement;
    depth++;
  }
  return parts.join(" > ");
}

function nearestContext(el: Element): string {
  const sec = el.closest("section, header, footer");
  const sh = sec?.querySelector("h1,h2,h3");
  if (sh?.textContent?.trim()) return sh.textContent.trim().slice(0, 80);
  let node: Element | null = el;
  while (node) {
    const h = node.querySelector?.("h1,h2,h3");
    if (h?.textContent?.trim()) return h.textContent.trim().slice(0, 80);
    node = node.parentElement;
  }
  return "";
}

type EditChoice = { id: string; file: string; line: number; preview: string };

type EditSession = {
  el: HTMLElement;
  original: string;
  status: string;
  choices: EditChoice[] | null;
  busy: boolean;
};

// The text to edit under a click: the element itself when it holds only text,
// otherwise just the run of text under the pointer (wrapped so it can be edited
// on its own, without the links or spans beside it).
function editableAt(e: MouseEvent): HTMLElement | null {
  const target = e.target;
  if (!(target instanceof HTMLElement)) return null;
  const plain = Array.from(target.childNodes).every(
    (c) => c.nodeType === Node.TEXT_NODE || (c as Element).tagName === "BR",
  );
  if (plain && target.textContent?.trim()) return target;
  const node =
    document.caretPositionFromPoint?.(e.clientX, e.clientY)?.offsetNode ??
    document.caretRangeFromPoint?.(e.clientX, e.clientY)?.startContainer;
  if (!node || node.nodeType !== Node.TEXT_NODE || !node.textContent?.trim() || !node.parentNode) return null;
  const span = document.createElement("span");
  node.parentNode.insertBefore(span, node);
  span.appendChild(node);
  return span;
}

export default function DevComment() {
  const [mounted, setMounted] = React.useState(false);
  const [on, setOn] = React.useState(false);
  const [notes, setNotes] = React.useState<Note[]>([]);
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState<null | {
    x: number;
    y: number;
    selector: string;
    text: string;
    context: string;
    draft: string;
  }>(null);
  const [hover, setHover] = React.useState<DOMRect | null>(null);
  const [activePin, setActivePin] = React.useState<number | null>(null);
  const [editMode, setEditMode] = React.useState(false);
  const [edit, setEdit] = React.useState<EditSession | null>(null);
  const editRef = React.useRef<EditSession | null>(null);
  React.useEffect(() => {
    editRef.current = edit;
  }, [edit]);

  React.useEffect(() => {
    setMounted(true);
    fetch("/api/dev-notes")
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setNotes(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  // In comment mode: highlight the hovered element and capture clicks.
  React.useEffect(() => {
    if (!on) {
      setHover(null);
      return;
    }
    const inOverlay = (t: EventTarget | null) => {
      const el = t instanceof Element ? t : t instanceof Node ? t.parentElement : null;
      return !!el?.closest("[data-devcomment]");
    };

    let raf = 0;
    const onMove = (e: MouseEvent) => {
      if (inOverlay(e.target)) {
        setHover(null);
        return;
      }
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = e.target as Element | null;
        if (el && el.getBoundingClientRect) setHover(el.getBoundingClientRect());
      });
    };
    const onClick = (e: MouseEvent) => {
      if (inOverlay(e.target)) return;
      e.preventDefault();
      e.stopPropagation();
      const el = e.target as Element;
      setPending({
        x: e.pageX,
        y: e.pageY,
        selector: cssPath(el),
        text: (el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 160),
        context: nearestContext(el),
        draft: "",
      });
    };
    document.addEventListener("mousemove", onMove, true);
    document.addEventListener("click", onClick, true);
    document.body.style.cursor = "crosshair";
    return () => {
      document.removeEventListener("mousemove", onMove, true);
      document.removeEventListener("click", onClick, true);
      document.body.style.cursor = "";
      cancelAnimationFrame(raf);
    };
  }, [on]);

  const closeEdit = React.useCallback((restore: boolean) => {
    const cur = editRef.current;
    if (!cur) return;
    cur.el.removeAttribute("contenteditable");
    cur.el.style.outline = "";
    cur.el.style.outlineOffset = "";
    if (restore) cur.el.textContent = cur.original;
    setEdit(null);
  }, []);

  const saveEdit = React.useCallback(
    async (pick?: string[]) => {
      const cur = editRef.current;
      if (!cur || cur.busy) return;
      const newText = cur.el.textContent ?? "";
      setEdit({ ...cur, busy: true, status: "Saving…" });
      try {
        const r = await fetch("/api/dev-edit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ oldText: cur.original, newText, pick }),
        });
        const d = await r.json();
        if (d.status === "unchanged") return closeEdit(false);
        if (d.status === "saved") {
          const where = d.changes.map((c: { file: string; line: number }) => `${c.file}:${c.line}`).join(", ");
          setEdit({ ...cur, busy: true, choices: null, status: `Saved to ${where}. Reloading…` });
          setTimeout(() => location.reload(), 700);
          return;
        }
        if (d.status === "choose") {
          setEdit({ ...cur, busy: false, choices: d.matches, status: "This text is in more than one place. Which should change?" });
          return;
        }
        setEdit({ ...cur, busy: false, status: d.error || "Couldn't save." });
      } catch {
        setEdit({ ...cur, busy: false, status: "Couldn't reach the dev server." });
      }
    },
    [closeEdit],
  );

  // In edit mode: highlight text, and clicking it makes it editable in place.
  // Clicks are captured so links and buttons don't fire while you edit.
  React.useEffect(() => {
    if (!editMode) return;
    let raf = 0;
    const onMove = (e: MouseEvent) => {
      const el = e.target instanceof Element ? e.target : null;
      if (editRef.current || el?.closest("[data-devcomment]")) {
        setHover(null);
        return;
      }
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (el && el.getBoundingClientRect) setHover(el.getBoundingClientRect());
      });
    };
    const onClick = (e: MouseEvent) => {
      const el = e.target instanceof Element ? e.target : null;
      if (el?.closest("[data-devcomment]")) return;
      e.preventDefault();
      e.stopPropagation();
      // Finish (Enter) or cancel (Esc) the open edit before starting another.
      if (editRef.current) return;
      const target = editableAt(e);
      if (!target) return;
      const original = target.textContent ?? "";
      target.setAttribute("contenteditable", "plaintext-only");
      target.style.outline = "2px solid #e0a94d";
      target.style.outlineOffset = "3px";
      target.focus();
      setHover(null);
      setEdit({ el: target, original, status: "Type your change. Enter saves, Esc cancels.", choices: null, busy: false });
    };
    document.addEventListener("mousemove", onMove, true);
    document.addEventListener("click", onClick, true);
    document.body.style.cursor = "text";
    return () => {
      document.removeEventListener("mousemove", onMove, true);
      document.removeEventListener("click", onClick, true);
      document.body.style.cursor = "";
      cancelAnimationFrame(raf);
    };
  }, [editMode]);

  React.useEffect(() => {
    const el = edit?.el;
    if (!el) return;
    // Keys stay inside the edit, so page shortcuts don't fire. Space is typed by
    // hand: in a button, a <summary> or a card the page treats as a button, the
    // browser would press it instead of inserting a space.
    const onKey = (e: KeyboardEvent) => {
      e.stopPropagation();
      if (e.key === " ") {
        e.preventDefault();
        if (e.type === "keydown") document.execCommand("insertText", false, " ");
      } else if (e.type !== "keydown") {
        return;
      } else if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        void saveEdit();
      } else if (e.key === "Escape") {
        e.preventDefault();
        closeEdit(true);
      }
    };
    const types = ["keydown", "keypress", "keyup"] as const;
    types.forEach((t) => el.addEventListener(t, onKey));
    return () => types.forEach((t) => el.removeEventListener(t, onKey));
  }, [edit?.el, saveEdit, closeEdit]);

  const save = async () => {
    if (!pending || !pending.draft.trim()) return;
    const payload = {
      note: pending.draft,
      text: pending.text,
      selector: pending.selector,
      context: pending.context,
      url: location.pathname + location.search,
      x: pending.x,
      y: pending.y,
    };
    setPending(null);
    try {
      const r = await fetch("/api/dev-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const d = await r.json();
      setNotes((n) => [...n, { ...payload, id: d.id ?? Date.now(), at: new Date().toISOString() }]);
    } catch {
      /* ignore */
    }
  };

  const removeNote = async (id: number) => {
    setNotes((n) => n.filter((x) => x.id !== id));
    setActivePin(null);
    try {
      await fetch(`/api/dev-notes?id=${id}`, { method: "DELETE" });
    } catch {
      /* ignore */
    }
  };

  const clearAll = async () => {
    setNotes([]);
    setActivePin(null);
    try {
      await fetch("/api/dev-notes", { method: "DELETE" });
    } catch {
      /* ignore */
    }
  };

  if (!mounted) return null;
  const onThisPage = notes.filter((n) => n.url === location.pathname + location.search);
  // Pins sit at the page coordinates they were saved at, so a pin from another page,
  // or from a wider screen, would stretch this one past its footer.
  const pins = onThisPage.filter(
    (n) => n.y <= document.body.offsetHeight && n.x <= document.body.offsetWidth,
  );

  const btn: React.CSSProperties = {
    font: "600 12px/1 system-ui, sans-serif",
    border: "1px solid rgba(0,0,0,.18)",
    borderRadius: 7,
    padding: "7px 10px",
    background: "#fff",
    color: "#1a120b",
    cursor: "pointer",
  };

  return createPortal(
    <>
      {/* PAGE LAYER — pins + the pending input live at document coordinates, so
          they stay stuck to the page and scroll with it. */}
      <div
        data-devcomment="1"
        style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none", zIndex: Z }}
      >
        {pins.map((n) => (
          <div key={n.id} style={{ position: "absolute", top: n.y, left: n.x, pointerEvents: "auto" }}>
            <button
              onClick={() => setActivePin((p) => (p === n.id ? null : n.id))}
              title={n.note}
              style={{
                transform: "translate(-50%,-50%)",
                width: 24,
                height: 24,
                borderRadius: "50%",
                border: "2px solid #fff",
                background: "#c0392b",
                color: "#fff",
                font: "700 12px/1 system-ui",
                cursor: "pointer",
                boxShadow: "0 2px 6px rgba(0,0,0,.4)",
              }}
            >
              {notes.indexOf(n) + 1}
            </button>
            {activePin === n.id && (
              <div
                style={{
                  position: "absolute",
                  top: 16,
                  left: 0,
                  width: 240,
                  background: "#1a120b",
                  color: "#f3e7cf",
                  border: "1px solid rgba(224,169,77,.4)",
                  borderRadius: 8,
                  padding: "10px 12px",
                  font: "13px/1.4 system-ui",
                  boxShadow: "0 8px 24px rgba(0,0,0,.4)",
                }}
              >
                <div style={{ marginBottom: 6 }}>{n.note}</div>
                {n.text && (
                  <div style={{ opacity: 0.6, fontSize: 11, marginBottom: 8 }}>on: “{n.text}”</div>
                )}
                <button onClick={() => removeNote(n.id)} style={{ ...btn, fontSize: 11, padding: "4px 8px" }}>
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}

        {/* pending note input — also page-anchored, stays where you clicked */}
        {pending && (
        <div
          style={{
            position: "absolute",
            top: pending.y,
            left: pending.x,
            transform: "translate(-6px,8px)",
            width: 260,
            background: "#1a120b",
            color: "#f3e7cf",
            border: "1px solid rgba(224,169,77,.5)",
            borderRadius: 10,
            padding: 12,
            boxShadow: "0 10px 30px rgba(0,0,0,.5)",
            pointerEvents: "auto",
          }}
        >
          {pending.text && (
            <div style={{ opacity: 0.65, fontSize: 11, marginBottom: 6 }}>
              on: “{pending.text.slice(0, 70)}”
            </div>
          )}
          <textarea
            autoFocus
            value={pending.draft}
            onChange={(e) => setPending((p) => (p ? { ...p, draft: e.target.value } : p))}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) save();
              if (e.key === "Escape") setPending(null);
            }}
            placeholder="What should change here? (⌘/Ctrl+Enter to save)"
            rows={3}
            style={{
              width: "100%",
              boxSizing: "border-box",
              background: "#0e0a06",
              color: "#f3e7cf",
              border: "1px solid rgba(224,169,77,.3)",
              borderRadius: 6,
              padding: 8,
              font: "13px/1.4 system-ui",
              resize: "vertical",
            }}
          />
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button onClick={save} style={{ ...btn, background: "#e0a94d", borderColor: "#e0a94d" }}>
              Save
            </button>
            <button onClick={() => setPending(null)} style={btn}>
              Cancel
            </button>
          </div>
        </div>
        )}
      </div>

      {/* VIEWPORT LAYER — hover highlight + control panel, anchored to the screen. */}
      <div
        data-devcomment="1"
        style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: Z }}
      >
        {(on || editMode) && hover && !edit && (
          <div
            style={{
              position: "fixed",
              left: hover.left,
              top: hover.top,
              width: hover.width,
              height: hover.height,
              border: "2px solid #e0a94d",
              background: "rgba(224,169,77,.12)",
              borderRadius: 4,
              pointerEvents: "none",
            }}
          />
        )}
        {edit && (
          <div
            style={{
              position: "fixed",
              left: "50%",
              bottom: 16,
              transform: "translateX(-50%)",
              width: "min(560px, calc(100vw - 24px))",
              background: "#1a120b",
              color: "#f3e7cf",
              border: "1px solid rgba(224,169,77,.5)",
              borderRadius: 10,
              padding: 12,
              boxShadow: "0 10px 30px rgba(0,0,0,.5)",
              font: "13px/1.45 system-ui",
              pointerEvents: "auto",
            }}
          >
            <div style={{ marginBottom: 8 }}>{edit.status}</div>
            {edit.choices && (
              <div style={{ display: "grid", gap: 6, marginBottom: 8, maxHeight: "40vh", overflow: "auto" }}>
                {edit.choices.map((c) => (
                  <button
                    key={c.id}
                    disabled={edit.busy}
                    onClick={() => saveEdit([c.id])}
                    style={{ ...btn, textAlign: "left", fontWeight: 400, lineHeight: 1.35 }}
                  >
                    <b>
                      {c.file}:{c.line}
                    </b>
                    <br />
                    <span style={{ opacity: 0.65 }}>{c.preview}</span>
                  </button>
                ))}
                <button disabled={edit.busy} onClick={() => saveEdit(edit.choices!.map((c) => c.id))} style={btn}>
                  Change all {edit.choices.length}
                </button>
              </div>
            )}
            <div style={{ display: "flex", gap: 8 }}>
              {!edit.choices && (
                <button
                  disabled={edit.busy}
                  onClick={() => saveEdit()}
                  style={{ ...btn, background: "#e0a94d", borderColor: "#e0a94d" }}
                >
                  Save
                </button>
              )}
              <button disabled={edit.busy} onClick={() => closeEdit(true)} style={btn}>
                Cancel
              </button>
            </div>
          </div>
        )}
        <div style={{ position: "fixed", right: 12, top: 76, pointerEvents: "auto" }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "flex-end" }}>
          <button
            onClick={() => {
              setOn(false);
              if (editMode) closeEdit(true);
              setHover(null);
              setEditMode((v) => !v);
            }}
            style={{
              ...btn,
              background: editMode ? "#c0392b" : "#fff",
              color: editMode ? "#fff" : "#1a120b",
              borderColor: editMode ? "#c0392b" : "rgba(0,0,0,.18)",
            }}
          >
            {editMode ? "● Editing — click any text" : "✎ Edit text"}
          </button>
          <button
            onClick={() => {
              closeEdit(true);
              setEditMode(false);
              setOn((v) => !v);
            }}
            style={{
              ...btn,
              background: on ? "#c0392b" : "#fff",
              color: on ? "#fff" : "#1a120b",
              borderColor: on ? "#c0392b" : "rgba(0,0,0,.18)",
            }}
          >
            {on ? "● Commenting — click elements" : "💬 Comment"}
          </button>
          <button onClick={() => setOpen((v) => !v)} style={btn} title="Notes">
            {notes.length}
          </button>
        </div>
        {open && (
          <div
            style={{
              marginTop: 8,
              width: 280,
              maxHeight: "60vh",
              overflow: "auto",
              background: "#fff",
              border: "1px solid rgba(0,0,0,.14)",
              borderRadius: 10,
              padding: 12,
              boxShadow: "0 12px 34px rgba(0,0,0,.22)",
              font: "13px/1.45 system-ui",
              color: "#1a120b",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <b>Notes ({notes.length})</b>
              {notes.length > 0 && (
                <button onClick={clearAll} style={{ ...btn, fontSize: 11, padding: "3px 7px" }}>
                  Clear all
                </button>
              )}
            </div>
            <div style={{ opacity: 0.6, fontSize: 11, marginBottom: 8 }}>
              {onThisPage.length} on this page · saved to .dev-notes.json
            </div>
            {notes.length === 0 && <div style={{ opacity: 0.6 }}>No notes yet — turn on Comment and click something.</div>}
            {notes.map((n, i) => (
              <div key={n.id} style={{ padding: "6px 0", borderTop: i ? "1px solid rgba(0,0,0,.08)" : "none" }}>
                <div>
                  <b>{i + 1}.</b> {n.note}
                </div>
                <div style={{ opacity: 0.55, fontSize: 11 }}>
                  {n.url}
                  {n.text ? ` · “${n.text.slice(0, 40)}”` : ""}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </div>
    </>,
    document.body,
  );
}
