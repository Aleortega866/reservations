<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-semibold flex items-center gap-2">
        <History class="h-5 w-5" />
        Historial de Modificaciones
      </h3>
      <Button
        variant="outline"
        size="sm"
        @click="refreshHistory"
        :disabled="isLoading"
      >
        <RefreshCw class="h-4 w-4 mr-2" :class="{ 'animate-spin': isLoading }" />
        Actualizar
      </Button>
    </div>

    <!-- Filtros -->
    <div class="flex flex-wrap gap-2">
      <Select v-model="selectedAction" :disabled="isLoading">
        <SelectTrigger class="w-40">
          <SelectValue placeholder="Todas las acciones" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas las acciones</SelectItem>
          <SelectItem value="create">Creación</SelectItem>
          <SelectItem value="update">Actualización</SelectItem>
          <SelectItem value="delete">Eliminación</SelectItem>
          <SelectItem value="assign">Asignación</SelectItem>
          <SelectItem value="remove">Remoción</SelectItem>
        </SelectContent>
      </Select>

      <Select v-model="selectedUser" :disabled="isLoading">
        <SelectTrigger class="w-40">
          <SelectValue placeholder="Todos los usuarios" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los usuarios</SelectItem>
          <SelectItem
            v-for="user in uniqueUsers"
            :key="user"
            :value="user"
          >
            {{ user }}
          </SelectItem>
        </SelectContent>
      </Select>

      <Input
        v-model="searchTerm"
        placeholder="Buscar en historial..."
        class="w-48"
        :disabled="isLoading"
      />
    </div>

    <!-- Lista de historial -->
    <div class="space-y-2 max-h-96 overflow-y-auto">
      <div v-if="filteredHistory.length === 0" class="text-center py-8 text-muted-foreground">
        <History class="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>No se encontraron registros</p>
      </div>
      
      <div
        v-for="entry in filteredHistory"
        :key="entry.id"
        class="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
      >
        <!-- Icono de acción -->
        <div class="flex-shrink-0 mt-1">
          <div
            class="p-2 rounded-full"
            :class="getActionIconClass(entry.action)"
          >
            <component
              :is="getActionIcon(entry.action)"
              class="h-4 w-4"
            />
          </div>
        </div>

        <!-- Contenido del historial -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1">
            <span class="font-medium">{{ entry.description }}</span>
            <Badge
              :variant="getActionBadgeVariant(entry.action)"
              class="text-xs"
            >
              {{ getActionLabel(entry.action) }}
            </Badge>
          </div>
          
          <p class="text-sm text-muted-foreground mb-2">
            {{ entry.details }}
          </p>
          
          <div class="flex items-center gap-4 text-xs text-muted-foreground">
            <div class="flex items-center gap-1">
              <Clock class="h-3 w-3" />
              {{ formatDate(entry.timestamp) }}
            </div>
            <div class="flex items-center gap-1">
              <User class="h-3 w-3" />
              {{ entry.userName }}
            </div>
            <div v-if="entry.ipAddress" class="flex items-center gap-1">
              <Globe class="h-3 w-3" />
              {{ entry.ipAddress }}
            </div>
          </div>
        </div>

        <!-- Detalles adicionales -->
        <div v-if="entry.metadata" class="flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            @click="showDetails(entry)"
          >
            <Eye class="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>

    <!-- Paginación -->
    <div v-if="totalPages > 1" class="flex items-center justify-between">
      <p class="text-sm text-muted-foreground">
        Mostrando {{ (currentPage - 1) * pageSize + 1 }} - {{ Math.min(currentPage * pageSize, totalEntries) }} de {{ totalEntries }} registros
      </p>
      <div class="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          @click="currentPage = Math.max(1, currentPage - 1)"
          :disabled="currentPage === 1 || isLoading"
        >
          <ChevronLeft class="h-4 w-4" />
        </Button>
        <span class="text-sm">
          Página {{ currentPage }} de {{ totalPages }}
        </span>
        <Button
          variant="outline"
          size="sm"
          @click="currentPage = Math.min(totalPages, currentPage + 1)"
          :disabled="currentPage === totalPages || isLoading"
        >
          <ChevronRight class="h-4 w-4" />
        </Button>
      </div>
    </div>

    <!-- Dialog de detalles -->
    <Dialog v-model:open="showDetailsDialog">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Detalles del Registro</DialogTitle>
        </DialogHeader>
        <div v-if="selectedEntry" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-sm font-medium text-muted-foreground">Acción</label>
              <p class="font-medium">{{ getActionLabel(selectedEntry.action) }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-muted-foreground">Usuario</label>
              <p class="font-medium">{{ selectedEntry.userName }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-muted-foreground">Fecha</label>
              <p class="font-medium">{{ formatDate(selectedEntry.timestamp) }}</p>
            </div>
            <div v-if="selectedEntry.ipAddress">
              <label class="text-sm font-medium text-muted-foreground">IP</label>
              <p class="font-medium">{{ selectedEntry.ipAddress }}</p>
            </div>
          </div>
          
          <div>
            <label class="text-sm font-medium text-muted-foreground">Descripción</label>
            <p class="font-medium">{{ selectedEntry.description }}</p>
          </div>
          
          <div>
            <label class="text-sm font-medium text-muted-foreground">Detalles</label>
            <p class="text-sm">{{ selectedEntry.details }}</p>
          </div>
          
          <div v-if="selectedEntry.metadata">
            <label class="text-sm font-medium text-muted-foreground">Metadatos</label>
            <pre class="text-xs bg-muted p-3 rounded overflow-auto">{{ JSON.stringify(selectedEntry.metadata, null, 2) }}</pre>
          </div>
        </div>
        <DialogFooter>
          <Button @click="showDetailsDialog = false">Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { 
  History, 
  RefreshCw, 
  Clock, 
  User, 
  Globe, 
  Eye,
  ChevronLeft,
  ChevronRight,
  Plus,
  Edit,
  Trash2,
  Shield,
  Package
} from 'lucide-vue-next'
import { useToast } from '@/composables/ui/useToast'

// Props
interface Props {
  roleId: string
  roleName: string
}

const props = defineProps<Props>()

// Composables
const { showSuccess, showError } = useToast()

// Estado reactivo
const isLoading = ref(false)
const history = ref<Array<{
  id: string
  action: string
  description: string
  details: string
  timestamp: string
  userName: string
  ipAddress?: string
  metadata?: any
}>>([])

const selectedAction = ref('all')
const selectedUser = ref('all')
const searchTerm = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const showDetailsDialog = ref(false)
const selectedEntry = ref<any>(null)

// Computed
const uniqueUsers = computed(() => {
  const users = [...new Set(history.value.map(entry => entry.userName))]
  return users.sort()
})

const filteredHistory = computed(() => {
  let filtered = history.value

  // Filtrar por acción
  if (selectedAction.value !== 'all') {
    filtered = filtered.filter(entry => entry.action === selectedAction.value)
  }

  // Filtrar por usuario
  if (selectedUser.value !== 'all') {
    filtered = filtered.filter(entry => entry.userName === selectedUser.value)
  }

  // Filtrar por término de búsqueda
  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase()
    filtered = filtered.filter(entry => 
      entry.description.toLowerCase().includes(term) ||
      entry.details.toLowerCase().includes(term) ||
      entry.userName.toLowerCase().includes(term)
    )
  }

  // Paginación
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  
  return filtered.slice(start, end)
})

const totalEntries = computed(() => {
  let filtered = history.value

  if (selectedAction.value !== 'all') {
    filtered = filtered.filter(entry => entry.action === selectedAction.value)
  }

  if (selectedUser.value !== 'all') {
    filtered = filtered.filter(entry => entry.userName === selectedUser.value)
  }

  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase()
    filtered = filtered.filter(entry => 
      entry.description.toLowerCase().includes(term) ||
      entry.details.toLowerCase().includes(term) ||
      entry.userName.toLowerCase().includes(term)
    )
  }

  return filtered.length
})

