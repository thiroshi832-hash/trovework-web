/**
 * Light/dark theme plumbing, shared by the pre-paint script in the root layout
 * and the header toggle so the two cannot drift on the storage key or the
 * class name.
 *
 * The choice is deliberately tri-state under the hood: a stored "light"/"dark"
 * is an explicit decision and wins, and *no* stored value means "follow the OS",
 * which keeps tracking the OS if the user changes it later.
 */

export const THEME_KEY = "trovework-theme";
export type Theme = "light" | "dark";

/**
 * Runs before the first paint, inlined into the document. Without it the page
 * renders light and then snaps to dark once React hydrates — the flash is worse
 * on a slow connection, which is exactly when it is most visible.
 *
 * Kept to plain ES5 in a try/catch: it runs before any bundle, and localStorage
 * throws outright in a locked-down browser rather than returning null.
 */
export const THEME_SCRIPT = `(function(){try{var s=localStorage.getItem("${THEME_KEY}");var d=s==="dark"||(s!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d);}catch(e){}})();`;
