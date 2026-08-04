import Image from "next/image";

// The step-aware left column for the /register wizard. Same frame as AuthBrand
// (LEXFIT mark top · Alexa foot bottom), but the MIDDLE body sells the feature
// the current question is about. Static per step; cross-fades on change.
// Data + rationale: docs/onboarding-left-panels.md. Apple-design: one strong
// element per panel, everything else quiet; transform/opacity motion only.
//
// Slogan rule: default = "A változás otthon kezdődik"; the community/belonging
// panels (goal, obstacle, reveal) use "Egyedül nehéz. Együtt muszáj." instead.

const FACES = ["R", "D", "N", "K", "E", "Zs"];
const CATEGORIES = ["Alsótest", "Felsőtest", "Cardio + has", "Teljes test", "Mobility", "Tartás-fókusz"];
const LEVELS = [
  { f: "🔥", n: "Kezdő", s: "most kezdem / újrakezdem" },
  { f: "🔥🔥", n: "Közepes", s: "az alapok mennek" },
  { f: "🔥🔥🔥", n: "Haladó", s: "jöhet a kihívás" },
];
const WEEK = [
  { d: "H", w: "Alsótest" }, { d: "K", w: "Felsőtest" }, { d: "Sze", w: "pihenő", rest: true },
  { d: "Cs", w: "Cardio + has" }, { d: "P", w: "Teljes test" }, { d: "Szo", w: "Mobility" },
  { d: "V", w: "pihenő", rest: true },
];
const SITUATIONS = ["🔇 Csendes", "🪑 Falra fogva", "Térdkímélő", "Hátkímélő", "🌅 Reggeli", "🌙 Esti"];

type PanelKey =
  | "welcome" | "community" | "focus" | "level" | "days" | "player" | "env"
  | "alone" | "story" | "promise" | "reassure";

function panelFor(step: string): PanelKey {
  switch (step) {
    case "goal": return "community";
    case "focus": return "focus";
    case "level": return "level";
    case "days": return "days";
    case "time": return "player";
    case "env": return "env";
    case "obstacle": return "alone";
    case "why": return "story";
    case "reveal": return "promise";
    case "plan": case "account": case "pay": return "reassure";
    default: return "welcome";
  }
}