const totalPages = computed(() => Math.ceil(totalEntries.value / pageSize.value))

// Métodos
const loadHistory = async () => {
  try {
    isLoading.value = true
    
    // Simular carga de historial desde la API
    // En una implementación real, aquí harías la llamada a la API
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Datos de ejemplo
    history.value = [
      {
        id: '1',
        action: 'assign',
        description: 'Asignación de módulo "Gestión de Usuarios"',
        details: 'Se asignó el módulo con permisos de lectura y escritura',
        timestamp: new Date().toISOString(),
        userName: 'Admin',
        ipAddress: '192.168.1.100',
        metadata: {
          moduleId: 1,
          permissions: ['read', 'write']
        }
      },
      {
        id: '2',
        action: 'update',
        description: 'Actualización de permisos del módulo',
        details: 'Se modificaron los permisos del módulo "Gestión de Usuarios"',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        userName: 'Admin',
        ipAddress: '192.168.1.100'
      },
      {
        id: '3',
        action: 'create',
        description: 'Creación del rol',
        details: 'Se creó el rol con permisos básicos',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        userName: 'Admin',
        ipAddress: '192.168.1.100'
      }
    ]
  } catch (error) {
    console.error('Error al cargar historial:', error)
    showError('Error', 'No se pudo cargar el historial')
  } finally {
    isLoading.value = false
  }
}

const refreshHistory = async () => {
  await loadHistory()
  showSuccess('Actualizado', 'El historial se ha actualizado')
}

const getActionIcon = (action: string) => {
  switch (action) {
    case 'create': return Plus
    case 'update': return Edit
    case 'delete': return Trash2
    case 'assign': return Shield
    case 'remove': return Package
    default: return History
  }
}

const getActionIconClass = (action: string) => {
  switch (action) {
    case 'create': return 'bg-green-100 text-green-600'
    case 'update': return 'bg-blue-100 text-blue-600'
    case 'delete': return 'bg-red-100 text-red-600'
    case 'assign': return 'bg-purple-100 text-purple-600'
    case 'remove': return 'bg-orange-100 text-orange-600'
    default: return 'bg-gray-100 text-gray-600'
  }
}

const getActionBadgeVariant = (action: string) => {
  switch (action) {
    case 'create': return 'default'
    case 'update': return 'secondary'
    case 'delete': return 'destructive'
    case 'assign': return 'outline'
    case 'remove': return 'outline'
    default: return 'secondary'
  }
}

const getActionLabel = (action: string) => {
  switch (action) {
    case 'create': return 'Creación'
    case 'update': return 'Actualización'
    case 'delete': return 'Eliminación'
    case 'assign': return 'Asignación'
    case 'remove': return 'Remoción'
    default: return 'Acción'
  }
}

const formatDate = (timestamp: string) => {
  const date = new Date(timestamp)
  return date.toLocaleString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const showDetails = (entry: any) => {
  selectedEntry.value = entry
  showDetailsDialog.value = true
}

// Lifecycle
onMounted(() => {
  loadHistory()
})
</script>
