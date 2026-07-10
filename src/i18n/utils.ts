// i18n runtime helpers. Pages and components import from this single
// module so the API stays consistent across the site.
import { ui, defaultLang, supportedLocales, type Locale } from './ui';
import { getRelativeLocaleUrl } from 'astro:i18n';

// Re-export so consumers can import from one place.
export { ui, defaultLang, supportedLocales };
export type { Locale };

/**
 * Build a translation function scoped to one locale. Falls back to the
 * default locale if a key is missing in the requested locale, and
 * finally to the key itself (so missing translations are visible
 * rather than silently empty).
 *
 * Supports {placeholder} interpolation via the optional `vars` map.
 *
 * Usage in a page / component:
 *   const t = useTranslations(Astro.currentLocale);
 *   <h1>{t('nav.home')}</h1>
 *   <p>{t('modal.confirmRef', { ref: 'BH-12345' })}</p>
 */
export function useTranslations(lang: Locale | string | undefined) {
  const safe = (lang === 'id' || lang === 'en') ? lang : defaultLang;
  return function t(key: string, vars?: Record<string, string | number>): string {
    const table = ui[safe] as Record<string, string>;
    const fallback = ui[defaultLang] as Record<string, string>;
    let text: string = table[key] ?? fallback[key] ?? key;
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        text = text.replace(new RegExp('\\{' + k + '\\}', 'g'), String(v));
      }
    }
    return text;
  };
}

/**
 * Build a URL that points at the same page in a different locale.
 *
 * Astro 4 i18n config does NOT generate URLs automatically for
 * arbitrary runtime locales; we have to compute them ourselves when
 * wiring up the language switcher.
 *
 * @param path  current pathname (e.g. /about or /en/about)
 * @param target locale to switch into
 * @returns URL to navigate to (e.g. /en/about or /)
 */
export function getLocalizedPath(path: string, target: Locale): string {
  // Strip a leading /en/ or /en that may already be in the path so we
  // never double-prefix (e.g. /en/en/about).
  const stripped = path.replace(/^(\/en)(\/|$)/, '/');
  if (target === defaultLang) {
    return stripped === '' ? '/' : stripped;
  }
  if (stripped === '/' || stripped === '') {
    return getRelativeLocaleUrl(target, '/');
  }
  return getRelativeLocaleUrl(target, stripped);
}
