<template>
  <div class="min-h-screen bg-background flex flex-col">
    <!-- Loading durante verificación de autenticación -->
    <AuthLoading v-if="shouldShowLoading" />

    <!-- Contenido solo si está autenticado -->
    <template v-else-if="shouldShowContent">
      <AdminHeader title="Gestión de costos y promociones" showBackButton showMoreButton @goBack="goBack" />
      <div class="p-4 space-y-4">


        <section>
        <WorkshopList label="Gestionar talleres"
          v-auto-animate="{ duration: 100, easing: 'ease-out' }" :modelValue="selectedFormularios" :formularios="formulariosPrincipales"
          :onToggleEnable="handleToggleEnable" @update:modelValue="updateSelectedFormularios" @update-formulario="handleUpdateFormulario"
          @new-formulario="handleNewFormulario" @delete-formulario="handleDeleteFormulario" />

        <!-- Mostrar estado de carga -->
        <div v-if="formTypesLoading" class="p-4 text-center">
          <p class="text-muted-foreground">Cargando formularios...</p>
        </div>
        
        <!-- Mostrar error si existe -->
        <div v-if="formTypesError" class="p-4 bg-destructive/10 border border-destructive/20 rounded-md">
          <p class="text-destructive text-sm">{{ formTypesError }}</p>
        </div>
      </section>

      <section>
        <RulesWorkshop label="Reglas para talleres"
          v-auto-animate="{ duration: 100, easing: 'ease-out' }"  />

        </section>



      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { vAutoAnimate } from '@formkit/auto-animate/vue';
import AdminHeader from '@/components/admin/AdminHeader.vue';
import WorkshopList from '@/components/admin/cursos/WorkshopList.vue';
import RulesWorkshop from '@/components/admin/cursos/RulesWorkshop.vue';
import { useFormTypes } from '@/composables/catalog/useFormTypes';
import { useToast } from '@/composables/ui/useToast';
import { useAuthGuard } from '@/composables/auth/useAuthGuard';
import AuthLoading from '@/components/auth/AuthLoading.vue';


// Datos de los tipos de boletos convertidos al formato esperado por TicketCostList
const cupoOptions = ref([
  { id: 1, enable: true, description: '10:00', horario: '10:00', maxcupo: '360', currentcupo: '310' },
  { id: 2, enable: false, description: '11:00', horario: '11:00', maxcupo: '360', currentcupo: '310' },
  { id: 3, enable: true, description: '12:00', horario: '12:00', maxcupo: '360', currentcupo: '310' },
  { id: 4, enable: true, description: '13:00', horario: '13:00', maxcupo: '360', currentcupo: '310' },
  { id: 5, enable: false, description: '14:00', horario: '14:00', maxcupo: '360', currentcupo: '310' },
  { id: 6, enable: false, description: '15:00', horario: '15:00', maxcupo: '360', currentcupo: '310' },
  { id: 7, enable: true, description: '16:00', horario: '16:00', maxcupo: '360', currentcupo: '310' }
]);

// Composable para manejar tipos de formularios
const { formTypes, loading: formTypesLoading, error: formTypesError, loadFormTypes, updateFormTypeEnableStatus } = useFormTypes();

// Composable para toasts
const { showSuccess, showError, showInfo } = useToast();

// Guard de autenticación
const { shouldShowLoading, shouldShowContent } = useAuthGuard();


// Cargar tipos de formularios al montar el componente
onMounted(() => {
  loadFormTypes();
});

// Datos de formularios principales - se llenan desde la API
const formulariosPrincipales = computed(() => formTypes.value);


// Estado para los formularios seleccionados
const selectedFormularios = ref<number[]>([]);
const selectedCupo = ref<number[]>([]);

const router = useRouter();

const goBack = () => {
  router.back();
};


const updateSelectedFormularios = (formularios: number[] | number) => {
  if (Array.isArray(formularios)) {
    selectedFormularios.value = formularios;
  } else {
    selectedFormularios.value = [formularios];
  }
};

const updateSelectedCupo = (cupo: number[] | number) => {
  if (Array.isArray(cupo)) {
    selectedCupo.value = cupo;
  } else {
    selectedCupo.value = [cupo];
  }
};

const handleUpdateFormulario = async (formulario: any) => {
  try {
    showInfo('Actualizando formulario', 'Procesando los cambios...', {duration: 2000});
    
    // Aquí se implementaría la lógica para actualizar en la API
    // Simular operación asíncrona
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    showSuccess('Formulario actualizado', `El formulario "${formulario.description || formulario.name}" se ha actualizado correctamente`);
    console.log('Formulario actualizado:', formulario);
  } catch (error) {
    showError('Error al actualizar', 'No se pudo actualizar el formulario');
    console.error('Error al actualizar formulario:', error);
  }
};

const handleUpdateCupo = async (cupo: any) => {
  try {
    showInfo('Actualizando cupo', 'Procesando los cambios...', {duration: 2000});
    
    // Aquí se implementaría la lógica para actualizar en la API
    // Simular operación asíncrona
    await new Promise(resolve => setTimeout(resolve, 2000));  

    showSuccess('Cupo actualizado', `El cupo "${cupo.description || cupo.name}" se ha actualizado correctamente`);
    console.log('Cupo actualizado:', cupo);
  } catch (error) {
    showError('Error al actualizar', 'No se pudo actualizar el cupo');
    console.error('Error al actualizar cupo:', error);
  }
};

