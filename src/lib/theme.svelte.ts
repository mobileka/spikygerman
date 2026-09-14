export type Theme = "light" | "dark";

const storageKey = "spiky-theme";

function systemTheme(): Theme {
  if (typeof window === "undefined" || !window.matchMedia) return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function readSaved(): Theme | null {
  try {
    const value = localStorage.getItem(storageKey);
    return value === "dark" || value === "light" ? value : null;
  } catch {
    return null;
  }
}

function readApplied(): Theme {
  if (typeof document === "undefined") return "light";
  return document.documentElement.getAttribute("data-theme") === "dark"
    ? "dark"
    : "light";
}

let currentTheme = $state<Theme>(readApplied());

export function getTheme(): Theme {
  return currentTheme;
}

function apply(next: Theme): void {
  currentTheme = next;
  if (typeof document !== "undefined") {
    document.documentElement.setAttribute("data-theme", next);
  }
}

export function toggleTheme(): void {
  const next: Theme = currentTheme === "dark" ? "light" : "dark";
  try {
    localStorage.setItem(storageKey, next);
  } catch {
    // Private mode or full storage: the choice still applies for this session.
  }
  apply(next);
}

// Follow the system only while the learner has not made an explicit choice.
if (typeof window !== "undefined" && window.matchMedia) {
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", () => {
      if (!readSaved()) apply(systemTheme());
    });
}
