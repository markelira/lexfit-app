"use client";

import { LxIcon } from "@/components/LxIcon";
import { lxPaths } from "@/lib/icons";

// Avatar (photo → initial → user icon) + name + meta + streak pill + settings
// button (30 §30.3.1). Streak pill hidden entirely at 0. The 26px edit badge keeps
// a 44px hit area (.hit44).
export function IdentityCard({
  name, photoURL, meta, streak, onEditAvatar, onSettings,
}: {
  name: string;
  photoURL: string | null;
  meta: string;
  streak: number;
  onEditAvatar: () => void;
  onSettings: () => void;
}) {
  const initial = name?.trim()?.[0]?.toUpperCase() ?? "";
  return (
    <div className="pf-identity">
      <div className="ava-wrap">
        <div
          className={`ava${photoURL ? " has-photo" : ""}`}
          style={photoURL ? { backgroundImage: `url(${photoURL})` } : undefined}
        >
          {!photoURL && (initial || <LxIcon d={lxPaths.user} size={32} />)}
        </div>
        <button
          type="button"
          className="ava-edit hit44"
          aria-label="Profilkép módosítása"
          onClick={onEditAvatar}
        >
          <LxIcon d={lxPaths.pencil} size={12} />
        </button>
      </div>

      <div className="id-main">
        <div className="id-top">
          <h1 className="id-name">{name}</h1>
          <div className="id-actions">
            {streak > 0 && (
              <span className="id-streak">
                <LxIcon d={lxPaths.flame} size={12} fill /> {streak} NAPOS SOROZAT
              </span>
            )}
            <button type="button" className="lxbtn s secondary id-set" onClick={onSettings}>
              <LxIcon d={lxPaths.sliders} size={15} /> Beállítások
            </button>
          </div>
        </div>
        <div className="id-meta">{meta}</div>
      </div>
    </div>
  );
}
