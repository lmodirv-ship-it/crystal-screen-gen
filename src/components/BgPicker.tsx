import { useEffect, useState } from "react";
import { Palette, Check } from "lucide-react";

const THEMES = [
  { id: "default", label: "Blue", swatch: "oklch(0.55 0.21 260)" },
  { id: "violet", label: "Violet", swatch: "oklch(0.58 0.22 295)" },
  { id: "emerald", label: "Emerald", swatch: "oklch(0.6 0.17 160)" },
  { id: "sunset", label: "Sunset", swatch: "oklch(0.65 0.2 40)" },
  { id: "rose", label: "Rose", swatch: "oklch(0.65 0.21 350)" },
  { id: "night", label: "Night", swatch: "oklch(0.3 0.05 262)" },
] as const;

type ThemeId = (typeof THEMES)[number]["id"];
const KEY = "hn-bg-theme";

function applyTheme(id: ThemeId) {
  document.documentElement.dataset.bg = id;
}

export function BgPicker() {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<ThemeId>("default");

  useEffect(() => {
    const saved = (localStorage.getItem(KEY) as ThemeId) || "default";
    setTheme(saved);
    applyTheme(saved);
  }, []);

  const pick = (id: ThemeId) => {
    setTheme(id);
    applyTheme(id);
    localStorage.setItem(KEY, id);
  };

  return (
    <div className="fixed top-3 z-50 end-3" dir="ltr">
      <button
        type="button"
        aria-label="Choose background color"
        onClick={() => setOpen((v) => !v)}
        className="btn-ghost !rounded-full !p-2.5 shadow-md"
      >
        <Palette className="h-4 w-4" />
      </button>
      {open && (
        <div className="card absolute end-0 top-12 flex w-44 flex-col gap-1 p-2">
          {THEMES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => pick(t.id)}
              className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
            >
              <span
                className="h-4 w-4 rounded-full border border-border"
                style={{ background: t.swatch }}
              />
              <span className="flex-1 text-start">{t.label}</span>
              {theme === t.id && <Check className="h-3.5 w-3.5 text-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
