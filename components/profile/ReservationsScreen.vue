<template>
  <div class="p-4 space-y-4">
    <div class="space-y-4">
      <div class="space-y-2">
        <h3 class="text-sm font-medium mb-1">Gestionar Instituciones Educativas</h3>
        <!-- Selector de instituciones -->
        <div>
          <div
            class="py-3 px-4 bg-secondary/40 cursor-pointer hover:bg-secondary/80 transition-colors mb-0"
            :class="showInstitutionSelector ? 'rounded-t-md' : 'rounded-full'"
            @click="toggleInstitutionSelector"
          >
            <div class="flex items-center justify-between">
              <span class="text-sm font-semibold">{{ institutionHeaderText }}</span>
              <Icon v-if="showInstitutionSelector" icon="mdi:chevron-down-up" />
              <Icon v-else icon="mdi:chevron-up-down" />
            </div>
          </div>
          <div ref="institutionSelector" class="mt-0 space-y-0">
            <!-- Botón para agregar nueva institución -->
            <div
              v-if="showInstitutionSelector"
              class="p-3 bg-background border border-muted cursor-pointer hover:bg-muted/50 transition-colors rounded-b-md"
            >
              <AddInstitutionDialog @add-institutions="addInstitution">
                <template #trigger>
                  <div
                    class="bg-primary/5 flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors -mx-3 -my-3 px-3 py-3 rounded-md"
                  >
                    <span class="text-sm text-primary"> Agregar nueva institución </span>
                    <Icon icon="gridicons:add" class="w-4 h-4 text-primary" />
                  </div>
                </template>
              </AddInstitutionDialog>
            </div>
            <!-- Indicador de carga -->
            <div v-if="showInstitutionSelector && loading" class="px-4 py-3 text-center">
              <div class="flex items-center justify-center space-x-2">
                <div
                  class="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"
                ></div>
                <span class="text-sm text-muted-foreground"
                  >Cargando instituciones...</span
                >
              </div>
            </div>

            <!-- Lista de instituciones -->
            <div
              v-else-if="showInstitutionSelector && visitorInstitutions.length === 0"
              class="px-4 py-3 text-center"
            >
              <span class="text-sm text-muted-foreground"
                >No hay instituciones disponibles</span
              >
            </div>

            <div
              v-else-if="showInstitutionSelector"
              v-for="(inst, index) in visitorInstitutions"
              :key="getOptionKey(inst.institutionName)"
              :class="[
                'px-4 py-2 cursor-pointer border-t-1 border-secondary transition-colors',
                index % 2 === 0
                  ? 'bg-secondary/20 hover:bg-secondary/40'
                  : 'bg-secondary/10 hover:bg-secondary/40',
              ]"
            >
              <div class="flex items-center justify-between">
                <span class="text-sm text-muted-foreground">
                  {{ inst.institutionName }}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  class="h-5 w-5 text-muted-foreground hover:text-foreground ml-2"
                  :disabled="deletingInstitutionId === inst.id"
                  @click.stop="removeInstitution(inst)"
                >
                  <Icon
                    v-if="deletingInstitutionId === inst.id"
                    icon="lucide:loader-circle"
                    class="w-4 h-4 animate-spin"
                  />
                  <Icon v-else icon="ic:baseline-delete" class="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="space-y-2">
        <h3 class="text-sm font-medium mb-1">Gestionar Empresas</h3>
        <!-- Selector de empresas -->
        <ClientOnly>
          <div>
            <div
              class="py-3 px-4 bg-secondary/40 cursor-pointer hover:bg-muted/80 transition-colors mb-0"
              :class="showCompanySelector ? 'rounded-t-md' : 'rounded-full'"
              @click="toggleCompanySelector"
            >
              <div class="flex items-center justify-between">
                <!-- <span class="text-sm text-muted-foreground">{{ selectedCompany || 'Selecciona una empresa' }}</span> -->
                <span class="text-sm font-semibold">{{ companyHeaderText }}</span>
                <Icon v-if="showCompanySelector" icon="mdi:chevron-down-up" />
                <Icon v-else icon="mdi:chevron-up-down" />
              </div>
            </div>
            <div ref="companySelector" class="mt-0 space-y-0">
              <!-- Botón para agregar nueva empresa -->
              <div
                v-if="showCompanySelector"
                class="p-3 bg-background border border-muted cursor-pointer hover:bg-muted/50 transition-colors rounded-b-md"
              >
                <Dialog v-model:open="showAddCompanyDialog">
                  <DialogTrigger as-child>
                    <div
                      class="bg-primary/5 flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors -mx-3 -my-3 px-3 py-3 rounded-md"
                    >
                      <span class="text-sm text-primary"> Agregar nueva empresa </span>
                      <Icon icon="gridicons:add" class="w-4 h-4 text-primary" />
                    </div>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle class="text-start text-xl">
                        Gestionar empresas
                      </DialogTitle>
                    </DialogHeader>
                    <form @submit.prevent="submitCompanyForm" class="space-y-4 py-2">
                      <FormField name="name">
                        <FormItem>
                          <FormLabel>Nombre de la empresa</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="Ej: Empresa S.A. de C.V."
                              v-model="companyForm.name"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      </FormField>

                      <FormField name="sector">
                        <FormItem>
                          <FormLabel>Sector</FormLabel>
                          <FormControl>
                            <OptionListField
                              v-model="companyForm.sector"
                              label=""
                              :options="sectorOptions"
                              :placeholder="
                                catalogsLoading
                                  ? 'Cargando sectores...'
                                  : 'Seleccionar sector'
                              "
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      </FormField>

                      <FormField name="postalCode">
                        <FormItem>
                          <FormLabel>Código Postal</FormLabel>
                          <FormControl>
                            <OptionListField
                              v-model="companyForm.postalCode"
                              label=""
                              :options="postalCodeOptions"
                              placeholder="Seleccionar código postal"
                              searchable
                              search-placeholder="Buscar código postal..."
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      </FormField>

                      <DialogFooter class="flex flex-col sm:flex-row gap-3 pt-4">
                        <DialogClose as-child class="w-full sm:w-auto">
                          <Button variant="outline" class="w-full h-11 text-base">
                            Cancelar
                          </Button>
                        </DialogClose>
                        <Button
                          type="submit"
                          class="w-full sm:w-auto h-11 text-base font-medium"
                          :disabled="companyFormLoading"
                        >
                          {{
                            companyFormLoading ? "Creando empresa..." : "Agregar empresa"
                          }}
                        </Button>
                      </DialogFooter>
                      <div v-if="companyFormError" class="text-sm text-destructive mt-2">
                        {{ companyFormError }}
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <!-- Indicador de carga -->
              <div v-if="showCompanySelector && loading" class="px-4 py-3 text-center">
                <div class="flex items-center justify-center space-x-2">
                  <div
                    class="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"
                  ></div>
                  <span class="text-sm text-muted-foreground">Cargando empresas...</span>
                </div>
              </div>

              <!-- Lista de empresas -->
              <div
                v-else-if="showCompanySelector && companies.length === 0"
                class="px-4 py-3 text-center"
              >
                <span class="text-sm text-muted-foreground"
                  >No hay empresas disponibles</span
                >
              </div>

              <div
                v-else-if="showCompanySelector"
                v-for="(comp, index) in companies"
                :key="`company-${comp.id}-${companyListUpdateTrigger}`"
                :class="[
                  'px-4 py-2 cursor-pointer border-t-1 border-secondary transition-colors',
                  index % 2 === 0
                    ? 'bg-secondary/20 hover:bg-secondary/40'
                    : 'bg-secondary/10 hover:bg-secondary/40',
                ]"
              >
                <div
                  class="flex items-center justify-between"
                  @click="selectCompany(comp)"
                >
                  <span class="text-sm text-muted-foreground">
                    {{ comp.companyName }}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    class="h-5 w-5 text-muted-foreground hover:text-foreground ml-2"
                    :disabled="deletingCompanyId === comp.id"
                    @click.stop="removeCompany(comp)"
                  >
                    <Icon
                      v-if="deletingCompanyId === comp.id"
                      icon="lucide:loader-circle"
                      class="w-4 h-4 animate-spin"
                    />
                    <Icon v-else icon="ic:baseline-delete" class="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </ClientOnly>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from "vue";

