"use client";

import { useState } from "react";
import * as C from "../copy";
import { useSectionView } from "./useSectionView";
import { trackUjrakezdesCardPeek } from "@/lib/track";

// The real product, as cards (reveal redesign v2). Posters and animated
// previews come from Mux with image-only tokens - a card can show the real
// workout moving, but can never leak playback (media endpoint's contract).
//
// Interaction model (Apple-skill): press feedback is instant (scale on
// :active); hovering or pressing a card materializes its animated preview
// over the poster (opacity cross-fade - the two images are stacked, the
// animation only loads on first intent, so the row costs six posters, not
// six animations). The first card carries the play affordance and opens the
// theater; locked cards state their price honestly and take the reader to
// the offer, not to a dead end.

export interface MediaCard {
  code: string;
  title: string;
  theme: string;
  mins: number;
  poster: string;
  anim: string;
}

/** The first workout's card payload - playable via the real player's guest
 *  mode (/player/[code]?lt=), so no tokens travel to this component. */
export interface FirstMedia {
  code: string;
  title: string;
  theme: string;
  mins: number;
  poster: string;
}

export function WorkoutCardsRow({
  cards,
  onLockedTap,
}: {
  cards: MediaCard[];
  onLockedTap: () => void;
}) {
  const ref = useSectionView("workouts");
  if (!cards.length) return null;
  return (
    <section className="u2-blk u2-shelf" ref={ref} aria-label={C.REVEAL.shelf.aria}>
      <p className="u2-eyebrow">{C.REVEAL.shelf.eyebrow}</p>
      <h2>{C.REVEAL.shelf.hd}</h2>
      <div className="u2-shelf-row" role="list">
        {cards.map((card) => (
          <ShelfCard key={card.code} card={card} onTap={onLockedTap} />
        ))}
      </div>
      <p className="u2-xs">{C.REVEAL.shelf.note}</p>
    </section>
  );
}

function ShelfCard({ card, onTap }: { card: MediaCard; onTap: () => void }) {
  // The animated preview loads on first hover/press intent only.
  const [warm, setWarm] = useState(false);
  const [live, setLive] = useState(false);
  const arm = () => { setWarm(true); setLive(true); };
  const disarm = () => setLive(false);

  return (
    <button
      type="button"
      role="listitem"
      className="u2-card"
      onPointerEnter={arm}
      onPointerLeave={disarm}
      onPointerDown={arm}
      onFocus={arm}
      onBlur={disarm}
      onClick={() => { trackUjrakezdesCardPeek(card.code); onTap(); }}
    >
      <span className="u2-card-media">
        {/* eslint-disable-next-line @next/next/no-img-element -- signed, expiring Mux URL; next/image would proxy and cache-bust the token */}
        <img src={card.poster} alt="" loading="lazy" decoding="async" />
        {warm && (
          // eslint-disable-next-line @next/next/no-img-element -- see above
          <img src={card.anim} alt="" className={`anim${live ? " on" : ""}`} loading="lazy" decoding="async" />
        )}
        <span className="u2-card-mins">{card.mins} perc</span>
        <span className="u2-card-lock" aria-hidden="true">
          <svg viewBox="0 0 16 16" width="11" height="11"><path d="M4 7V5a4 4 0 1 1 8 0v2h.5A1.5 1.5 0 0 1 14 8.5v5A1.5 1.5 0 0 1 12.5 15h-9A1.5 1.5 0 0 1 2 13.5v-5A1.5 1.5 0 0 1 3.5 7H4Zm1.5 0h5V5a2.5 2.5 0 0 0-5 0v2Z" fill="currentColor"/></svg>
          {C.REVEAL.shelf.lock}
        </span>
      </span>
      <span className="u2-card-t">
        <b>{card.title}</b>
        <span>{card.theme}</span>
      </span>
    </button>
  );
}

/** The first workout's hero card - the free watch. */
export function FirstWorkoutCard({
  title,
  theme,
  mins,
  poster,
  onPlay,
}: {
  title: string;
  theme: string;
  mins: number;
  poster: string;
  onPlay: () => void;
}) {
  return (
    <button type="button" className="u2-first" onClick={onPlay}>
      <span className="u2-card-media">
        {/* eslint-disable-next-line @next/next/no-img-element -- signed, expiring Mux URL */}
        <img src={poster} alt="" loading="lazy" decoding="async" />
        <span className="u2-first-play" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="22" height="22"><path d="M8 5.5v13l11-6.5-11-6.5Z" fill="currentColor"/></svg>
        </span>
        <span className="u2-card-mins">{mins} perc</span>
        <span className="u2-first-free">{C.REVEAL.first.free}</span>
      </span>
      <span className="u2-card-t">
        <b>{title}</b>
        <span>{theme} · {C.REVEAL.first.sub}</span>
      </span>
    </button>
  );
}
