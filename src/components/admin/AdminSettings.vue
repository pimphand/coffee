<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface OpeningDay {
  day: string;
  hours: string;
  close: boolean;
}

interface SettingsData {
  id: number;
  default_language: 'en' | 'id' | 'cn';
  active_languages: string[];
  google_maps_iframe: string;
  opening_time: OpeningDay[];
  updated_at: string;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const languages = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'id', label: 'Indonesian', flag: '🇮🇩' },
  { code: 'cn', label: '中文 (Chinese)', flag: '🇨🇳' },
] as const;

const settings = ref<SettingsData | null>(null);
const defaultLang = ref('en');
const activeLangs = ref<string[]>(['en', 'id', 'cn']);
const mapsIframe = ref('');
const openingDays = reactive<OpeningDay[]>(
  DAYS.map((d) => ({ day: d, hours: '10:00AM - 07:00PM', close: false }))
);
const loading = ref(false);
const saving = ref(false);
const savingSuccess = ref(false);
const message = ref('');

function getLang(code: string) {
  return languages.find(l => l.code === code);
}

function toggleLang(code: string) {
  if (code === defaultLang.value) return;
  const idx = activeLangs.value.indexOf(code);
  if (idx >= 0) {
    activeLangs.value.splice(idx, 1);
  } else {
    activeLangs.value.push(code);
  }
}

function toggleDayClose(idx: number) {
  openingDays[idx].close = !openingDays[idx].close;
  if (openingDays[idx].close) {
    openingDays[idx].hours = 'Closed';
  } else if (openingDays[idx].hours === 'Closed') {
    openingDays[idx].hours = '10:00AM - 07:00PM';
  }
}

// Extract src URL from a full <iframe> tag if the user pasted one,
// otherwise return the raw value (assume it's already a plain URL).
function cleanMapsUrl(val: string): string {
  const match = val.match(/src="([^"]+)"/);
  return match ? match[1] : val.trim();
}

// Auto-clean on blur — if user pasted full <iframe>, extract just src.
function onMapsInput() {
  mapsIframe.value = cleanMapsUrl(mapsIframe.value);
}

function applyOpeningTime(data: OpeningDay[]) {
  // Merge saved data into the 7-day grid
  for (let i = 0; i < DAYS.length; i++) {
    const saved = data.find((d) => d.day === DAYS[i]);
    if (saved) {
      openingDays[i].hours = saved.hours;
      openingDays[i].close = saved.close;
    }
  }
}

async function load() {
  loading.value = true;
  try {
    const res = await fetch('/api/admin/settings');
    if (res.ok) {
      const data = await res.json();
      if (data && data.default_language) {
        settings.value = data;
        defaultLang.value = data.default_language;
        activeLangs.value = [...data.active_languages];
        mapsIframe.value = data.google_maps_iframe || '';
        if (Array.isArray(data.opening_time) && data.opening_time.length > 0) {
          applyOpeningTime(data.opening_time);
        }
      }
    }
  } catch (e: any) {
    message.value = 'Failed to load settings from database. Using defaults.';
  }
  finally { loading.value = false; }
}

async function save() {
  saving.value = true;
  savingSuccess.value = false;
  message.value = '';
  try {
    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        default_language: defaultLang.value,
        active_languages: activeLangs.value,
        google_maps_iframe: mapsIframe.value,
        opening_time: openingDays.map((d) => ({
          day: d.day,
          hours: d.hours,
          close: d.close,
        })),
      }),
    });
    const data = await res.json();
    if (res.ok) {
      savingSuccess.value = true;
      message.value = 'Settings saved successfully.';
      settings.value = data.settings;
    } else {
      message.value = data.error || 'Failed to save settings.';
    }
  } catch (e: any) {
    message.value = e.message || 'Failed to save settings.';
  } finally {
    saving.value = false;
  }
}

onMounted(load);
</script>

