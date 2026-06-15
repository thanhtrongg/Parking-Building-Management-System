export const THEME_STORAGE_KEY = "appTheme";

export function getStoredTheme(defaultTheme = "dark") {
  try {
    const storedTheme =
      localStorage.getItem(THEME_STORAGE_KEY) ||
      localStorage.getItem("publicTheme") ||
      localStorage.getItem("systemTheme");

    return storedTheme === "light" || storedTheme === "dark"
      ? storedTheme
      : defaultTheme;
  } catch {
    return defaultTheme;
  }
}

export function storeTheme(theme) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    localStorage.removeItem("publicTheme");
    localStorage.removeItem("systemTheme");
    window.dispatchEvent(
      new CustomEvent("parkmaster-theme-change", { detail: { theme } }),
    );
  } catch {
    // Theme persistence is optional when storage is unavailable.
  }
}
