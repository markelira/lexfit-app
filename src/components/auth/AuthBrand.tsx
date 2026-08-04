import Image from "next/image";

// The shared left-hand brand panel for the auth/onboarding split-screen. One
// component so /login and the /register wizard render an IDENTICAL panel — moving
// between them never feels like a new page. Markup + classes match auth.css
// (`.authx-brand`). Copy is the reframed, no-fixed-length marketing (pending the
// full rewrite); keep it identical to the funnel's messaging.
export function AuthBrand() {
  return (
    <aside className="authx-brand">
      <div className="bmark">
        <span className="bmark-ico">
          <svg viewBox="0 0 680 616" aria-hidden="true">
            <g transform="translate(-192,-152)">
              <path
                d="M248 712A400 400 0 0 1 648 312"
                fill="none"
                stroke="#ffffff"
                strokeWidth="112"
                strokeLinecap="round"
              />
              <circle cx="800" cy="224" r="72" fill="#ffffff" />
            </g>
          </svg>
        </span>
        <span className="wm">LEXFIT</span>
      </div>

      <div className="bbody">
        <div className="bquote">
          Egyedül nehéz.
          <br />
          <b>Együtt muszáj.</b>
        </div>
        <p className="bsub">
          Vezetett program otthonra, és egy közösség, ami megtart. Eszköz nélkül, napi 30
          percben.
        </p>
        <div className="bstats">
          <div className="s">
            <div className="v">30 perc</div>
            <div className="k">egy edzés</div>
          </div>
          <div className="s">
            <div className="v">Otthon</div>
            <div className="k">eszköz nélkül</div>
          </div>
          <div className="s">
            <div className="v">17 000+</div>
            <div className="k">a csoportban</div>
          </div>
        </div>
      </div>

      <div className="bfoot">
        <div className="bav">
          <Image
            src="/trainer-underlayer.jpg"
            alt="Alexa, a LEXFIT alapítója és edzője"
            width={44}
            height={44}
          />
        </div>
        <div className="t">
          <b>Alexa</b>
          <span>Alapító · minden edzést ő vezet</span>
        </div>
      </div>
    </aside>
  );
}
