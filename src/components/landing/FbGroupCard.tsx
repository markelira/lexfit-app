"use client";

import Image from "next/image";
import { LxIcon } from "@/components/LxIcon";
import { lxPaths } from "@/lib/icons";

/**
 * The Facebook group, rendered as a group card.
 *
 * §11 talks about "amit a csoportban kitalálunk" and a cold visitor has no idea what
 * that group is, how big it is, or that it is free. This block answers all three at a
 * glance by borrowing the one layout everyone already knows: cover strip → name →
 * privacy + member count → join button.
 *
 * Deliberately NOT a fake Facebook screenshot. No invented posts, comments, member
 * names or avatars - nothing here claims to be content that exists. It is a link to
 * the group, wearing the group's own furniture, which is exactly what a share card is.
 */
export function FbGroupCard({
  url,
  name = "Szavazz Magadra - Otthoni Edzés & Fitnesz Közösség",
  members = "1 200+",
}: {
  url: string;
  name?: string;
  members?: string;
}) {
  return (
    <div className="fbg">
      {/* The group's actual cover. It already carries the name and the mechanic
          ("Heti kihívás. Együtt döntünk. Együtt csináljuk"), which is why no
          generated wordmark sits on top of it. Cropped from the centre so the
          headline block survives at every card width - see landing.css. */}
      <div className="fbg-cover">
        <Image
          src="/fb-group-cover.jpg"
          alt="Szavazz Magadra - heti kihívás. Együtt döntünk. Együtt csináljuk."
          fill
          sizes="(max-width: 600px) 100vw, 560px"
        />
      </div>

      <div className="fbg-body">
        <div className="fbg-id">
          <span className="fbg-logo" aria-hidden="true">
            {/* Facebook's own mark - this links to a Facebook group, so the mark is
                wayfinding, not decoration. Single path, so it stays crisp at 20px. */}
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.09 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.89v2.25h3.32l-.53 3.49h-2.79V24C19.61 23.09 24 18.1 24 12.07Z" />
            </svg>
          </span>
          <div className="fbg-txt">
            <div className="fbg-name">{name}</div>
            <div className="fbg-meta">
              <LxIcon d={lxPaths.users} size={13} />
              <span>Facebook-csoport · {members} tag · ingyenes</span>
            </div>
          </div>
        </div>

        {/* Short label on purpose: the two lines to its left already say which group
            and that it is on Facebook, and the long form pushed the meta line to wrap.
            The full phrase stays as the accessible name. */}
        <a
          className="fbg-join"
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Csatlakozom a(z) ${name} Facebook-csoporthoz`}
        >
          Csatlakozom
        </a>
      </div>
    </div>
  );
}
