<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import {
  Home, UtensilsCrossed, Users, FileText, ListChecks, Settings,
  ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft,
} from 'lucide-vue-next';
import { cn } from '../../lib/utils';

// Hand-port of shadcn-vue blocks/sidebar-07 — the collapsible-rail
// sidebar shell with a workspace switcher header, two nav sections,
// a user-card footer, and a content inset. All sizing tokens come
// from theme.css. (No provide/inject: nothing in the tree consumes
// a context, so the toggle stays a local `open` ref.)

// ---- props the page passes in ----------------------------------------------
const props = defineProps<{ userEmail: string; currentPath: string }>();

const open = ref(false);

const navMain = [
  { label: 'Dashboard',     href: '/admin/',         Icon: Home },
  { label: 'Menu Items',    href: '/admin/menu',     Icon: UtensilsCrossed },
  { label: 'Chefs / Team',  href: '/admin/chefs',    Icon: Users },
  { label: 'Blog Posts',    href: '/admin/blog',     Icon: FileText },
  { label: 'Reservations',  href: '/admin/reservations', Icon: ListChecks },
  { label: 'Settings',      href: '/admin/settings', Icon: Settings },
];
const navSecondary = [
  { label: 'View public site', href: '/',            Icon: Home },
  { label: 'Logout',           href: '/api/admin/logout', Icon: ChevronLeft },
];

const initials = computed(() => (props.userEmail || '?').slice(0, 2).toUpperCase());

// Close mobile rail on navigation
watch(() => props.currentPath, () => { open.value = false; });
</script>

<template>
  <!-- Mobile backdrop -->
  <div
    v-if="open"
    @click="open = false"
    class="fixed inset-0 z-30 bg-black/40 md:hidden"
    aria-hidden="true"
  ></div>

  <!-- Rail -->
  <aside
    id="admin-sidebar-rail"
    :class="cn(
      'fixed inset-y-0 left-0 z-40 flex h-screen w-[var(--sidebar-width)] flex-col border-r bg-sidebar-background text-sidebar-foreground transition-transform duration-200',
      open ? 'translate-x-0' : '-translate-x-full',
      'md:translate-x-0'
    )"
  >
    <!-- Header / workspace switcher -->
    <div class="flex h-14 items-center gap-2 border-b px-3">
      <div class="flex h-8 w-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground font-bold">
        B
      </div>
      <div class="flex-1 truncate">
        <p class="text-sm font-semibold leading-none">Brew Haven</p>
        <p class="text-xs text-muted-foreground">Admin Console</p>
      </div>
      <ChevronsUpDown class="h-4 w-4 text-muted-foreground" />
    </div>

    <!-- Main nav -->
    <nav class="flex-1 overflow-y-auto px-2 py-3">
      <p class="px-2 pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Workspace
      </p>
      <ul class="mb-3 flex flex-col gap-1">
        <li v-for="item in navMain" :key="item.href">
          <a
            :href="item.href"
            :class="cn(
              'flex items-center gap-3 rounded-md px-2.5 py-2 text-sm transition-colors',
              currentPath === item.href
                ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
            )"
          >
            <component :is="item.Icon" class="h-4 w-4 shrink-0" />
            <span class="truncate">{{ item.label }}</span>
          </a>
        </li>
      </ul>

      <p class="px-2 pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Other
      </p>
      <ul class="flex flex-col gap-1">
        <li v-for="item in navSecondary" :key="item.href">
          <a
            :href="item.href"
            class="flex items-center gap-3 rounded-md px-2.5 py-2 text-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <component :is="item.Icon" class="h-4 w-4 shrink-0" />
            <span class="truncate">{{ item.label }}</span>
          </a>
        </li>
      </ul>
    </nav>

    <!-- User footer -->
    <div class="border-t p-3">
      <div class="flex items-center gap-3 rounded-md p-2 hover:bg-sidebar-accent">
        <div class="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground text-xs font-semibold">
          {{ initials }}
        </div>
        <div class="flex-1 truncate">
          <p class="truncate text-sm font-medium">{{ userEmail }}</p>
          <p class="text-xs text-muted-foreground">Administrator</p>
        </div>
        <ChevronUp class="h-4 w-4 text-muted-foreground" />
      </div>
    </div>
  </aside>

  <!-- Inset (main content area) offset by rail width on md+ -->
  <div
    :class="cn(
      'flex min-h-screen flex-col bg-background transition-[padding] duration-200',
      'md:pl-[var(--sidebar-width)]'
    )"
  >
    <!-- Mobile top bar -->
    <header class="sticky top-0 z-20 flex h-14 items-center gap-3 border-b bg-background px-4 md:hidden">
      <button
        @click="open = !open"
        type="button"
        class="inline-flex h-10 w-10 items-center justify-center rounded-md hover:bg-accent"
        :aria-label="open ? 'Close menu' : 'Open menu'"
        :aria-expanded="open"
        aria-controls="admin-sidebar-rail"
      >
        <component :is="open ? ChevronDown : ChevronLeft" class="h-5 w-5" />
      </button>
      <p class="text-sm font-semibold">Brew Haven Admin</p>
    </header>

    <main class="flex-1 px-4 py-6 md:px-8 md:py-8">
      <slot />
    </main>
  </div>
</template>
