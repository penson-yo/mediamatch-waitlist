import { useEffect, useState } from "react";
import { isGoogleFormConfigured, submitToGoogleForm } from "./googleForm";
import "./App.css";

const ROLES = ["Journalist", "Source"];

function Sparkle({ className = "", fill = "currentColor" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill={fill}
        d="M12 1.2c.18 0 .34.1.42.27C13.7 4.7 16.7 8.3 19.9 11.1c.3.26.3.72 0 .98-3.2 2.8-6.2 6.4-7.48 9.63a.48.48 0 0 1-.84 0C10.3 18.7 7.3 15.1 4.1 12.08a.64.64 0 0 1 0-.98C7.3 8.3 10.3 4.7 11.58 1.47A.48.48 0 0 1 12 1.2z"
      />
    </svg>
  );
}

function Ambient() {
  return (
    <div className="ambient" aria-hidden="true">
      <span className="orb orb-a" />
      <span className="orb orb-b" />
      <span className="orb orb-c" />
      <Sparkle className="float-spark spark-a" fill="#f49fe6" />
      <Sparkle className="float-spark spark-b" fill="#7d8aff" />
      <Sparkle className="float-spark spark-c" fill="#ffffff" />
    </div>
  );
}

function BrandMark({ size = "md" }) {
  return (
    <img
      className={`logo logo-${size}`}
      src="/logo.png"
      alt="Mediamatch"
      width="304"
      height="304"
    />
  );
}

function Wordmark() {
  return (
    <p className="wordmark">
      <span>Mediamatch</span> by Pressto <Sparkle className="wordmark-spark" fill="#7d8aff" />
    </p>
  );
}

function Splash({ onContinue }) {
  useEffect(() => {
    const timer = window.setTimeout(onContinue, 2600);
    return () => window.clearTimeout(timer);
  }, [onContinue]);

  return (
    <section className="screen splash" onClick={onContinue}>
      <div className="splash-inner">
        <BrandMark size="lg" />
        <h1 className="splash-title">Mediamatch</h1>
        <p className="splash-byline">
          by Pressto <Sparkle className="wordmark-spark" fill="#7d8aff" />
        </p>
      </div>
    </section>
  );
}

function WaitlistForm({ onSuccess }) {
  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    role: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function update(field) {
    return (event) => {
      setForm((current) => ({ ...current, [field]: event.target.value }));
      setError("");
    };
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!form.name.trim() || !form.company.trim() || !form.email.trim() || !form.role) {
      setError("Please fill in every field.");
      return;
    }

    setBusy(true);
    setError("");

    try {
      if (isGoogleFormConfigured()) {
        await submitToGoogleForm(form);
      } else if (import.meta.env.PROD) {
        throw new Error("Waitlist is not connected yet.");
      }
      onSuccess();
    } catch {
      setError("Something went wrong. Please try again.");
      setBusy(false);
    }
  }

  return (
    <section className="screen form-screen">
      <div className="form-shell">
        <BrandMark size="sm" />
        <p className="eyebrow">Join the list</p>
        <h2 className="headline">
          Get in early on <em>Mediamatch</em>
        </h2>
        <p className="tagline">
          Where journalists find <em>expert voices</em> — and experts make the news.
        </p>

        <form className="waitlist-form" onSubmit={handleSubmit} noValidate>
          <label className="field">
            <span>Name</span>
            <input
              name="name"
              autoComplete="name"
              value={form.name}
              onChange={update("name")}
              placeholder="Your name"
              required
            />
          </label>
          <label className="field">
            <span>Company</span>
            <input
              name="company"
              autoComplete="organization"
              value={form.company}
              onChange={update("company")}
              placeholder="Newsroom, brand, or agency"
              required
            />
          </label>
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              name="email"
              autoComplete="email"
              value={form.email}
              onChange={update("email")}
              placeholder="you@example.com"
              required
            />
          </label>

          <label className="field">
            <span>Are you a journalist or source?</span>
            <div className="select-wrap">
              <select
                name="role"
                value={form.role}
                onChange={update("role")}
                required
                className={form.role ? "" : "is-placeholder"}
              >
                <option value="" disabled>
                  Select one
                </option>
                {ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
          </label>

          {error ? <p className="form-error">{error}</p> : null}

          <button className="submit" type="submit" disabled={busy}>
            {busy ? "Joining…" : "Join waitlist"}
          </button>
        </form>

        <footer className="page-foot">
          <Wordmark />
          <p className="legal">
            <a href="https://www.heypressto.ai/privacy-policy">Privacy Policy</a>
            <span>·</span>
            <a href="https://www.heypressto.ai/terms-of-service">Terms of Service</a>
          </p>
        </footer>
      </div>
    </section>
  );
}

const WAITLIST_SPOT_KEY = "mediamatch-waitlist-spot";
const WAITLIST_CROWD_KEY = "mediamatch-waitlist-crowd";

function getWaitlistSpot() {
  try {
    const existing = sessionStorage.getItem(WAITLIST_SPOT_KEY);
    if (existing) return Number(existing);
  } catch {
    // ignore
  }

  const hoursSinceStart = Math.max(
    0,
    (Date.now() - Date.UTC(2026, 4, 1)) / 3_600_000
  );
  let crowd = Math.min(1470, 780 + Math.floor(hoursSinceStart / 7.5));

  try {
    const lastSeen = Number(localStorage.getItem(WAITLIST_CROWD_KEY) || 0);
    if (lastSeen >= crowd) {
      crowd = Math.min(1500, lastSeen + 1 + Math.floor(Math.random() * 3));
    } else {
      crowd = Math.min(1500, crowd + Math.floor(Math.random() * 6));
    }
  } catch {
    crowd = Math.min(1500, crowd + Math.floor(Math.random() * 6));
  }

  const spot = Math.max(700, crowd);

  try {
    sessionStorage.setItem(WAITLIST_SPOT_KEY, String(spot));
    localStorage.setItem(WAITLIST_CROWD_KEY, String(spot));
  } catch {
    // ignore
  }

  return spot;
}

function WaitlistCount() {
  const [target] = useState(getWaitlistSpot);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      setCount(target);
      return;
    }

    const duration = 1400;
    const start = performance.now();
    let frame = 0;

    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - progress) ** 3;
      setCount(Math.round(target * eased));
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target]);

  return (
    <p className="waitlist-count">
      You’re <span>#{count.toLocaleString("en-US")}</span> on the waitlist
    </p>
  );
}

function Thanks() {
  return (
    <section className="screen thanks">
      <div className="thanks-inner">
        <BrandMark size="md" />
        <h2 className="headline thanks-title">
          You’re on the <em>list</em>
        </h2>
        <p className="tagline">
          Thanks for signing up, we'll let you know when you're in!
        </p>
        <WaitlistCount />
        <footer className="page-foot">
          <Wordmark />
        </footer>
      </div>
    </section>
  );
}

export default function App() {
  const [screen, setScreen] = useState("splash");

  return (
    <main className="app">
      <Ambient />
      {screen === "splash" ? (
        <Splash onContinue={() => setScreen("form")} />
      ) : null}
      {screen === "form" ? (
        <WaitlistForm onSuccess={() => setScreen("thanks")} />
      ) : null}
      {screen === "thanks" ? <Thanks /> : null}
    </main>
  );
}
