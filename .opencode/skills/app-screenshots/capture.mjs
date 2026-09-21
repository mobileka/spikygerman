import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(fileURLToPath(import.meta.url), "../../../..");
const BASE = (process.env.BASE || "http://localhost:5173").replace(/\/$/, "");
const HARNESS = path.join(REPO, "screenshot-harness.html");
const OUT_DIR = path.join(REPO, "docs/screenshots");

const { chromium } = await import("playwright-core");

const seed = {
  answers: {
    q01: { answer: "Ich heiße Anna." },
    q02: { answer: "Ich heiße Anna." },
    q03: { answer: "Ich wohne in Berlin." },
    q04: { answer: "Ich spreche Russisch." },
    q05: { answer: "Ich bin dreißig Jahre alt." },
    q06: { g0: "kommen", g1: "Sie", g2: "aus" },
    q07: { g0: "kommst", g1: "komme" },
    q13: { answer: "Ja, wir haben Bananen." },
    q14: { answer: "Nein, wir haben keine Eier." },
    q15: { answer: "Nein, wir haben keine Paprika." },
    q18: { answer: "Ja, das ist eine Tomate." },
    q22: { answer: "Die Tomaten kosten ein Euro elf Cent." },
    q23: { answer: "Der Käse kostet sechsundsechzig Cent." },
    q26: { choice: "der" },
    q27: { choice: "eine" },
    q28: { g0: "einen" },
    q29: { g0: "einen" },
    q30: { g0: "kein", g1: "keinen" },
    q31: { g0: "keine" },
    q32: { g0: "bin" },
    q33: { g0: "haben" }
  },
  checked: ["q01","q02","q03","q04","q05","q06","q07","q13","q14","q15","q18","q22","q23","q26","q27","q28","q29","q30","q31","q32","q33"]
};

const ROUTES = [
  ["Home", "/#level-1"],
  ["Section", "/#/s/was-ist-das"],
  ["Summary", "/#/summary"]
];

const CSS = [
  "tokens/tokens.css",
  "tokens/legacy-bridge.css",
  "tokens/od-layout-primitives.css",
  "components/components.css",
  "components/design-stage.css",
  "components/modules.css"
];

const ICONS = '<span class="status-icons"><svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor"><rect x="0" y="7" width="3" height="4" rx="1"/><rect x="4.5" y="5" width="3" height="6" rx="1"/><rect x="9" y="2.5" width="3" height="8.5" rx="1"/><rect x="13.5" y="0" width="3" height="11" rx="1"/></svg></span>';

function phone(title, hash) {
  return `
    <div class="phone-frame">
      <span class="hardware-button is-mute" aria-hidden="true"></span>
      <span class="hardware-button is-vol-up" aria-hidden="true"></span>
      <span class="hardware-button is-vol-dn" aria-hidden="true"></span>
      <span class="hardware-button is-power" aria-hidden="true"></span>
      <section class="phone-screen">
        <div class="status-bar" aria-hidden="true"><span class="status-time">9:41</span>${ICONS}</div>
        <div class="status-cutout-zone" aria-hidden="true"><span class="camera-dot"></span></div>
        <div class="app"><iframe src="${hash}" title="${title}"></iframe></div>
        <span class="gesture-indicator" aria-hidden="true"></span>
      </section>
    </div>`;
}

