// Tweaks for the Eloise Marchand portfolio.
// Persists palette / accent / mat via __edit_mode_set_keys; applies live by
// rewriting CSS custom properties on :root.

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": ["#ffffff", "#f6f3ec", "#ede7d8", "#c9bfa8", "#1a1612", "#3a322a", "#6b6055"],
  "accent": "oklch(0.42 0.11 25)",
  "mat":    "#ffffff"
}/*EDITMODE-END*/;

// Each palette = [paper, paper-2, paper-3, rule, ink, ink-2, ink-3]
const PALETTES = [
  ["#ffffff", "#f6f3ec", "#ede7d8", "#c9bfa8", "#1a1612", "#3a322a", "#6b6055"], // Pure white
  ["#efe9dc", "#e7e0cf", "#ddd4bd", "#c9bfa8", "#1a1612", "#3a322a", "#6b6055"], // Cream (original)
  ["#f5f1e8", "#ebe5d5", "#ddd4bd", "#c5bba4", "#1a1612", "#3a322a", "#6b6055"], // Bone
  ["#eef0f4", "#e1e5ec", "#cdd3df", "#b9c0cd", "#0f1419", "#2a323e", "#5b6373"], // Slate
  ["#1f1c18", "#27241f", "#2f2c26", "#3a352e", "#efe9dc", "#d7d2c4", "#a89f8d"], // Midnight (dark)
];

const ACCENTS = [
  "oklch(0.42 0.11 25)",   // Oxblood (default)
  "oklch(0.45 0.08 150)",  // Forest
  "oklch(0.42 0.13 250)",  // Cobalt
  "oklch(0.30 0.01 80)",   // Charcoal
];

const MATS = [
  "#ffffff",                  // Pure white
  "oklch(0.965 0.012 80)",    // Off-white (museum)
  "#f0ece2",                  // Warm cream
  "#e8e6e0",                  // Soft pearl
];

function applyTweaks(t) {
  const r = document.documentElement.style;
  const [p, p2, p3, rule, ink, ink2, ink3] = t.palette;
  r.setProperty('--paper', p);
  r.setProperty('--paper-2', p2);
  r.setProperty('--paper-3', p3);
  r.setProperty('--rule', rule);
  r.setProperty('--ink', ink);
  r.setProperty('--ink-2', ink2);
  r.setProperty('--ink-3', ink3);
  r.setProperty('--oxblood', t.accent);
  r.setProperty('--oxblood-ink', t.accent);
  r.setProperty('--mat', t.mat);
}

function TweaksApp() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  React.useEffect(() => applyTweaks(t), [t]);

  return (
    <TweaksPanel>
      <TweakSection label="Palette" />
      <TweakColor label="Background"
                  value={t.palette}
                  options={PALETTES}
                  onChange={(v) => setTweak('palette', v)} />

      <TweakSection label="Accent" />
      <TweakColor label="Accent color"
                  value={t.accent}
                  options={ACCENTS}
                  onChange={(v) => setTweak('accent', v)} />

      <TweakSection label="Painting mat" />
      <TweakColor label="Passe-partout"
                  value={t.mat}
                  options={MATS}
                  onChange={(v) => setTweak('mat', v)} />
    </TweaksPanel>
  );
}

const root = document.createElement('div');
document.body.appendChild(root);
ReactDOM.createRoot(root).render(<TweaksApp />);