<template>
  <div class="mx-auto max-w-2xl">
    <header class="mb-8 space-y-1">
      <h1 class="text-2xl font-semibold tracking-tight">Site Settings</h1>
      <p class="text-sm text-muted-foreground">
        Manage languages, opening hours, and site-wide configuration.
      </p>
    </header>

    <!-- Loading state -->
    <div v-if="loading" class="rounded-lg border bg-card p-6 text-center text-muted-foreground text-sm">
      Loading settings…
    </div>

    <!-- Settings form -->
    <div v-else class="space-y-6">
      <!-- Default Language -->
      <section class="rounded-lg border bg-card p-5 shadow-sm">
        <h2 class="mb-3 text-sm font-semibold">Default Language</h2>
        <div class="flex flex-wrap gap-2">
          <button v-for="l in languages" :key="l.code" type="button" @click="defaultLang = l.code" :class="cn(
            'inline-flex items-center gap-2 rounded-md border px-4 py-2.5 text-sm font-medium transition-colors',
            defaultLang === l.code
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-border bg-background hover:bg-accent hover:text-accent-foreground'
          )">
            <span>{{ l.flag }}</span>
            <span>{{ l.label }}</span>
          </button>
        </div>
      </section>

      <!-- Active Languages -->
      <section class="rounded-lg border bg-card p-5 shadow-sm">
        <h2 class="mb-3 text-sm font-semibold">Active Languages</h2>
        <p class="mb-4 text-xs text-muted-foreground">
          These languages can be selected by visitors. The default language cannot be deactivated.
        </p>
        <div class="flex flex-wrap gap-2">
          <button v-for="l in languages" :key="l.code" type="button" @click="toggleLang(l.code)"
            :disabled="l.code === defaultLang" :class="cn(
              'inline-flex items-center gap-2 rounded-md border px-4 py-2.5 text-sm font-medium transition-colors',
              activeLangs.includes(l.code)
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background opacity-50 hover:opacity-80 hover:bg-accent hover:text-accent-foreground',
              l.code === defaultLang && 'cursor-not-allowed opacity-60'
            )">
            <span>{{ l.flag }}</span>
            <span>{{ l.label }}</span>
            <span v-if="l.code === defaultLang" class="ml-1 text-[10px] opacity-70">(default)</span>
          </button>
        </div>
      </section>      <!-- Google Maps iframe -->
      <section class="rounded-lg border bg-card p-5 shadow-sm">
        <h2 class="mb-3 text-sm font-semibold">Google Maps Embed</h2>
        <p class="mb-4 text-xs text-muted-foreground">
          Paste the full Google Maps embed code (the <code>&lt;iframe&gt;</code> tag)
          or just the <code>src</code> URL. The preview will show immediately.
        </p>
        <div class="space-y-2">
          <Label for="mapsIframe">Embed code or src URL</Label>
          <textarea
            id="mapsIframe"
            v-model="mapsIframe"
            @blur="onMapsInput()"
            rows="3"
            class="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-y"
            placeholder="Paste the full <iframe src=&quot;...&quot; ...></iframe> code here"
          ></textarea>
        </div>
        <!-- Preview -->
        <div v-if="mapsIframe" class="mt-4 rounded-lg overflow-hidden border border-border">
          <iframe :src="mapsIframe" width="100%" height="200" style="border:0;" loading="lazy"
            title="Map preview"></iframe>
        </div>
      </section>

      <!-- Opening Time -->
      <section class="rounded-lg border bg-card p-5 shadow-sm">
        <h2 class="mb-3 text-sm font-semibold">Opening Time</h2>
        <p class="mb-4 text-xs text-muted-foreground">
          Set weekly opening hours. Toggle "Closed" for off days.
        </p>
        <div class="space-y-2">
          <div v-for="(d, idx) in openingDays" :key="d.day"
            class="flex items-center gap-3 rounded-md border border-border bg-background px-3 py-2">
            <span class="w-24 text-sm font-medium shrink-0">{{ d.day }}</span>
            <Input v-model="d.hours" :disabled="d.close" class="h-9 text-sm flex-1"
              placeholder="e.g. 10:00AM - 07:00PM" />
            <button type="button" @click="toggleDayClose(idx)" :class="cn(
              'shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
              d.close
                ? 'bg-destructive text-destructive-foreground'
                : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )">
              {{ d.close ? 'Closed' : 'Open' }}
            </button>
          </div>
        </div>
      </section>

      <!-- Action bar -->
      <div class="flex items-center gap-3">
        <Button @click="save" :disabled="saving || loading">
          {{ saving ? 'Saving…' : 'Save Settings' }}
        </Button>
        <p v-if="message" :class="cn('text-sm', savingSuccess ? 'text-green-600' : 'text-destructive')">
          {{ message }}
        </p>
      </div>
    </div>
  </div>
</template>
