<script setup lang="ts">
import { ref, reactive, computed } from "vue";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface BlogPost {
  id: string;
  slug: string;
  title_en: string;
  title_id: string;
  excerpt_en: string;
  excerpt_id: string;
  content_en: string;
  content_id: string;
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

const posts = ref<BlogPost[]>(safeParse(props.serverPosts || "[]"));
const loading = ref(false);
const error = ref("");
const showForm = ref(false);
const editingId = ref<string | null>(null);
const togglingIds = ref<Set<string>>(new Set());
const deletingIds = ref<Set<string>>(new Set());

const emptyForm = () => ({
  slug: "",
  title_en: "",
  title_id: "",
  excerpt_en: "",
  excerpt_id: "",
  content_en: "",
  content_id: "",
  image: "",
  author_name: "Brew Haven",
});

const form = reactive(emptyForm());

const isEditing = computed(() => editingId.value !== null);

function openCreate() {
  editingId.value = null;
  Object.assign(form, emptyForm());
  showForm.value = true;
  error.value = "";
}

function openEdit(post: BlogPost) {
  editingId.value = post.id;
  form.slug = post.slug;
  form.title_en = post.title_en;
  form.title_id = post.title_id;
  form.excerpt_en = post.excerpt_en;
  form.excerpt_id = post.excerpt_id;
  form.content_en = post.content_en;
  form.content_id = post.content_id;
  form.image = post.image;
  form.author_name = post.author_name;
  showForm.value = true;
  error.value = "";
}

async function save() {
  if (!form.slug || !form.title_en || !form.title_id) {
    error.value = "Slug, English title, and Indonesian title are required.";
    return;
  }
  loading.value = true;
  error.value = "";

  try {
    const method = isEditing.value ? "PUT" : "POST";
    const body: any = { ...form };
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
  <div v-if="error" class="mb-4 rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
    {{ error }}
  </div>

  <div class="mb-4 flex items-center justify-between">
    <Button @click="openCreate">+ New Post</Button>
  </div>

  <!-- Create / Edit modal-overlay -->
  <div
    v-if="showForm"
    class="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-[10vh]"
    @click.self="showForm = false"
  >
    <div class="w-full max-w-2xl rounded-lg border bg-background p-6 shadow-xl mx-4 max-h-[80vh] overflow-y-auto">
      <h2 class="mb-4 text-lg font-semibold">
        {{ isEditing ? 'Edit Post' : 'New Post' }}
      </h2>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="mb-1 block text-sm font-medium">Slug *</label>
          <Input v-model="form.slug" placeholder="my-post-slug" />
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium">Author</label>
          <Input v-model="form.author_name" placeholder="Brew Haven" />
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium">Title (EN) *</label>
          <Input v-model="form.title_en" placeholder="English title" />
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium">Title (ID) *</label>
          <Input v-model="form.title_id" placeholder="Judul Indonesia" />
        </div>
        <div class="col-span-2">
          <label class="mb-1 block text-sm font-medium">Excerpt (EN)</label>
          <Input v-model="form.excerpt_en" placeholder="Short English summary" />
        </div>
        <div class="col-span-2">
          <label class="mb-1 block text-sm font-medium">Excerpt (ID)</label>
          <Input v-model="form.excerpt_id" placeholder="Ringkasan singkat" />
        </div>
        <div class="col-span-2">
          <label class="mb-1 block text-sm font-medium">Image URL</label>
          <Input v-model="form.image" placeholder="/assets/images/..." />
        </div>
        <div class="col-span-2">
          <label class="mb-1 block text-sm font-medium">Content (EN)</label>
          <textarea
            v-model="form.content_en"
            rows="4"
            class="w-full rounded-md border bg-background px-3 py-2 text-sm"
            placeholder="Full English article content..."
          ></textarea>
        </div>
        <div class="col-span-2">
          <label class="mb-1 block text-sm font-medium">Content (ID)</label>
          <textarea
            v-model="form.content_id"
            rows="4"
            class="w-full rounded-md border bg-background px-3 py-2 text-sm"
            placeholder="Konten artikel lengkap..."
          ></textarea>
        </div>
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
          <th class="px-4 py-3 font-medium">Title (EN)</th>
          <th class="px-4 py-3 font-medium">Slug</th>
          <th class="px-4 py-3 font-medium">Published</th>
          <th class="px-4 py-3 font-medium">Date</th>
          <th class="px-4 py-3 font-medium text-right">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="post in posts"
          :key="post.id"
          :class="cn('border-b', !post.is_published && 'opacity-60')"
        >
          <td class="px-4 py-3 max-w-[240px] truncate">
            {{ post.title_en }}
            <span v-if="!post.is_published" class="ml-2 text-xs text-muted-foreground">(draft)</span>
          </td>
          <td class="px-4 py-3 text-muted-foreground max-w-[160px] truncate">{{ post.slug }}</td>
          <td class="px-4 py-3">
            <button
              @click="togglePublish(post)"
              :disabled="togglingIds.has(post.id)"
              :class="cn(
                'rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
                post.is_published
                  ? 'bg-green-100 text-green-800 hover:bg-green-200'
                  : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
              )"
            >
              {{ togglingIds.has(post.id) ? '...' : (post.is_published ? 'Live' : 'Draft') }}
            </button>
          </td>
          <td class="px-4 py-3 text-muted-foreground">{{ formatDate(post.published_at) }}</td>
          <td class="px-4 py-3 text-right">
            <div class="flex justify-end gap-1">
              <button
                @click="openEdit(post)"
                class="rounded px-2 py-1 text-xs hover:bg-accent"
              >Edit</button>
              <button
                @click="deletePost(post)"
                :disabled="deletingIds.has(post.id)"
                class="rounded px-2 py-1 text-xs text-destructive hover:bg-destructive/10 disabled:opacity-50"
              >{{ deletingIds.has(post.id) ? '...' : 'Delete' }}</button>
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
