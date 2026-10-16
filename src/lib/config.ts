import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parse } from 'yaml';

export type Accent = 'blue' | 'red' | 'green' | 'orange' | 'purple' | 'pink' | 'gray';
export type PageKey = 'home' | 'projects' | 'experience' | 'writing';

export interface Property {
  icon?: string;
  label: string;
  value: string;
  link?: string;
  tag?: Accent;
}
export interface Link {
  icon?: string;
  label: string;
  url: string;
  description?: string;
}
export interface Job {
  role: string;
  company: string;
  url?: string;
  location?: string;
  start?: string;
  end?: string;
  summary?: string;
  highlights?: string[];
}
export interface School {
  degree: string;
  school: string;
  start?: string;
  end?: string;
  summary?: string;
}
export interface Project {
  name: string;
  icon?: string;
  description?: string;
  status?: string;
  date?: string;
  tags?: string[];
  url?: string;
  repo?: string;
}
export interface Post {
  title: string;
  url: string;
  date?: string;
  summary?: string;
  tags?: string[];
}
export interface PageMeta {
  icon: string;
  title: string;
  intro?: string;
}

export interface Config {
  site: {
    title: string;
    description: string;
    url: string;
    base: string;
    language: string;
    theme: 'light' | 'dark' | 'system';
    accent: Accent;
    footer?: string;
  };
  profile: {
    name: string;
    icon?: string;
    cover?: { gradient?: string[]; image?: string };
    headline?: string;
    email?: string;
    location?: string;
    properties: Property[];
    about: string[];
    callout?: { icon?: string; text: string };
  };
  nav: PageKey[];
  pages: Record<PageKey, PageMeta>;
  links: Link[];
  skills: { name: string; items: string[] }[];
  experience: Job[];
  education: School[];
  projects: Project[];
  writing: Post[];
}

const DEFAULT_PAGES: Record<PageKey, PageMeta> = {
  home: { icon: '🏠', title: 'Home' },
  projects: { icon: '🚀', title: 'Projects' },
  experience: { icon: '💼', title: 'Experience' },
  writing: { icon: '✍️', title: 'Writing' },
};

const ACCENTS: Accent[] = ['blue', 'red', 'green', 'orange', 'purple', 'pink', 'gray'];

// YAML turns bare `2019` into a number; keep every value text.
const str = (v: unknown): string | undefined => (v == null || v === '' ? undefined : String(v));
const list = <T>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);

function fail(msg: string): never {
  throw new Error(`portfolio.config.yaml: ${msg}`);
}

function load(): Config {
  const file = resolve(process.cwd(), 'portfolio.config.yaml');
  let raw: any;
  try {
    raw = parse(readFileSync(file, 'utf8'));
  } catch (e) {
    fail(`could not parse YAML. ${(e as Error).message}`);
  }
  if (!raw || typeof raw !== 'object') fail('file is empty');
  if (!raw.site?.title) fail('`site.title` is required');
  if (!raw.profile?.name) fail('`profile.name` is required');

  const accent: Accent = ACCENTS.includes(raw.site.accent) ? raw.site.accent : 'blue';
  const base = String(raw.site.base ?? '/');

  const pages = { ...DEFAULT_PAGES } as Record<PageKey, PageMeta>;
  for (const k of Object.keys(DEFAULT_PAGES) as PageKey[]) {
    pages[k] = { ...DEFAULT_PAGES[k], ...(raw.pages?.[k] ?? {}) };
  }

  const nav = list<PageKey>(raw.nav).filter((k) => k in DEFAULT_PAGES);

  return {
    site: {
      title: String(raw.site.title),
      description: String(raw.site.description ?? ''),
      url: String(raw.site.url ?? 'http://localhost:4321'),
      base: base.endsWith('/') ? base : base + '/',
      language: String(raw.site.language ?? 'en'),
      theme: ['light', 'dark', 'system'].includes(raw.site.theme) ? raw.site.theme : 'system',
      accent,
      footer: str(raw.site.footer),
    },
    profile: {
      name: String(raw.profile.name),
      icon: str(raw.profile.icon),
      cover: raw.profile.cover,
      headline: str(raw.profile.headline),
      email: str(raw.profile.email),
      location: str(raw.profile.location),
      properties: list<Property>(raw.profile.properties).map((p) => ({ ...p, value: String(p.value) })),
      about: list<unknown>(raw.profile.about).map(String),
      callout: raw.profile.callout?.text ? raw.profile.callout : undefined,
    },
    nav: nav.length ? nav : ['home'],
    pages,
    links: list<Link>(raw.links),
    skills: list<{ name: string; items: string[] }>(raw.skills),
    experience: list<Job>(raw.experience).map((j) => ({ ...j, start: str(j.start), end: str(j.end) })),
    education: list<School>(raw.education).map((s) => ({ ...s, start: str(s.start), end: str(s.end) })),
    projects: list<Project>(raw.projects).map((p) => ({ ...p, date: str(p.date) })),
    writing: list<Post>(raw.writing).map((p) => ({ ...p, date: str(p.date) })),
  };
}

export const config = load();

export const href = (path = '') => config.site.base + path.replace(/^\//, '');

export function pageHref(key: PageKey) {
  return key === 'home' ? href() : href(`${key}/`);
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export function fmtDate(d?: string) {
  if (!d) return '';
  const m = /^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?$/.exec(d);
  if (!m) return d;
  const [, y, mo, day] = m;
  if (!mo) return y;
  const month = MONTHS[Number(mo) - 1] ?? mo;
  return day ? `${month} ${Number(day)}, ${y}` : `${month} ${y}`;
}

export function range(start?: string, end?: string) {
  const s = fmtDate(start);
  const e = fmtDate(end);
  return [s, e].filter(Boolean).join(' → ');
}

const TAG_COLORS: Accent[] = ['blue', 'green', 'orange', 'purple', 'pink', 'red', 'gray'];
const STATUS_COLORS: Record<string, Accent> = {
  live: 'green',
  'in progress': 'blue',
  archived: 'gray',
};
export function tagColor(text: string): Accent {
  const known = STATUS_COLORS[text.toLowerCase()];
  if (known) return known;
  let h = 0;
  for (const c of text) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return TAG_COLORS[h % TAG_COLORS.length];
}
