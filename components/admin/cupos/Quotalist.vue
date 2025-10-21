<template>
    <div>
        <div class="space-y-0 mt-1" v-auto-animate="{ duration: 200, easing: 'ease-out' }">
            <!-- Input principal que se expande -->
            <div class="relative" :class="showOptions ? 'rounded-t-md' : 'rounded-md'">
                <Card 
                    class="bg-secondary/10 cursor-pointer hover:bg-secondary/20 transition-colors px-3 py-2"
                    :class="[
                        showOptions ? 'rounded-t-xl rounded-b-none' : 'rounded-full'
                    ]"
                    @click="toggleOptions">
                    <CardContent class="flex items-center justify-between py-1 px-1">
                        <p class="text-sm font-semibold">Disponibilidad</p>
                        <Icon v-if="showOptions" icon="lucide:chevrons-down-up" width="16" height="16" class="text-muted-foreground" />
                        <Icon v-else icon="lucide:chevrons-up-down" width="16" height="16" class="text-muted-foreground" />
                    </CardContent>
                </Card>
            </div>



            <!-- Opciones que se expanden hacia abajo -->
            <div v-if="showOptions" class="space-y-0" v-auto-animate="{ duration: 150, easing: 'ease-in-out' }">
          
                <!-- Botón de agregar nuevo código -->
                <div class="p-3 bg-primary/20 hover:bg-primary/30 transition-colors cursor-pointer"
                    @click="openQuotaRulesDialog">
                    <div class="flex items-center justify-between space-x-2 px-2">
                        <span class="text-sm text-muted-foreground font-medium">Revisa y agrega reglas específicas de
                            cupo</span>
                        <Icon icon="lucide:plus" width="16" height="16" class="text-primary" />
                    </div>
                </div>

                <div class="p-3 bg-secondary/10 hover:bg-secondary/20 transition-colors"
                    >
                    <div class="flex items-center justify-between space-x-2 px-2">
                        <span class="text-sm text-muted-foreground font-medium">Sobre cupo permitido:</span>
                        <div class="flex items-center space-x-4">
                            <span class="text-sm text-muted-foreground font-bold">{{ props.overSlot || 0 }}</span>
                            <Button variant="secondary" size="icon" @click="openEditOverSlotDialog" class="cursor-pointer transition-colors hover:bg-secondary/80">
                                <Icon icon="lucide:edit" width="16" height="16"  />
                            </Button>
                        </div>

                    </div>
                </div>

                 <!-- Lista de cupos -->
                <div class="max-h-auto overflow-y-auto" v-auto-animate="{ duration: 100 }">
                    <div v-for="(formulario, index) in props.cupoOptions" :key="formulario.id"
                        class="p-2 border border-secondary/80 border-x-0 border-b-0 border-t-1 hover:bg-muted/50 transition-colors"
                        :class="[
                            index === props.cupoOptions.length - 1 ? 'rounded-b-md' : 'rounded-none',
                            index % 2 === 0 ? 'bg-[#D8E8F8]' : 'bg-[#EBF4FC]'
                            ]">
                        <div class="w-full flex items-center justify-between space-x-4">
                            <div class="w-full flex justify-between items-center space-x-4">
                                <div class="flex items-center space-x-2">
                                    <!-- Switch por formulario -->
                                    <Switch :model-value="formulario.enable" class="mr-2"
                                        @update:model-value="handleToggleEnable(formulario.id)"
                                        :disabled="!props.onToggleEnable" />
                                    <div class="flex space-x-1">
                                        <span class="text-sm font-medium text-foreground">
                                            Horario:
                                        </span>
                                        <span class="text-sm font-medium text-foreground">
                                            {{ formulario.description }}
                                        </span>
                                    </div>
                                </div>
                                <div class="flex items-center space-x-2">
                                    <span class="text-sm font-medium text-foreground">
                                        Cupo:
                                    </span>
                                    <div class="flex items-center space-x-1">
                                        <span class="text-sm font-medium text-foreground">
                                            {{ formulario.currentcupo || 'N/A' }}
                                        </span>
                                        <span class="text-sm font-medium text-foreground">
                                            -
                                        </span>
                                        <span class="text-sm font-medium text-foreground">
                                            {{ formulario.maxcupo || 'N/A' }}
                                        </span>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>

                    <!-- Mensaje si no hay formularios -->
                    <div v-if="props.cupoOptions.length === 0"
                        class="p-3 bg-background border border-muted border-t-0 rounded-b-md">
                        <span class="text-sm text-muted-foreground text-center block">
                            No hay cupos disponibles
                        </span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal de reglas de cupo -->
        <QuotaRulesDialog 
            :is-open="showQuotaRulesDialog"
            @update:is-open="showQuotaRulesDialog = $event"
            @consult-quota="handleConsultQuota"
            @create-rule="handleCreateRule"
        />

        <!-- Modal para editar overSlot -->
        <EditOverSlotDialog 
            v-model:open="showEditOverSlotDialog"
            :current-over-slot="props.overSlot || 0"
            :day-id="props.dayId || 1"
            @save="handleUpdateOverSlot"
        />
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { Card, CardContent } from "@/components/ui/card";
import { Icon } from '@iconify/vue'
import { vAutoAnimate } from "@formkit/auto-animate/vue";
import { Switch } from "@/components/ui/switch";
import QuotaRulesDialog from "./QuotaRulesDialog.vue";
import EditOverSlotDialog from "./EditOverSlotDialog.vue";


interface Formulario {
    id: number;
    description: string;
    enable: boolean;
    horario?: string;
    maxcupo?: string;
    currentcupo?: string;
}

interface Props {
    modelValue: number[] | number;
    label?: string;
    placeholder?: string;
    cupoOptions: readonly Formulario[];
    autoOpen?: boolean;
    multiple?: boolean;
    onToggleEnable?: (id: number) => Promise<void>;
    overSlot?: number;
    dayId?: number;
}

const props = withDefaults(defineProps<Props>(), {
    placeholder: "Seleccionar formularios...",
    autoOpen: false,
    multiple: true,
});

const emit = defineEmits<{
    "update:modelValue": [value: number[] | number];
    "update-cupo": [cupo: Formulario];
    "new-cupo": [cupo: Formulario];
    "delete-cupo": [cupo: Formulario];
    "add-quota-rules": [];
    "consult-quota": [];
    "create-rule": [];
    "update-over-slot": [payload: { dayId: number; overSlot: number }];
}>();


const showOptions = ref(props.autoOpen);
const showQuotaRulesDialog = ref(false);
const showEditOverSlotDialog = ref(false);

// Watcher para actualizar showOptions cuando cambie autoOpen
watch(
    () => props.autoOpen,
    (newValue: boolean) => {
        showOptions.value = newValue;
    }
);

const toggleOptions = () => {
    showOptions.value = !showOptions.value;
};

const handleToggleEnable = async (id: number) => {
    if (props.onToggleEnable) {
        try {
            await props.onToggleEnable(id);
        } catch (error) {
            console.error("Error al cambiar el estado del formulario:", error);
        }
    }
};

const openQuotaRulesDialog = () => {
    showQuotaRulesDialog.value = true;
};

const handleConsultQuota = () => {
    emit('consult-quota');
};

const handleCreateRule = () => {
    emit('create-rule');
};

const openAddDialog = () => {
    emit('add-quota-rules');
};

const openEditOverSlotDialog = () => {
    showEditOverSlotDialog.value = true;
};

const handleUpdateOverSlot = async (payload: { dayId: number; overSlot: number }) => {
    emit('update-over-slot', payload);
};
</script>
