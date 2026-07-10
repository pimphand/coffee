<script setup lang="ts">
import Sidebar from './Sidebar.vue';

defineProps<{ userEmail: string; currentPath: string }>();
</script>

<template>
  <!-- Sidebar.vue renders BOTH the rail (aside) AND the inset (main)
       wrapper, with a default <slot/> inside main. This means the page
       just mounts <AdminShell> and fills the slot with the chosen
       dashboard body. -->
  <Sidebar :user-email="userEmail" :current-path="currentPath">
    <slot />
  </Sidebar>
</template>
