<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// ── Static language metadata ──────────────────────────────────────
const ALL_LANGUAGES = [
  { code: 'en', label: 'English',       flag: '🇬🇧', placeholder: { title: 'English title', excerpt: 'Short English summary', content: 'Full English article content...' } },
  { code: 'id', label: 'Indonesian',    flag: '🇮🇩', placeholder: { title: 'Judul bahasa Indonesia', excerpt: 'Ringkasan singkat bahasa Indonesia', content: 'Konten artikel bahasa Indonesia...' } },
  { code: 'cn', label: '中文 (Chinese)', flag: '🇨🇳', placeholder: { title: 'Chinese title', excerpt: 'Short Chinese summary', content: 'Full Chinese article content...' } },
] as const;

type LangCode = typeof ALL_LANGUAGES[number]['code'];

function langMeta(code: string) {
  return ALL_LANGUAGES.find(l => l.code === code) ?? ALL_LANGUAGES[0];
}

// ── BlogPost — matches coffee_blog_posts row ──────────────────────
interface BlogPost {
  id: string;
  slug: string;
  title_en: string;
  title_id: string;
  title_cn: string;
  excerpt_en: string;
  excerpt_id: string;
  excerpt_cn: string;
  content_en: string;
  content_id: string;
  content_cn: string;
  image: string;
  author_name: string;
  published_at: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

const props = defineProps<{ serverPosts: string }>();

function safeParse(json: string): BlogPost[] {
  try { return JSON.parse(json); } catch { return []; }
}

// ── State ──────────────────────────────────────────────────────────
const posts = ref<BlogPost[]>(safeParse(props.serverPosts || "[]"));
const loading = ref(false);
const uploadingImage = ref(false);
const imagePreview = ref("");
const error = ref("");
const fieldErrors = reactive<Record<string, string>>({});
const showForm = ref(false);
const editingId = ref<string | null>(null);
const togglingIds = ref<Set<string>>(new Set());
const deletingIds = ref<Set<string>>(new Set());
const activeLangTab = ref("en");
const slugManuallyEdited = ref(false);

// Dynamic active languages loaded from settings
const activeLanguages = ref<LangCode[]>(['en', 'id']);
const settingsLoaded = ref(false);

// ── Build empty form dynamically from active languages ────────────
function buildEmptyForm(): Record<string, string> {
  const base: Record<string, string> = { slug: "", image: "", author_name: "Brew Haven" };
  for (const l of activeLanguages.value) {
    base[`title_${l}`] = "";
    base[`excerpt_${l}`] = "";
    base[`content_${l}`] = "";
  }
  return base;
}

const form = reactive(buildEmptyForm());

const isEditing = computed(() => editingId.value !== null);

// ── Load settings on mount ─────────────────────────────────────────
onMounted(async () => {
  try {
    const res = await fetch('/api/admin/settings');
    if (res.ok) {
      const data = await res.json();
      if (data?.active_languages?.length) {
        activeLanguages.value = data.active_languages;
      }
    }
  } catch { /* use defaults */ }
  finally {
    settingsLoaded.value = true;
    // Rebuild form with correct languages
    const defaults = buildEmptyForm();
    for (const k of Object.keys(defaults)) {
      if (!(k in form)) (form as any)[k] = defaults[k];
    }
    activeLangTab.value = activeLanguages.value[0] ?? 'en';
  }
});

// ── Form helpers ───────────────────────────────────────────────────
function openCreate() {
  editingId.value = null;
  const empty = buildEmptyForm();
  for (const k of Object.keys(empty)) {
    (form as any)[k] = empty[k];
  }
  // Clear any old locale keys no longer active
  for (const k of Object.keys(form)) {
    if (!(k in empty)) delete (form as any)[k];
  }
  activeLangTab.value = activeLanguages.value[0] ?? 'en';
  imagePreview.value = "";
  slugManuallyEdited.value = false;
  clearErrors();
  showForm.value = true;
  error.value = "";
}

function openEdit(post: BlogPost) {
  editingId.value = post.id;
  // Set all known fields
  form.slug = post.slug;
  form.image = post.image ?? "";
  form.author_name = post.author_name ?? "Brew Haven";
  for (const l of activeLanguages.value) {
    (form as any)[`title_${l}`] = (post as any)[`title_${l}`] ?? "";
    (form as any)[`excerpt_${l}`] = (post as any)[`excerpt_${l}`] ?? "";
    (form as any)[`content_${l}`] = (post as any)[`content_${l}`] ?? "";
  }
  activeLangTab.value = activeLanguages.value[0] ?? 'en';
  imagePreview.value = post.image || "";
  slugManuallyEdited.value = true; // editing existing, don't auto-regenerate
  clearErrors();
  showForm.value = true;
  error.value = "";
}

function clearErrors() {
  error.value = "";
  for (const k of Object.keys(fieldErrors)) delete fieldErrors[k];
}

// ── Slug helpers ────────────────────────────────────────────────────
function generateSlug(title: string): string {
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')  // keep letters (all scripts) + numbers
    .replace(/[\s_]+/g, '-')             // spaces/underscores → hyphens
    .replace(/-+/g, '-')                 // collapse multiple hyphens
    .replace(/^-+|-+$/g, '');            // trim leading/trailing hyphens
  return slug || 'post-' + Date.now().toString(36);  // fallback for empty result
}

function autoFillSlug() {
  if (slugManuallyEdited.value) return;
  // Use first available title from active languages
  for (const l of activeLanguages.value) {
    const t = (form as any)[`title_${l}`];
    if (t) {
      form.slug = generateSlug(t);
      return;
    }
  }
  // All titles empty → clear slug so it can regenerate later
  if (!slugManuallyEdited.value) form.slug = '';
}

function onSlugInput() {
  if (!form.slug) {
    // User cleared slug → re-enable auto-generation
    slugManuallyEdited.value = false;
  } else {
    slugManuallyEdited.value = true;
  }
  delete fieldErrors.slug;
}

function onTitleInput() {
  clearErrors();
  autoFillSlug();
}
async function handleImageSelect(e: Event) {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  const prevUrl = imagePreview.value;
  imagePreview.value = URL.createObjectURL(file);
  if (prevUrl && prevUrl.startsWith('blob:')) URL.revokeObjectURL(prevUrl);

  uploadingImage.value = true;
  error.value = "";

  try {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Upload failed");
    form.image = data.path;
    target.value = "";
  } catch (e: any) {
    error.value = e.message;
    imagePreview.value = "";
    target.value = "";
  } finally {
    uploadingImage.value = false;
  }
}

// ── Validation — at least one title required; title required if content is filled ──
function hasContent(l: string): boolean {
  return !!((form as any)[`content_${l}`] || (form as any)[`excerpt_${l}`]);
}

function validate(): boolean {
  clearErrors();
  if (!form.slug) fieldErrors.slug = "Slug is required";

  // Title is required for any language that has content/excerpt
  let firstMissing: string | null = null;
  for (const l of activeLanguages.value) {
    if (hasContent(l) && !(form as any)[`title_${l}`]) {
      fieldErrors[`title_${l}`] = `${langMeta(l).label} title is required (content is filled)`;
      if (!firstMissing) firstMissing = l;
    }
  }

  // At least one title must exist across all languages
  const anyTitle = activeLanguages.value.some(l => !!(form as any)[`title_${l}`]);
  if (!anyTitle) {
    for (const l of activeLanguages.value) {
      const tKey = `title_${l}`;
      if (!fieldErrors[tKey]) fieldErrors[tKey] = `At least one title is required`;
    }
    if (!firstMissing) firstMissing = activeLanguages.value[0];
  }

  if (firstMissing) activeLangTab.value = firstMissing;
  return Object.keys(fieldErrors).length === 0;
}

// ── Save ───────────────────────────────────────────────────────────
async function save() {
  if (!validate()) return;
  loading.value = true;
  error.value = "";

  try {
    const method = isEditing.value ? "PUT" : "POST";
    const body: any = { slug: form.slug, image: form.image, author_name: form.author_name };
    for (const l of activeLanguages.value) {
      body[`title_${l}`] = (form as any)[`title_${l}`] ?? "";
      body[`excerpt_${l}`] = (form as any)[`excerpt_${l}`] ?? "";
      body[`content_${l}`] = (form as any)[`content_${l}`] ?? "";
    }
    if (isEditing.value) body.id = editingId.value;

    const res = await fetch("/api/admin/blog", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Save failed");

    if (isEditing.value) {
      const idx = posts.value.findIndex((p) => p.id === editingId.value);
      if (idx !== -1) posts.value[idx] = data.post;
    } else {
      posts.value.unshift(data.post);
    }
    showForm.value = false;
  } catch (e: any) {
    error.value = e.message;
  } finally {
    loading.value = false;
  }
}

async function togglePublish(post: BlogPost) {
  togglingIds.value.add(post.id);
  try {
    const res = await fetch(`/api/admin/blog?id=${post.id}`, { method: "PATCH" });
    const data = await res.json();
    if (data.ok) {
      const idx = posts.value.findIndex((p) => p.id === post.id);
      if (idx !== -1) posts.value[idx] = data.post;
    }
  } finally {
    togglingIds.value.delete(post.id);
  }
}

async function deletePost(post: BlogPost) {
  if (!confirm(`Delete "${post.title_en}"? This cannot be undone.`)) return;
  deletingIds.value.add(post.id);
  try {
    const res = await fetch(`/api/admin/blog?id=${post.id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.ok) {
      posts.value = posts.value.filter((p) => p.id !== post.id);
    }
  } finally {
    deletingIds.value.delete(post.id);
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  });
}
</script>

<template>
  <!-- Error banner -->
  <div v-if="error"
    class="mb-4 rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
    {{ error }}
  </div>

  <div class="mb-4 flex items-center justify-between">
    <Button @click="openCreate">+ New Post</Button>
  </div>

  <!-- Create / Edit modal overlay -->
  <div v-if="showForm && settingsLoaded" class="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-[10vh]"
    @click.self="showForm = false">
    <div class="w-full max-w-2xl rounded-lg border bg-background p-6 shadow-xl mx-4 max-h-[80vh] overflow-y-auto">
      <h2 class="mb-4 text-lg font-semibold">
        {{ isEditing ? 'Edit Post' : 'New Post' }}
      </h2>

      <!-- Shared fields -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="mb-1 block text-sm font-medium">Slug <span class="text-muted-foreground text-xs">(auto from title)</span></label>
          <Input v-model="form.slug" :class="fieldErrors.slug && 'border-destructive'" placeholder="auto-generated"
            @update:model-value="onSlugInput" />
          <p v-if="fieldErrors.slug" class="mt-1 text-xs text-destructive">{{ fieldErrors.slug }}</p>
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium">Featured Image</label>
          <label :class="[
            'flex cursor-pointer items-center justify-center rounded-md border border-dashed px-4 py-3 text-sm transition-colors',
            'hover:border-primary/50 hover:bg-accent/50',
            uploadingImage && 'pointer-events-none opacity-50',
          ]">
            <span v-if="uploadingImage" class="text-muted-foreground">Uploading…</span>
            <span v-else-if="imagePreview" class="text-muted-foreground">Change image</span>
            <span v-else class="text-muted-foreground">
              <span class="mr-1">📷</span>Choose image
            </span>
            <input type="file" accept="image/*" class="hidden" @change="handleImageSelect" :disabled="uploadingImage" />
          </label>
          <div v-if="imagePreview" class="mt-2 relative">
            <img :src="imagePreview" alt="Preview" class="w-full h-24 object-cover rounded-md border" />
            <button @click="imagePreview = ''; form.image = ''"
              class="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-white text-xs hover:bg-destructive/90"
              title="Remove image">✕</button>
          </div>
        </div>
      </div>

      <!-- Dynamic content tabs from active languages -->
      <div class="mt-4">
        <label class="mb-2 block text-sm font-medium">Content</label>
        <Tabs v-model="activeLangTab" class="w-full">
          <TabsList class="mb-3 flex w-full">
            <TabsTrigger v-for="l in activeLanguages" :key="l" :value="l" class="flex-1 gap-1.5">
              {{ langMeta(l).flag }} {{ langMeta(l).label }}
              <span v-if="((form as any)[`content_${l}`] || (form as any)[`excerpt_${l}`]) && !(form as any)[`title_${l}`]"
                class="flex h-4 w-4 items-center justify-center rounded-full bg-destructive/15 text-[10px] text-destructive"
                title="Content filled but title is missing">!</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent v-for="l in activeLanguages" :key="l" :value="l">
            <div class="space-y-3">
              <div>
                <label class="mb-1 block text-xs font-medium text-muted-foreground">{{ langMeta(l).label }} Title</label>
                <Input v-model="(form as any)[`title_${l}`]"
                  :class="fieldErrors[`title_${l}`] && 'border-destructive'"
                  :placeholder="langMeta(l).placeholder.title"
                  @update:model-value="onTitleInput()" />
                <p v-if="fieldErrors[`title_${l}`]" class="mt-1 text-xs text-destructive">{{ fieldErrors[`title_${l}`] }}</p>
              </div>
              <div>
                <label class="mb-1 block text-xs font-medium text-muted-foreground">{{ langMeta(l).label }} Excerpt</label>
                <Input v-model="(form as any)[`excerpt_${l}`]" :placeholder="langMeta(l).placeholder.excerpt" />
              </div>
              <div>
                <label class="mb-1 block text-xs font-medium text-muted-foreground">{{ langMeta(l).label }} Content</label>
                <textarea v-model="(form as any)[`content_${l}`]" rows="6"
                  class="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  :placeholder="langMeta(l).placeholder.content"></textarea>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <div class="mt-4 flex justify-end gap-2">
        <Button variant="outline" @click="showForm = false">Cancel</Button>
        <Button @click="save" :disabled="loading">
          {{ loading ? 'Saving…' : 'Save' }}
        </Button>
      </div>
    </div>
  </div>

  <!-- Posts table -->
  <div class="overflow-x-auto rounded-lg border">
    <table class="w-full text-sm">
      <thead>
        <tr class="border-b bg-muted/50 text-left">
          <th class="px-4 py-3 font-medium">Title</th>
          <th class="px-4 py-3 font-medium">Slug</th>
          <th class="px-4 py-3 font-medium">Published</th>
          <th class="px-4 py-3 font-medium">Date</th>
          <th class="px-4 py-3 font-medium text-right">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="post in posts" :key="post.id" :class="cn('border-b', !post.is_published && 'opacity-60')">
          <td class="px-4 py-3 max-w-[240px] truncate">
            {{ post.title_en }}
            <span v-if="!post.is_published" class="ml-2 text-xs text-muted-foreground">(draft)</span>
          </td>
          <td class="px-4 py-3 text-muted-foreground max-w-[160px] truncate">{{ post.slug }}</td>
          <td class="px-4 py-3">
            <button @click="togglePublish(post)" :disabled="togglingIds.has(post.id)" :class="cn(
              'rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
              post.is_published
                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
            )">
              {{ togglingIds.has(post.id) ? '...' : (post.is_published ? 'Live' : 'Draft') }}
            </button>
          </td>
          <td class="px-4 py-3 text-muted-foreground">{{ formatDate(post.published_at) }}</td>
          <td class="px-4 py-3 text-right">
            <div class="flex justify-end gap-1">
              <button @click="openEdit(post)" class="rounded px-2 py-1 text-xs hover:bg-accent">Edit</button>
              <button @click="deletePost(post)" :disabled="deletingIds.has(post.id)"
                class="rounded px-2 py-1 text-xs text-destructive hover:bg-destructive/10 disabled:opacity-50">{{
                  deletingIds.has(post.id) ? '...' : 'Delete' }}</button>
            </div>
          </td>
        </tr>
        <tr v-if="posts.length === 0">
          <td colspan="5" class="px-4 py-8 text-center text-muted-foreground">
            No blog posts yet. Click "+ New Post" to create one.
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