import { Icon } from "@iconify/vue";
import AddInstitutionDialog from "./AddInstitutionDialog.vue";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import OptionListField from "@/components/common/OptionListField.vue";
import { useApiVisitor } from "@/lib/api/composables/visitor";
import { useAuth } from "@/lib/api/composables/auth";
import { useToast } from "@/composables/ui/useToast";
import { useCatalog } from "@/composables/catalog/useCatalog";
import { usePostalCodes } from "@/composables/catalog/usePostalCodes";

// const documents = ref<Document[]>([])

const institutions = ref<string[]>([]);
const selectedInstitution = ref("");
const showInstitutionSelector = ref(false);
const institutionSelector = ref();
const deletingInstitutionId = ref<number | null>(null);

const toggleInstitutionSelector = async () => {
  showInstitutionSelector.value = !showInstitutionSelector.value;

  // Si se está abriendo el selector, cargar las instituciones
  if (showInstitutionSelector.value) {
    try {
      await refreshInstitutions();
    } catch (error) {
      showError(
        "Error al cargar instituciones",
        "No se pudieron cargar las instituciones. Por favor, intenta nuevamente."
      );
    }
  }
};

// Función para obtener la clave única de un option
const getOptionKey = (option: string): string => {
  return option;
};

const addInstitution = (institutionsList: string[]) => {
  // El evento add-institutions emite un array, pero solo necesitamos el primer elemento
  // ya que este componente maneja una sola institución a la vez
  const name = institutionsList[0];
  if (name && !institutions.value.includes(name)) {
    institutions.value.push(name);
    selectedInstitution.value = name;
  }
  showInstitutionSelector.value = false;
};

