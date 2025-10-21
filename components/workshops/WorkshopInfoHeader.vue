<template>
  <div class="space-y-2">
    <h2 class="text-lg font-medium">Talleres disponibles</h2>
    <div class="flex items-center space-x-2">
      <Icon icon="lucide:circle-alert" width="16" height="16" class="text-muted-foreground" />
      <p class="text-xs text-muted-foreground">
        Solo puedes elegir un máximo de 2 talleres
      </p>
    </div>
    <div class="flex items-center space-x-2">
      <Icon icon="lucide:circle-alert" width="16" height="16" class="text-muted-foreground" />
      <p class="text-xs text-muted-foreground">
        Cada taller se agrega de manera automática al seleccionar los talleres
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
</script> 