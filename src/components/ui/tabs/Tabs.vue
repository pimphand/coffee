<script setup lang="ts">
import { TabsRoot, useForwardPropsEmits } from "reka-ui"

const props = defineProps<{
  defaultValue?: string
  modelValue?: string
  orientation?: "horizontal" | "vertical"
  dir?: "ltr" | "rtl"
  activationMode?: "automatic" | "manual"
  as?: string
  asChild?: boolean
}>()
const emits = defineEmits<{
  "update:modelValue": [value: string]
}>()

const forwarded = useForwardPropsEmits(props, emits)
</script>

<template>
  <TabsRoot v-bind="forwarded">
    <slot />
  </TabsRoot>
</template>