const removeInstitution = async (inst: any) => {
  if (!inst) return;

  // Prevenir doble clic - verificar si ya se está eliminando
  if (deletingInstitutionId.value === inst.id) {
    console.log("⚠️ Eliminación ya en progreso para institución:", inst.id);
    return;
  }

  try {
    deletingInstitutionId.value = inst.id;

    // Eliminar de la API
    await deleteVisitorInstitution({ id: inst.id });

    // Actualizar la lista local inmediatamente para evitar parpadeo
    const institutionIndex = visitorInstitutions.value.findIndex((i) => i.id === inst.id);
    if (institutionIndex !== -1) {
      visitorInstitutions.value.splice(institutionIndex, 1);
    }

    // Limpiar selección si era la institución seleccionada
    if (selectedInstitution.value === (inst.institutionName || "")) {
      selectedInstitution.value = "";
    }

    // Recargar desde la API en segundo plano para sincronizar
    setTimeout(async () => {
      try {
        await refreshInstitutions();
      } catch (error) {
        console.error("Error al sincronizar instituciones:", error);
      }
    }, 100);

    showSuccess(
      "Institución eliminada",
      `La institución "${inst.institutionName}" ha sido eliminada exitosamente`
    );
  } catch (e) {
    console.error("Error eliminando institución:", e);
    showError(
      "Error al eliminar institución",
      "No se pudo eliminar la institución. Por favor, intenta nuevamente."
    );
  } finally {
    deletingInstitutionId.value = null;
  }
};

const {
  getVisitorCompanies,
  visitorCompanies,
  deleteVisitorCompany,
  createVisitorCompany,
  getVisitorInstitutions,
  visitorInstitutions,
  deleteVisitorInstitution,
  loading,
} = useApiVisitor();
const { showSuccess, showError } = useToast();

const companies = computed(() => {
  companyListUpdateTrigger.value; // Forzar reactividad
  return visitorCompanies.value;
});

const truncateName = (name?: string, percentage: number = 0.8): string => {
  if (!name) return "";
  const eightyPercent = Math.ceil(name.length * percentage);
  return name.slice(0, eightyPercent) + (name.length > eightyPercent ? "..." : "");
};

