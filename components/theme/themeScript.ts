// This script runs synchronously in the <head> before any rendering,
// so the user never sees the wrong theme flash.
export const themeScript = `
(function() {
  try {
    var stored = localStorage.getItem('maintly-theme');
    var mode = stored || 'dark';
    var theme;
    if (mode === 'system') {
      theme = window.matchMedia('(prefers-color-scheme: light)').matches
        ? 'light' : 'dark';
    } else {
      theme = mode;
    }
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
})();
`;
