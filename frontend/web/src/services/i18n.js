const STORAGE_KEY = 'yhq-lang';

export function getSavedLang() {
  try {
    return localStorage.getItem(STORAGE_KEY) || 'uz';
  } catch {
    return 'uz';
  }
}

export function saveLang(lang) {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {}
}

export function localize(obj, lang, fallback = 'uz') {
  if (!obj) return '';
  if (typeof obj === 'string') return obj;
  return obj[lang] || obj[fallback] || '';
}