function PanelBody({ k }: { k: PanelKey }) {
  switch (k) {
    case "community":
      return (
        <>
          <span className="bp-eyebrow mono">A közösség</span>
          <div className="bp-head bp-slogan">Egyedül nehéz.<br /><b>Együtt muszáj.</b></div>
          <div className="bp-visual bp-community">
            <div className="bp-faces" aria-hidden="true">
              {FACES.map((f, i) => <span key={i} className="bp-face">{f}</span>)}
              <span className="bp-face bp-more">+</span>
            </div>
            <div className="bp-bignum">
              <b>1 200+</b>
              <span className="mono">csoporttag — akik már csinálják</span>
            </div>
          </div>
          <p className="bp-note">Pénteken szavazunk, hétfőn rajt. 52 heti kihívás mögöttünk — és minden héten együtt kezdünk.</p>
        </>
      );
    case "focus":
      return (
        <>
          <span className="bp-eyebrow mono">Minden területre</span>
          <div className="bp-head">Van edzés arra, ahol erősödni akarsz.</div>
          <div className="bp-visual bp-chips">
            {CATEGORIES.map((c) => <span key={c} className="bp-chip">{c}</span>)}
          </div>
          <p className="bp-note">Fenék, has, kar, hát, teljes test — konkrét gyakorlatokkal: Csípőemelés, Térdelt evezés, Guggolás, Halott bogár…</p>
        </>
      );
    case "level":
      return (
        <>
          <span className="bp-eyebrow mono">Minden szint</span>
          <div className="bp-head">A szint igazodik hozzád.</div>
          <div className="bp-visual bp-levels">
            {LEVELS.map((l) => (
              <div key={l.n} className="bp-level">
                <span className="bp-flame" aria-hidden="true">{l.f}</span>
                <span className="bp-lv"><b>{l.n}</b><span>{l.s}</span></span>
              </div>
            ))}
          </div>
          <p className="bp-note">Minden mozdulathoz van könnyített és nehezített változat — pl. fal-fekvőtámasz vagy térdelt.</p>
        </>
      );
    case "days":
      return (
        <>
          <span className="bp-eyebrow mono">A heted</span>
          <div className="bp-head">Napi 30 perc. A pihenő is a terv része.</div>
          <div className="bp-visual bp-week">
            {WEEK.map((d, i) => (
              <div key={i} className={`bp-wd${d.rest ? " rest" : ""}`}>
                <span className="bp-wl mono">{d.d}</span>
                <span className="bp-ww">{d.w}</span>
              </div>
            ))}
          </div>
          <p className="bp-note">Kevesebb nap = nyugodtabb tempó, ugyanaz az út. 5 edzés + 2 pihenő, eszköz nélkül.</p>
        </>
      );
    case "player":
      return (
        <>
          <span className="bp-eyebrow mono">A lejátszó</span>
          <div className="bp-head">Hang nélkül is végigvezet.</div>
          <div className="bp-visual bp-player" aria-hidden="true">
            <div className="bp-pl-rep mono">3 / 12 · FŐ RÉSZ</div>
            <div className="bp-pl-next mono">Következik: <b>Kitörés</b></div>
            <div className="bp-pl-now">Guggolás</div>
            <div className="bp-pl-cd">
              <span className="mono">Hátra van</span>
              <b className="tabular">00:42</b>
            </div>
          </div>
          <p className="bp-note">Mindig látod, mit csinálsz most, mi jön, és mennyi van hátra. A tempó a tiéd — és a TV-re is kirakhatod.</p>
        </>
      );
    case "env":
      return (
        <>
          <span className="bp-eyebrow mono">Minden helyzetre</span>
          <div className="bp-head">Bármi is az — van rá változat.</div>
          <div className="bp-visual bp-chips">
            {SITUATIONS.map((s) => <span key={s} className="bp-chip">{s}</span>)}
          </div>
          <p className="bp-note">30+ videó, szomszéd-barát és ízület-kímélő változatokkal — a te helyzetedhez.</p>
        </>
      );
    case "alone":
      return (
        <>
          <span className="bp-eyebrow mono">Nem vagy egyedül</span>
          <div className="bp-head bp-slogan">Nem azért, mert lusta vagy.<br /><b>Hanem mert egyedül tényleg nehéz.</b></div>
          <p className="bp-note">1 200+ csoporttag ugyanitt kezdte — ugyanezekkel a kifogásokkal. Együtt más.</p>
        </>
      );
    case "story":
      return (
        <>
          <span className="bp-eyebrow mono">Az alapító</span>
          <div className="bp-visual bp-story">
            <div className="bp-photo">
              <Image src="/alexa-av.jpg" alt="Alexa" width={96} height={96} />
            </div>
            <div className="bp-chapters">
              <span>10 év a szőnyegen.</span>
              <span>2023-ban abbahagytam.</span>
              <span>Egy évig kerestem magam.</span>
            </div>
          </div>
          <div className="bp-head bp-slogan"><b>„Egyedül nem megy.”</b></div>
          <p className="bp-note">Ezt a közösséget azért építettem, mert pontosan azt éltem át, amit te — és a csapat hozott vissza.</p>
        </>
      );
    case "promise":
      return (
        <>
          <span className="bp-eyebrow mono">Az ígéretem</span>
          <div className="bp-head bp-promise">
            <span>Nem mondom meg, mit csinálj.</span>
            <span>Nem ítéllek el, ha kimaradsz.</span>
            <span className="bp-em">Együtt muszáj.</span>
          </div>
          <p className="bp-note">A terved kész — innentől együtt csináljuk. 1 200+ csoporttaggal a hátad mögött.</p>
        </>
      );
    case "reassure":
      return (
        <>
          <span className="bp-eyebrow mono">Nyugodt szívvel</span>
          <div className="bp-head">A közösség ingyenes marad.</div>
          <p className="bp-note">Ez az előfizetés a <b>programot</b> nyitja meg — a vezetett edzéseket és a teljes videótárat. Bármikor lemondható, 14 napos garanciával.</p>
        </>
      );
    default: // welcome
      return (
        <>
          <div className="bp-head bp-slogan">A változás<br /><b>otthon kezdődik.</b></div>
          <div className="bp-stats">
            <div className="s"><div className="v">30 perc</div><div className="k mono">egy edzés</div></div>
            <div className="s"><div className="v">Otthon</div><div className="k mono">eszköz nélkül</div></div>
            <div className="s"><div className="v">1 200+</div><div className="k mono">csoporttag</div></div>
          </div>
        </>
      );
  }
}

export function BrandPanel({ step }: { step: string }) {
  const k = panelFor(step);
  return (
    <aside className="authx-brand bp">
      <div className="bmark">
        <span className="bmark-ico">
          <svg viewBox="0 0 680 616" aria-hidden="true">
            <g transform="translate(-192,-152)">
              <path d="M248 712A400 400 0 0 1 648 312" fill="none" stroke="#ffffff" strokeWidth="112" strokeLinecap="round" />
              <circle cx="800" cy="224" r="72" fill="#ffffff" />
            </g>
          </svg>
        </span>
        <span className="wm">LEXFIT</span>
      </div>

      <div className="bbody bp-swap" key={k}>
        <PanelBody k={k} />
      </div>

      <div className="bfoot">
        <div className="bav">
          <Image src="/trainer-underlayer.jpg" alt="Alexa, a LEXFIT alapítója és edzője" width={44} height={44} />
        </div>
        <div className="t">
          <b>Alexa</b>
          <span>Alapító · minden edzést ő vezet</span>
        </div>
      </div>
    </aside>
  );
}
