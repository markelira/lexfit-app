"use client";

import { useEffect, useRef, useState } from "react";
import { LxIcon } from "@/components/LxIcon";
import { lxPaths } from "@/lib/icons";

// Horizontal, scroll-buttoned content rail (Netflix-style row). Shared by the
// Videótár and the Foundation home. Renders nothing when empty.
export function Rail<T>({
  title, sub, items, renderItem, onAll,
}: {
  title: string;
  sub?: string;
  items: T[];
  renderItem: (v: T) => React.ReactNode;
  onAll?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const upd = () => {
    const el = ref.current;
    if (!el) return;
    setAtStart(el.scrollLeft < 8);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 8);
  };
  useEffect(() => { upd(); }, [items]);
  const scroll = (dir: number) => ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.8, behavior: "smooth" });
  if (!items.length) return null;
  return (
    <section className="nxrail-sec">
      <div className="nxrail-head">
        <h3>{title}</h3>
        {sub && <span className="sub">{sub}</span>}
        {onAll && <button className="all" onClick={onAll}>Mind ({items.length}) <LxIcon d={lxPaths.arrowR} size={14} /></button>}
      </div>
      <div className="nxrail-wrap">
        <button className="nxrail-btn l" disabled={atStart} onClick={() => scroll(-1)} aria-label="Vissza">
          <span><LxIcon d={lxPaths.arrowR} size={17} style={{ transform: "rotate(180deg)" }} /></span>
        </button>
        <div className="nxrail" ref={ref} onScroll={upd}>
          {items.map((v) => renderItem(v))}
        </div>
        <button className="nxrail-btn r" disabled={atEnd} onClick={() => scroll(1)} aria-label="Tovább">
          <span><LxIcon d={lxPaths.arrowR} size={17} /></span>
        </button>
      </div>
    </section>
  );
}
