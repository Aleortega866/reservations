<template>
  <div>
    <div class="space-y-0 mt-1" v-auto-animate="{ duration: 200, easing: 'ease-out' }">
      <!-- Input principal que se expande -->
      <div class="relative" :class="showOptions ? 'rounded-t-md' : 'rounded-md'">
        <Card class="bg-secondary/10 cursor-pointer hover:bg-secondary/20 transition-colors px-3 py-2"
          @click="toggleOptions" :class="[
            showOptions ? 'rounded-t-xl rounded-b-none' : 'rounded-full'
          ]">
          <CardContent class="flex items-center justify-between py-1 px-1">
            <p class="text-sm font-semibold">Documentos</p>
            <Icon v-if="showOptions" icon="lucide:chevrons-down-up" width="16" height="16" class="text-muted-foreground" />
            <Icon v-else icon="lucide:chevrons-up-down" width="16" height="16" class="text-muted-foreground" />
          </CardContent>
        </Card>
      </div>

      <div v-if="showOptions" class="space-y-0" v-auto-animate="{ duration: 150, easing: 'ease-in-out' }">

        <!-- Botón de agregar nuevo código -->
        <div  class="p-3 bg-primary/20 hover:bg-primary/30 transition-colors cursor-pointer"
          @click.stop="emit('create')">
          <div class="flex items-center justify-between space-x-2 px-2">
            <span class="text-sm text-muted-foreground font-medium">Agrega nueva solicitud de documento</span>
            <Icon icon="lucide:plus" width="16" height="16" class="text-primary" />
          </div>
        </div>


        <div class="max-h-auto overflow-y-auto" v-auto-animate="{ duration: 100 }">
          <div v-for="(req, index) in documentRequests" :key="req.id"
            class="p-2 border border-secondary/80 border-x-0 border-b-0 border-t-1 hover:bg-muted/50 transition-colors"
            :class="[
              index === documentRequests.length - 1 ? 'rounded-b-md' : 'rounded-none',
              index % 2 === 0 ? 'bg-[#D8E8F8]' : 'bg-[#EBF4FC]'
              ]">
            <div class="flex items-center justify-between space-x-4">
              <div class="flex items-center space-x-4">
                <Switch :model-value="req.enable" class="mr-2" @update:model-value="() => emit('toggle-enable', req)"
                  :disabled="!canToggle" />
                <div class="flex flex-col pe-2">
                  <span class="text-sm font-medium text-foreground truncate max-w-[220px]">
                    {{ req.title }}
                  </span>
                </div>
              </div>

              <div class="flex items-center space-x-1">
                <Button size="icon" variant="ghost" @click="emit('edit', req)">
                  <Icon icon="lucide:pencil" width="16" height="16" class="text-primary" />
                </Button>
                <Button size="icon" variant="ghost" @click="emit('delete', req)">
                  <Icon icon="lucide:trash-2" width="16" height="16" class="text-destructive" />
                </Button> 
              </div>
            </div>
          </div>

          <div v-if="documentRequests.length === 0"
            class="p-3 bg-background border border-muted border-t-0 rounded-b-md">
            <span class="text-sm text-muted-foreground text-center block">
              No hay solicitudes de documentos
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { vAutoAnimate } from '@formkit/auto-animate/vue'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Icon } from '@iconify/vue'

interface DocumentRequestListItem {
  id: number
  title: string
  enable: boolean
}

interface Props {
  label: string
  documentRequests: readonly DocumentRequestListItem[]
  autoOpen?: boolean
  canToggle?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  autoOpen: false,
  canToggle: true
})

const emit = defineEmits<{
  (e: 'create'): void
  (e: 'edit', item: DocumentRequestListItem): void
  (e: 'delete', item: DocumentRequestListItem): void
  (e: 'toggle-enable', item: DocumentRequestListItem): void
}>()

const showOptions = ref(props.autoOpen)

watch(() => props.autoOpen, (value: boolean) => {
  showOptions.value = value
})

const toggleOptions = () => {
  showOptions.value = !showOptions.value
}
</script>
