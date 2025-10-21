<template>
  <div class="workshop-content-viewer">
    <!-- Modal para mostrar el contenido -->
    <Dialog v-model:open="isOpen" class="max-w-4xl">
      <DialogContent class="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>{{ workshop?.title }}</DialogTitle>
          <DialogDescription>{{ workshop?.description }}</DialogDescription>
        </DialogHeader>
        
        <div class="content-container">
          <!-- Video -->
          <video 
            v-if="workshop?.type === 'video' && workshop?.contentUrl" 
            :src="workshop.contentUrl"
            controls
            class="w-full h-full object-contain"
            preload="metadata"
          >
            Tu navegador no soporta el elemento de video.
          </video>
          
          <!-- PDF -->
          <iframe 
            v-else-if="workshop?.type === 'pdf' && workshop?.contentUrl"
            :src="workshop.contentUrl"
            class="w-full h-full border-0"
            title="PDF Viewer"
          ></iframe>
          
          <!-- Imagen -->
          <img 
            v-else-if="workshop?.type === 'image' && workshop?.contentUrl"
            :src="workshop.contentUrl"
            :alt="workshop.title"
            class="w-full h-full object-contain"
          />
          
          <!-- Contenido no disponible -->
          <div v-else class="flex items-center justify-center h-64 text-muted-foreground">
            <div class="text-center">
              <Icon icon="ri:file-damage-line" class="w-16 h-16 mx-auto mb-4" />
              <p>Contenido no disponible</p>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button @click="closeModal" variant="outline">
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Icon } from '@iconify/vue'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const props = defineProps({
  workshop: {
    type: Object,
    required: true
  },
  open: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:open'])

const isOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value)
})

const closeModal = () => {
  isOpen.value = false
}
</script>

<style scoped>
.content-container {
  min-height: 400px;
  max-height: 60vh;
  overflow: hidden;
}
</style> 