const companyHeaderText = computed(() => {
  companyListUpdateTrigger.value; // Forzar reactividad
  const list = (companies.value || [])
    .map((c: any) => truncateName(c?.companyName ?? undefined))
    .filter(Boolean);
  const total = list.length;

  if (total === 0) return "Selecciona una empresa";
  if (total === 1) return list[0];
  if (total === 2) return `${list[0]}, ${list[1]}`;

  const remaining = total - 2;
  return `${truncateName(list[0], 0.5)}, ${truncateName(
    list[1],
    0.5
  )} y ${remaining} más`;
});

const institutionHeaderText = computed(() => {
  const list = (visitorInstitutions.value || [])
    .map((i: any) => i?.institutionName)
    .filter(Boolean) as string[];
  const total = list.length;
  if (total === 0) return "Selecciona una institución";
  if (total === 1) return list[0];
  if (total === 2) return `${list[0]}, ${list[1]}`;
  const remaining = total - 2;
  return `${truncateName(list[0], 0.5)}, ${truncateName(
    list[1],
    0.5
  )} y ${remaining} más`;
});

const selectedCompany = ref("");
const showCompanySelector = ref(false);
const companySelector = ref();
const companyListUpdateTrigger = ref(0);
const deletingCompanyId = ref<number | null>(null);

// Variables para el diálogo integrado
const showAddCompanyDialog = ref(false);
const companyForm = ref({
  name: "",
  sector: "",
  postalCode: "",
});
const companyFormLoading = ref(false);
const companyFormError = ref<string | null>(null);

// Composables para el formulario
const {
  catalogs,
  loading: catalogsLoading,
  error: catalogsError,
  fetchCatalogs,
} = useCatalog();

const { postalCodeOptions, fetchPostalCodes } = usePostalCodes();

const sectorOptions = ref<Array<{ value: string; label: string }>>([]);

// Función para cargar los tipos de industria
const loadIndustryTypes = async () => {
  try {
    await fetchCatalogs({ tableName: "IndustryType" });
    const industryCatalogs = catalogs.value.filter(
      (catalog) => catalog.tableName === "IndustryType" && catalog.enable
    );
    sectorOptions.value = industryCatalogs.map((catalog) => ({
      value: catalog.id.toString(),
      label: catalog.description || catalog.value,
    }));
  } catch (error) {
    console.error("Error cargando tipos de industria:", error);
    sectorOptions.value = [
      { value: "1", label: "Tecnología" },
      { value: "2", label: "Salud" },
      { value: "3", label: "Educación" },
      { value: "4", label: "Finanzas" },
      { value: "5", label: "Retail" },
      { value: "6", label: "Manufactura" },
      { value: "7", label: "Servicios" },
      { value: "8", label: "Consultoría" },
      { value: "9", label: "Otro" },
    ];
  }
};

// Función para enviar el formulario
const submitCompanyForm = async () => {
  if (
    !companyForm.value.name ||
    !companyForm.value.postalCode ||
    !companyForm.value.sector
  ) {
    companyFormError.value = "Completa todos los campos.";
    return;
  }

  const industryTypeId = parseInt(companyForm.value.sector);
  const postalCodeId = parseInt(companyForm.value.postalCode);

  if (isNaN(industryTypeId) || isNaN(postalCodeId)) {
    companyFormError.value = "Selecciona opciones válidas de sector y código postal.";
    return;
  }

  companyFormLoading.value = true;
  companyFormError.value = null;

  try {
    const { user } = useAuth();
    const requestData = {
      visitorId: user.value?.userId || 1,
      companyName: companyForm.value.name,
      industryTypeId: industryTypeId,
      postalCodeId: postalCodeId,
    };

    await createVisitorCompany(requestData);

    // Guardar el nombre antes de limpiar
    const companyName = companyForm.value.name;

    // Actualizar la lista directamente
    selectedCompany.value = companyName;
    showCompanySelector.value = true;

    await refreshCompanies();
    companyListUpdateTrigger.value++;
    await nextTick();

    // Limpiar el formulario
    companyForm.value = {
      name: "",
      sector: "",
      postalCode: "",
    };

    showAddCompanyDialog.value = false;

    showSuccess(
      "Empresa agregada",
      `La empresa "${companyName}" ha sido agregada a tu lista`
    );
  } catch (error: any) {
    console.error("Error creando empresa:", error);
    companyFormError.value = error?.message || "No se pudo crear la empresa.";
  } finally {
    companyFormLoading.value = false;
  }
};

