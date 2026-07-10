// i18n runtime helpers. Pages and components import from this single
// module so the API stays consistent across the site.
import { ui, defaultLang, supportedLocales, type Locale } from './ui';
import { getRelativeLocaleUrl } from 'astro:i18n';

// Re-export so consumers can import from one place.
export { ui, defaultLang, supportedLocales };
export type { Locale };

// ── Content localization ──────────────────────────────────────────

/**
 * Shape of a DB row or fallback object that carries locale-suffixed
 * fields (title_en, title_id, title_cn, …). Add new keys when a new
 * locale is introduced and TypeScript will guide you to every call site.
 */
export interface LocalizableBlogFields {
  title_en:   string | null;
  title_id:   string | null;
  title_cn?:  string | null;
  excerpt_en:  string;
  excerpt_id:  string;
  excerpt_cn?: string;
  content_en?: string;
  content_id?: string;
  content_cn?: string;
  body_id?:    string[];  // fallback-only (posts.ts)
  body_en?:    string[];  // fallback-only
  body_cn?:    string[];  // fallback-only
  [key: string]: any;     // allow slug, image, author, …
}

/** Normalised blog post ready for rendering — single-language. */
export interface LocalizedBlogPost {
  slug:    string;
  title:   string;
  excerpt: string;
  image:   string;
  author:  string;
  date:    string;
  body:    string[];
}

/**
 * Pick the correct locale-specific fields from a DB row (or fallback
 * object) and return a flat LocalizedBlogPost.
 *
 * Falls back from the requested locale → defaultLang → '' / [].
 */
export function localizeBlogPost(
  raw: LocalizableBlogFields,
  locale: Locale | string | undefined,
): LocalizedBlogPost {
  const loc = supportedLocales.includes(locale as Locale) ? (locale as Locale) : defaultLang;
  const pick = (field: string) => {
    const val = raw[`${field}_${loc}`];
    if (val != null && val !== '') return val;
    // Fall back to default locale
    const fb = raw[`${field}_${defaultLang}`];
    return fb != null ? fb : '';
  };

  return {
    slug:    raw.slug,
    title:   pick('title'),
    excerpt: pick('excerpt'),
    image:   raw.image ?? '',
    author:  raw.author_name ?? raw.author ?? '',
    date:    raw.published_at
      ? new Date(raw.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      : (raw.date ?? ''),
    body:    (raw[`body_${loc}`] as string[] | undefined)
             ?? (raw[`content_${loc}`] ? (raw[`content_${loc}`] as string).split(/\n\n+/).filter(Boolean) : undefined)
             ?? (raw[`content_${defaultLang}`] ? (raw[`content_${defaultLang}`] as string).split(/\n\n+/).filter(Boolean) : undefined)
             ?? raw.body
             ?? [],
  };
}

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
  const safe = supportedLocales.includes(lang as Locale) ? (lang as Locale) : defaultLang;
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
  // Strip any leading locale prefix (/en/, /id/, /cn/) so we never
  // double-prefix (e.g. /en/en/about).
  const stripped = path.replace(/^(\/en|\/id|\/cn)(\/|$)/, '/');
  if (target === defaultLang) {
    return stripped === '' ? '/' : stripped;
  }
  if (stripped === '/' || stripped === '') {
    return getRelativeLocaleUrl(target, '/');
  }
  return getRelativeLocaleUrl(target, stripped);
}
