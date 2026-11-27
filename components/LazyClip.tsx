"use client";

import * as React from "react";

/** A muted looping tile clip that downloads nothing until it scrolls near the
    viewport, and pauses again once it leaves — the poster stands in until then. */
export default function LazyClip({ src, poster, reduced }: { src: string; poster?: string; reduced: boolean }) {
  const ref = React.useRef<HTMLVideoElement>(null);
  const [near, setNear] = React.useState(false);
  const [inView, setInView] = React.useState(false);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        setInView(e.isIntersecting);
        if (e.isIntersecting) setNear(true);
      },
      { rootMargin: "200px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  // The <source> only exists once the tile is near, so load it in then.
  React.useEffect(() => {
    if (near) ref.current?.load();
  }, [near]);
  React.useEffect(() => {
    const el = ref.current;
    if (!el || !near) return;
    if (inView && !reduced) el.play().catch(() => {});
    else el.pause();
  }, [near, inView, reduced]);
  return (
    <video ref={ref} poster={poster} muted loop playsInline preload="none">
      {near && <source src={src} type="video/mp4" />}
    </video>
  );
}