const toggleCompanySelector = async () => {
  showCompanySelector.value = !showCompanySelector.value;

  // Si se está abriendo el selector, cargar las empresas
  if (showCompanySelector.value) {
    try {
      await refreshCompanies();
    } catch (error) {
      showError(
        "Error al cargar empresas",
        "No se pudieron cargar las empresas. Por favor, intenta nuevamente."
      );
    }
  }
};

const selectCompany = (comp: any) => {
  selectedCompany.value = comp?.companyName || "";
  showCompanySelector.value = false;
};

const onCompanyCreatedSuccess = async (payload: any) => {
  try {
    console.log("🎉 onCompanyCreatedSuccess ejecutándose con payload:", payload);

    selectedCompany.value = payload?.name || "";
    showCompanySelector.value = true;

    console.log("🔄 Llamando a refreshCompanies...");
    await refreshCompanies();
    console.log("📊 Empresas después de refresh:", companies.value?.length || 0);

    companyListUpdateTrigger.value++;
    console.log("🔧 Trigger incrementado a:", companyListUpdateTrigger.value);

    await nextTick(); // Forzar actualización del DOM
    console.log("📊 Empresas después de nextTick:", companies.value?.length || 0);

    showAddCompanyDialog.value = false;

    showSuccess(
      "Empresa agregada",
      `La empresa "${payload.name}" ha sido agregada a tu lista`
    );
  } catch (error) {
    console.error("Error al crear empresa:", error);
    showError(
      "Error al agregar empresa",
      "No se pudo agregar la empresa. Por favor, intenta nuevamente."
    );
  }
};

const removeCompany = async (company: any) => {
  if (!company) return;

  // Prevenir doble clic - verificar si ya se está eliminando
  if (deletingCompanyId.value === company.id) {
    console.log("⚠️ Eliminación ya en progreso para empresa:", company.id);
    return;
  }

  try {
    deletingCompanyId.value = company.id;

    // Eliminar de la API
    await deleteVisitorCompany({ id: company.id });

    // Actualizar la lista local inmediatamente para evitar parpadeo
    const companyIndex = companies.value.findIndex((c) => c.id === company.id);
    if (companyIndex !== -1) {
      companies.value.splice(companyIndex, 1);
    }

    // Limpiar selección si era la empresa seleccionada
    if (selectedCompany.value === (company.companyName || "")) {
      selectedCompany.value = "";
    }

    // Incrementar trigger para forzar reactividad
    companyListUpdateTrigger.value++;

    // Recargar desde la API en segundo plano para sincronizar
    setTimeout(async () => {
      try {
        await refreshCompanies();
      } catch (error) {
        console.error("Error al sincronizar lista:", error);
      }
    }, 100);

    showSuccess(
      "Empresa eliminada",
      `La empresa "${company.companyName}" ha sido eliminada exitosamente`
    );
  } catch (e) {
    console.error("Error eliminando empresa:", e);
    showError(
      "Error al eliminar empresa",
      "No se pudo eliminar la empresa. Por favor, intenta nuevamente."
    );
  } finally {
    deletingCompanyId.value = null;
  }
};

// const updateDocumentStatus = (index: number, checked: boolean) => {
//   documents.value[index].checked = checked
// }

const refreshCompanies = async () => {
  try {
    const { user } = useAuth();
    await getVisitorCompanies({ visitorId: user.value?.userId });
  } catch (error) {
    console.error("Error al cargar empresas:", error);
  }
};

const refreshInstitutions = async () => {
  const { user } = useAuth();
  await getVisitorInstitutions({ visitorId: user.value?.userId });
  const list = (visitorInstitutions.value || [])
    .map((i: any) => i?.institutionName)
    .filter(Boolean) as string[];
  institutions.value = list;
};

onMounted(async () => {
  await Promise.all([
    refreshCompanies(),
    refreshInstitutions(),
    loadIndustryTypes(),
    fetchPostalCodes(),
  ]);
});
</script>
