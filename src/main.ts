import { mount } from "svelte";
import App from "./App.svelte";
import { initLanguage } from "./lib/content.svelte";
import "./app.css";

const target = document.getElementById("app")!;

// Content is one chunk per language. The app waits for the chosen one
// (saved choice → browser language → ru) before mounting, so every screen
// can read strings and levels synchronously.
initLanguage()
  .then(() => mount(App, { target }))
  .catch((error: unknown) => {
    console.error("Could not load the content bundle.", error);
  });
