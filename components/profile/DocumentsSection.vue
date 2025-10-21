<template>
  <div class="space-y-2">
    <Label class="text-sm font-medium">Documentos</Label>
    <div class="grid grid-cols-3 gap-3">
      <DocumentCard 
        v-for="(doc, index) in documents" 
        :key="index"
        :document="doc"
        @update:checked="updateDocumentStatus(index, $event)"
      />
    </div>
    <div class="flex items-center space-x-2 mt-2">
      <Icon icon="lucide:circle-alert" width="16" height="16" class="text-muted-foreground" />
      <p class="text-xs text-muted-foreground">
        Acepta los términos de condiciones por favor. PDF, documentos y opales
      </p>
    </div>
    <p class="text-xs text-muted-foreground">Subir más documentos</p>
  </div>
</template>

<script setup lang="ts">
import { Label } from '@/components/ui/label'
import { Icon } from '@iconify/vue'
import DocumentCard from './DocumentCard.vue'
import { ref } from 'vue'
import type { Document } from '@/types/reservations'

const documents = ref<Document[]>([
  { id: 'doc1', name: 'Acepto doc#1', checked: false },
  { id: 'doc2', name: 'Acepto doc#2', checked: false },
  { id: 'doc3', name: 'Acepto', checked: false }
])

const updateDocumentStatus = (index: number, checked: boolean) => {
  documents.value[index].checked = checked
}
</script> 