function harness() {
  return `<!doctype html>
<html lang="ru" data-design="arctic-blue" data-theme="light">
<head>
<meta charset="utf-8">
<script>
  document.documentElement.setAttribute("data-theme",
    new URLSearchParams(location.search).get("theme") === "dark" ? "dark" : "light");
</script>
${CSS.map((f) => `<link rel="stylesheet" href="/src/styles/${f}">`).join("\n")}
<style>
  html, body { margin: 0; }
  .od-stage { display: flex; flex-direction: row; align-items: flex-start; justify-content: center;
    gap: 48px; min-height: 0; width: fit-content; padding: 72px 64px 108px; }
  .phone-screen iframe { display: block; width: 390px; height: 765px; border: 0; }
</style>
</head>
<body>
<div class="od-stage">
${ROUTES.map(([title, hash]) => phone(title, hash)).join("\n")}
</div>
</body></html>`;
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function checkServer() {
  try {
    const res = await fetch(BASE, { signal: AbortSignal.timeout(4000) });
    if (!res.ok) throw new Error(String(res.status));
  } catch (e) {
    console.error(`Dev server not reachable at ${BASE}.`);
    console.error("Start it first: bun run dev   (then pass BASE if the port is not 5173)");
    process.exit(1);
  }
}

async function launch() {
  try {
    return await chromium.launch({ channel: "chrome", headless: true });
  } catch (e) {
    console.warn("Could not launch system Chrome, trying bundled Chromium.");
    console.warn("If that fails too: bunx playwright-core install chromium");
    return chromium.launch({ headless: true });
  }
}

async function resetScroll(frame) {
  await frame
    .evaluate(() => {
      window.scrollTo(0, 0);
      const scroller = document.querySelector("main.screen");
      if (!scroller) return 0;
      scroller.scrollTop = 0;
      const question = document.getElementById("q18");
      if (question) {
        const top =
          question.getBoundingClientRect().top -
          scroller.getBoundingClientRect().top +
          scroller.scrollTop;
        scroller.scrollTop = Math.max(0, top - 12);
      }
      const topbar = document.querySelector(".topbar");
      return topbar ? topbar.getBoundingClientRect().top : 0;
    })
    .catch(() => 0);
}

async function run(browser, theme) {
  const ctx = await browser.newContext({
    viewport: { width: 1600, height: 1300 },
    deviceScaleFactor: 2,
    colorScheme: theme
  });
  await ctx.addInitScript((data) => {
    try {
      localStorage.setItem("spikygerman:sample-test-1:v2", JSON.stringify(data.seed));
      localStorage.setItem("spiky-theme", data.theme);
    } catch (e) {}
  }, { seed, theme });

  const page = await ctx.newPage();
  await page.goto(`${BASE}/screenshot-harness.html?theme=${theme}`, {
    waitUntil: "domcontentloaded"
  });

  const deadline = Date.now() + 25000;
  let ready = false;
  while (Date.now() < deadline && !ready) {
    const frames = page.frames().filter((f) => f !== page.mainFrame());
    if (frames.length >= ROUTES.length) {
      ready = true;
      for (const f of frames) {
        try {
          await f.waitForSelector(".progress-text", { timeout: 800 });
        } catch (e) {
          ready = false;
        }
      }
    }
    if (!ready) await wait(200);
  }
  if (!ready) throw new Error("App frames never finished loading");

  for (const f of page.frames()) {
    if (f === page.mainFrame()) continue;
    await f
      .evaluate(async () => {
        await document.fonts.ready;
        const images = Array.from(document.images).filter((i) => i.loading !== "lazy");
        await Promise.race([
          Promise.all(images.map((img) =>
            img.complete ? Promise.resolve() : new Promise((res) => { img.onload = img.onerror = res; })
          )),
          new Promise((r) => setTimeout(r, 4000))
        ]);
      })
      .catch(() => {});
  }
  await wait(600);
  for (const f of page.frames()) {
    if (f === page.mainFrame()) continue;
    await resetScroll(f);
  }
  await wait(400);

  const state = await page.evaluate(() =>
    Array.from(document.querySelectorAll("iframe")).map((f) => ({
      title: f.title,
      progress: f.contentDocument.querySelector(".progress-text")?.textContent?.trim(),
      topbarTop: Math.round(f.contentDocument.querySelector(".topbar")?.getBoundingClientRect().top ?? -1)
    }))
  );
  const off = state.filter((row) => row.topbarTop < 0 || row.topbarTop > 4);
  if (off.length) {
    throw new Error(
      `${theme}: top bar off-screen in ${off.map((row) => row.title).join(", ")} — refusing to write ${theme} preview`
    );
  }

  const out = path.join(OUT_DIR, theme === "dark" ? "preview-dark.png" : "preview.png");
  await page.locator(".od-stage").screenshot({ path: out });
  await ctx.close();
  return { out, state };
}

fs.writeFileSync(HARNESS, harness());
const browser = await launch();
try {
  for (const theme of ["light", "dark"]) {
    const { out, state } = await run(browser, theme);
    const bytes = fs.statSync(out).size;
    console.log(`${theme}: ${out} (${bytes} bytes)`);
    for (const row of state) {
      console.log(`  ${row.title}: ${row.progress} (top bar at y=${row.topbarTop})`);
    }
  }
} finally {
  await browser.close();
  fs.unlinkSync(HARNESS);
}