const handleNewFormulario = async (formulario: any) => {
  try {
    showInfo('Creando formulario', 'Procesando la creación...');
    
    // Aquí se implementaría la lógica para crear en la API
    // Simular operación asíncrona
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    showSuccess('Formulario creado', `El formulario "${formulario.description || formulario.name}" se ha creado exitosamente`);
    console.log('Nuevo formulario creado:', formulario);
  } catch (error) {
    showError('Error al crear', 'No se pudo crear el formulario');
    console.error('Error al crear formulario:', error);
  }
};

const handleNewCupo = async (cupo: any) => {
  try {
    showInfo('Creando cupo', 'Procesando la creación...');
    
    // Aquí se implementaría la lógica para crear en la API
    // Simular operación asíncrona
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    showSuccess('Cupo creado', `El cupo "${cupo.description || cupo.name}" se ha creado exitosamente`);
    console.log('Nuevo cupo creado:', cupo);
  } catch (error) {
    showError('Error al crear', 'No se pudo crear el cupo');
    console.error('Error al crear cupo:', error);
  }
};

const handleDeleteFormulario = async (formulario: any) => {
  try {
    showInfo('Eliminando formulario', 'Procesando la eliminación...');
    
    // Aquí se implementaría la lógica para eliminar en la API
    // Simular operación asíncrona
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    showSuccess('Formulario eliminado', `El formulario "${formulario.description || formulario.name}" se ha eliminado correctamente`);
    console.log('Formulario eliminado:', formulario);
  } catch (error) {
    showError('Error al eliminar', 'No se pudo eliminar el formulario');
    console.error('Error al eliminar formulario:', error);
  }
};

const handleDeleteCupo = async (cupo: any) => { 
  try {
    showInfo('Eliminando cupo', 'Procesando la eliminación...');
    
    // Aquí se implementaría la lógica para eliminar en la API
    // Simular operación asíncrona
    await new Promise(resolve => setTimeout(resolve, 1000));  

    showSuccess('Cupo eliminado', `El cupo "${cupo.description || cupo.name}" se ha eliminado correctamente`);
    console.log('Cupo eliminado:', cupo);
  } catch (error) {
    showError('Error al eliminar', 'No se pudo eliminar el cupo');
    console.error('Error al eliminar cupo:', error);
  }
};

const handleToggleEnable = async (id: number) => {
  try {
    showInfo('Cambiando estado', 'Actualizando el estado del formulario...', {duration: 2000});
    
    const result = await updateFormTypeEnableStatus(id);
    
    if (result) {
      // Buscar el formulario para obtener su descripción
      const formulario = formulariosPrincipales.value.find((f: any) => f.id === id);
      const nombre = formulario?.description || `Formulario ${id}`;
      const estado = formulario?.enable ? 'habilitado' : 'deshabilitado';
      
      setTimeout(() => {
        showSuccess('Estado actualizado', `El formulario "${nombre}" ha sido ${estado} correctamente`);
      }, 2000);
      console.log(`Estado del formulario ${id} actualizado exitosamente`);
    } else {
      setTimeout(() => {
        showError('Error al actualizar', 'No se pudo cambiar el estado del formulario');
      }, 2000);
      console.error(`Error al actualizar el estado del formulario ${id}`);
    }
  } catch (error) {
    setTimeout(() => {
      showError('Error al cambiar estado', 'Ocurrió un error inesperado');
    }, 2000);
    console.error('Error al cambiar el estado del formulario:', error);
  }
};

const handleToggleEnableCupo = async (id: number) => {
  try {
    showInfo('Cambiando estado', 'Actualizando el estado del cupo...', {duration: 2000});
    
    const result = await updateFormTypeEnableStatus(id);
    
    if (result) {
      const cupo = cupoOptions.value.find((c: any) => c.id === id);
      const nombre = cupo?.description || `Cupo ${id}`;
      const estado = cupo?.enable ? 'habilitado' : 'deshabilitado';
      
      setTimeout(() => {
        showSuccess('Estado actualizado', `El cupo "${nombre}" ha sido ${estado} correctamente`);
      }, 2000);
      console.log(`Estado del cupo ${id} actualizado exitosamente`);
    } else {
      setTimeout(() => {
        showError('Error al actualizar', 'No se pudo cambiar el estado del cupo');
      }, 2000);
      console.error(`Error al actualizar el estado del cupo ${id}`);
    }
  } catch (error) {
    setTimeout(() => {
      showError('Error al cambiar estado', 'Ocurrió un error inesperado');
    }, 2000);
    console.error('Error al cambiar el estado del cupo:', error);
  }
};

const handleAddQuotaRules = () => {
  showInfo('Reglas de cupo', 'Abriendo configuración de reglas específicas de cupo...');
  console.log('Abriendo diálogo de reglas de cupo');
  // Aquí se implementaría la lógica para abrir el diálogo de reglas de cupo
};

</script>