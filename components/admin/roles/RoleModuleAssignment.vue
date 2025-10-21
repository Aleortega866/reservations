<template>
  <div>
    <!-- Botón para abrir el diálogo de asignación de módulos -->
    <Button
      @click="openDialog"
      class="flex items-center gap-2"
    >
      <Package class="h-4 w-4" />
      Gestionar Módulos y Permisos
    </Button>

    <!-- Dialog de asignación de módulos -->
    <RoleModuleAssignmentDialog
      v-model:open="showDialog"
      :role-id="roleId"
      :role-name="roleName"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Package } from 'lucide-vue-next'
import RoleModuleAssignmentDialog from './RoleModuleAssignmentDialog.vue'

// Props
interface Props {
  roleId: string
  roleName: string
}

defineProps<Props>()

// Estado reactivo
const showDialog = ref(false)

// Métodos
const openDialog = () => {
  showDialog.value = true
}
</script>
