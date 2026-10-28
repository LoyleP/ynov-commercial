export type Theme = "light" | "dark";
export const THEME_KEY = "theme";

/**
 * Runs in the page head, before the first paint, so the chosen theme never flashes. Dark is the
 * default; only an explicit "light" choice, saved in this browser, switches it off.
 */
export const THEME_INIT_SCRIPT = `try{if(localStorage.getItem("${THEME_KEY}")!=="light")document.documentElement.classList.add("dark")}catch(e){document.documentElement.classList.add("dark")}`;
