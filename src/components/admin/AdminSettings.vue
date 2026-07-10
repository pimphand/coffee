<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SettingsData {
  id: number;
  default_language: 'en' | 'id' | 'cn';
  active_languages: string[];
  updated_at: string;
}

const languages = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'id', label: 'Indonesian', flag: '🇮🇩' },
  { code: 'cn', label: '中文 (Chinese)', flag: '🇨🇳' },
] as const;

const settings = ref<SettingsData | null>(null);
const defaultLang = ref('en');
const activeLangs = ref<string[]>(['en', 'id', 'cn']);
const loading = ref(false);
const saving = ref(false);
const savingSuccess = ref(false);
const message = ref('');

function getLang(code: string) {
  return languages.find(l => l.code === code);
}

function toggleLang(code: string) {
  if (code === defaultLang.value) return; // can't deactivate default
  const idx = activeLangs.value.indexOf(code);
  if (idx >= 0) {
    activeLangs.value.splice(idx, 1);
  } else {
    activeLangs.value.push(code);
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
        Manage active languages and site-wide configuration. Changes take effect after next build.
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
      </section>

      <!-- Database info -->
      <section class="rounded-lg border bg-card p-5 shadow-sm">
        <h2 class="mb-3 text-sm font-semibold">Database Status</h2>
        <div v-if="settings" class="text-xs text-muted-foreground space-y-1">
          <p>Last updated: <span class="font-mono text-foreground">{{ new Date(settings.updated_at).toLocaleString()
              }}</span></p>
        </div>
        <div v-else class="text-xs text-muted-foreground">
          Using default configuration (database not seeded yet).
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
