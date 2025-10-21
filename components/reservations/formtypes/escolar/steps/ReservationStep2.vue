<template>
  <form @submit.prevent="onSubmit" class="space-y-4">
    <!-- Contenido específico para Reservación General -->
    <div class="space-y-4">
      <div>
        <h3 class="text-2xl text-[#3C3C3B] font-semibold">¡Enriquece tu visita!</h3>
        <div class="text-base text-[#3C3C3B] font-medium mt-2">
          Cada parada es una oportunidad para aprender e inspirar. Con el apoyo del Centro de Atencón Educativa (CAE), obtén sugerencias de exhibiciones y recursos alineados con la currícula escolar y tus temas de interés.
        </div>  
      </div>

      <div class="space-y-4">

        <div v-show="values.preescolar?.length > 0" class="bg-secondary/10 rounded-3xl mt-4 px-7 py-5">
          <span class="text-lg text-[#3C3C3B] font-semibold">Preescolar</span>
          <InfoAlert 
            :message-class="'text-[#3C3C3B] font-normal'" 
            message-size="text-sm" 
            message="Ahorraste un paso, ya tenemos listas las recomendaciones ideales para este nivel educativo. Podrás visualizarlas al terminar tu registro."
            class="mt-2"
          />
        </div>

        <!-- Dropdown solo para Primaria -->
        <DropdownContent v-show="values.primaria?.length > 0" :show-options="showPrimaria" @toggle-options-from-child="togglePrimariaDropdown"
          :dropdowntitleclass="['text-sm font-medium mb-2']"
          :dropdownplaceholderclass="['bg-secondary/10 hover:bg-secondary/20']"
          :dropdowncontentclass="['p-3 bg-secondary/10 hover:bg-secondary/20']" class="mb-3">
          <template #dropdownplaceholder>
            <span class="text-lg text-[#3C3C3B] font-semibold">Primaria</span>
          </template>

          <template #dropdowncontent>
            <!-- Dropdown para grados de Primaria -->
            <div v-show="values.primaria && values.primaria?.length > 0">
              <div v-for="primariaGrado in primariaCatalog" :key="primariaGrado?.id">
                <DropdownContent v-show="values?.primaria.find(primariaElemento => primariaElemento?.academicLevelId === primariaGrado.id)" :show-options="showPrimariaDynamic[primariaGrado?.id] || false" @toggle-options-from-child="togglePrimariaDynamicDropdown(primariaGrado?.id)"
                  :dropdowntitleclass="['text-sm font-medium mb-2']"
                  :dropdownplaceholderclass="['bg-white hover:bg-white/10']"
                  :dropdowncontentclass="['p-3 bg-white hover:bg-white/10']" class="mb-3">
                  <template #dropdownplaceholder>
                    <span class="text-lg text-[#3C3C3B] font-semibold">{{ primariaGrado?.label }}</span>
                  </template>
                
                  <template #dropdowncontent>
                    <div v-if="values?.primaria.findIndex(primariaElemento => primariaElemento?.academicLevelId === primariaGrado.id) > -1" class="bg-white space-y-0">
                      <FormField v-slot="{ componentField }" :name="`primaria[${values?.primaria.findIndex(primariaElemento => primariaElemento?.academicLevelId === primariaGrado.id)}].learningAreaId`" :validate-on-input="false" :validate-on-blur="true" :validate-on-change="false">
                        <FormItem v-auto-animate>
                          <FormLabel class="text-base text-[#3C3C3B] font-medium">Campo formativo</FormLabel>
                          <FormControl>
                            <OptionListField :model-value="componentField.modelValue" :options="learningAreas"
                              placeholder="Por favor, selecciona una opción" label="" @update:model-value="(value) => {
                                console.log('🔄 OptionListField emitió:', value, typeof value)
                                componentField.onChange(value) }" placeholder-font-size="text-base" placeholder-class="placeholder:font-semibold font-medium" options-content-font-size="text-base" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      </FormField>
                      <FormField v-slot="{ componentField }" :name="`primaria[${values?.primaria.findIndex(primariaElemento => primariaElemento?.academicLevelId === primariaGrado.id)}].coreAxesId`" :validate-on-input="false" :validate-on-blur="true" :validate-on-change="false">
                        <FormItem v-auto-animate class="mt-4">
                          <FormLabel class="text-base text-[#3C3C3B] font-medium">Ejes articuladores</FormLabel>
                          <FormControl>
                            <OptionListField :model-value="componentField.modelValue" :options="coreAxes"
                              placeholder="Por favor, selecciona una o más opciones" label="" @update:model-value="(value) => {
                                console.log('🔄 OptionListField emitió:', value, typeof value)
                                componentField.onChange(value) }" placeholder-font-size="text-base" placeholder-class="placeholder:font-semibold font-medium" options-content-font-size="text-base" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      </FormField>
                      <InfoAlert 
                        :message-class="'text-[#3C3C3B] font-normal'" 
                        message-size="text-sm" 
                        :message="`El número que se muestra corresponde a la cantidad de exhibiciones relacionadas con dicho campo formativo y eje articulador.

                        Recuerda que el resultado final será filtrado para evitar exhibiciones duplicadas.`"
                        class="mt-2"
                      />
                    </div>
                  </template>
                </DropdownContent>
              </div>
            </div>
          </template>
        </DropdownContent>

        <!-- Dropdown solo para Secundaria -->
        <DropdownContent v-show="values.secundaria?.length > 0" :show-options="showSecundaria" @toggle-options-from-child="toggleSecundariaDropdown"
          :dropdowntitleclass="['text-sm font-medium mb-2']"
          :dropdownplaceholderclass="['bg-secondary/10 hover:bg-secondary/20']"
          :dropdowncontentclass="['p-3 bg-secondary/10 hover:bg-secondary/20']" class="mb-3">
          <template #dropdownplaceholder>
            <span class="text-lg text-[#3C3C3B] font-semibold">Secundaria</span>
          </template>

          <template #dropdowncontent>
            <!-- Dropdown para grados de Secundaria -->
            <div v-show="values.secundaria && values.secundaria?.length > 0">
              <div v-for="secundariaGrado in secundariaCatalog" :key="secundariaGrado?.id">
                <DropdownContent v-show="values?.secundaria.find(secundariaElemento => secundariaElemento?.academicLevelId === secundariaGrado.id)" :show-options="showSecundariaDynamic[secundariaGrado?.id] || false" @toggle-options-from-child="toggleSecundariaDynamicDropdown(secundariaGrado?.id)"
                  :dropdowntitleclass="['text-sm font-medium mb-2']"
                  :dropdownplaceholderclass="['bg-white hover:bg-white/10']"
                  :dropdowncontentclass="['p-3 bg-white hover:bg-white/10']" class="mb-3">
                  <template #dropdownplaceholder>
                    <span class="text-lg text-[#3C3C3B] font-semibold">{{ secundariaGrado?.label }}</span>
                  </template>
                
                  <template #dropdowncontent>
                    <div v-if="values?.secundaria.findIndex(secundariaElemento => secundariaElemento?.academicLevelId === secundariaGrado.id) > -1" class="bg-white space-y-0 pb-2">
                      <FormField v-slot="{ componentField }" :name="`secundaria[${values?.secundaria.findIndex(secundariaElemento => secundariaElemento?.academicLevelId === secundariaGrado.id)}].schoolSubjectId`" :validate-on-input="false" :validate-on-blur="true" :validate-on-change="false">
                        <FormItem v-auto-animate>
                          <FormLabel class="text-base text-[#3C3C3B] font-medium">Materias</FormLabel>
                          <FormControl>
                            <OptionListField :model-value="componentField.modelValue" :options="scoolSubjects"
                              placeholder="Por favor, selecciona una o más opciones" label="" @update:model-value="(value) => {
                                console.log('🔄 OptionListField emitió:', value, typeof value)
                                componentField.onChange(value) }" placeholder-font-size="text-base" placeholder-class="placeholder:font-semibold font-medium" options-content-font-size="text-base" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      </FormField>
                      <FormField v-slot="{ componentField }" :name="`secundaria[${values?.secundaria.findIndex(secundariaElemento => secundariaElemento?.academicLevelId === secundariaGrado.id)}].coreAxesId`" :validate-on-input="false" :validate-on-blur="true" :validate-on-change="false">
                        <FormItem v-auto-animate class="mt-4">
                          <FormLabel class="text-base text-[#3C3C3B] font-medium">Ejes articuladores</FormLabel>
                          <FormControl>
                            <OptionListField :model-value="componentField.modelValue" :options="coreAxes"
                              placeholder="Por favor, selecciona una o más opciones" label="" @update:model-value="(value) => {
                                console.log('🔄 OptionListField emitió:', value, typeof value)
                                componentField.onChange(value) }" placeholder-font-size="text-base" placeholder-class="placeholder:font-semibold font-medium" options-content-font-size="text-base" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      </FormField>
                    </div>
                  </template>
                </DropdownContent>
              </div>
            </div>
          </template>
        </DropdownContent>

        <!-- Dropdown solo para Media Superior -->
        <DropdownContent v-show="values.mediaSuperior?.length > 0" :show-options="showMediaSuperior" @toggle-options-from-child="toggleMediaSuperiorDropdown"
          :dropdowntitleclass="['text-sm font-medium mb-2']"
          :dropdownplaceholderclass="['bg-secondary/10 hover:bg-secondary/20']"
          :dropdowncontentclass="['p-3 bg-secondary/10 hover:bg-secondary/20']" class="mb-3">
          <template #dropdownplaceholder>
            <span class="text-lg text-[#3C3C3B] font-semibold">Media Superior</span>
          </template>

          <template #dropdowncontent>
            <!-- Dropdown para grados de Media Superior -->
            <div v-show="values.mediaSuperior && values.mediaSuperior?.length > 0">
              <div v-for="mediaSuperiorGrado in mediaSuperiorCatalog" :key="mediaSuperiorGrado?.id">
                <DropdownContent v-show="values?.mediaSuperior.find(mediaSuperiorElemento => mediaSuperiorElemento?.academicLevelId === mediaSuperiorGrado.id)" :show-options="showMediaSuperiorDynamic[mediaSuperiorGrado?.id] || false" @toggle-options-from-child="toggleMediaSuperiorDynamicDropdown(mediaSuperiorGrado?.id)"
                  :dropdowntitleclass="['text-sm font-medium mb-2']"
                  :dropdownplaceholderclass="['bg-white hover:bg-white/10']"
                  :dropdowncontentclass="['p-3 bg-white hover:bg-white/10']" class="mb-3">
                  <template #dropdownplaceholder>
                    <span class="text-lg text-[#3C3C3B] font-semibold">{{ mediaSuperiorGrado?.label }}</span>
                  </template>
                
                  <template #dropdowncontent>
                    <div v-if="values?.mediaSuperior.findIndex(mediaSuperiorElemento => mediaSuperiorElemento?.academicLevelId === mediaSuperiorGrado.id) > -1" class="bg-white space-y-0 pb-2">
                      <FormField v-slot="{ componentField }" :name="`mediaSuperior[${values?.mediaSuperior.findIndex(mediaSuperiorElemento => mediaSuperiorElemento?.academicLevelId === mediaSuperiorGrado.id)}].economicConceptId`" :validate-on-input="false" :validate-on-blur="true" :validate-on-change="false">
                        <FormItem v-auto-animate>
                          <FormLabel class="text-base text-[#3C3C3B] font-medium">Conceptos económicos principales</FormLabel>
                          <FormControl>
                            <OptionListField :model-value="componentField.modelValue" :options="interestTopics"
                              placeholder="Por favor, selecciona una de las siguientes opciones" label="" @update:model-value="(value) => {
                                console.log('🔄 OptionListField emitió:', value, typeof value)
                                componentField.onChange(value) }" placeholder-font-size="text-base" placeholder-class="placeholder:font-semibold font-medium" options-content-font-size="text-base" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      </FormField>
                      <FormField v-slot="{ componentField }" :name="`mediaSuperior[${values?.mediaSuperior.findIndex(mediaSuperiorElemento => mediaSuperiorElemento?.academicLevelId === mediaSuperiorGrado.id)}].economicConcepSecondaryId`" :validate-on-input="false" :validate-on-blur="true" :validate-on-change="false">
                        <FormItem v-auto-animate class="mt-4">
                          <FormLabel class="text-base text-[#3C3C3B] font-medium">Conceptos económicos secundarios</FormLabel>
                          <FormControl>
                            <OptionListField :model-value="componentField.modelValue" :options="interestTopics"
                              placeholder="Por favor, selecciona una de las siguientes opciones" label="" @update:model-value="(value) => {
                                console.log('🔄 OptionListField emitió:', value, typeof value)
                                componentField.onChange(value) }" placeholder-font-size="text-base" placeholder-class="placeholder:font-semibold font-medium" options-content-font-size="text-base" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      </FormField>
                      <FormField v-slot="{ componentField }" :name="`mediaSuperior[${values?.mediaSuperior.findIndex(mediaSuperiorElemento => mediaSuperiorElemento?.academicLevelId === mediaSuperiorGrado.id)}].schoolSubjectId`" :validate-on-input="false" :validate-on-blur="true" :validate-on-change="false">
                        <FormItem v-auto-animate class="mt-4">
                          <FormLabel class="text-base text-[#3C3C3B] font-medium">Materias</FormLabel>
                          <FormControl>
                            <OptionListField :model-value="componentField.modelValue" :options="scoolSubjects"
                              placeholder="Por favor, selecciona una o más opciones" label="" @update:model-value="(value) => {
                                console.log('🔄 OptionListField emitió:', value, typeof value)
                                componentField.onChange(value) }" placeholder-font-size="text-base" placeholder-class="placeholder:font-semibold font-medium" options-content-font-size="text-base" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      </FormField>
                    </div>
                  </template>
                </DropdownContent>
              </div>
            </div>
          </template>
        </DropdownContent>

        <!-- Dropdown solo para Superior -->
        <DropdownContent v-show="values.superior?.length > 0" :show-options="showSuperior" @toggle-options-from-child="toggleSuperiorDropdown"
          :dropdowntitleclass="['text-sm font-medium mb-2']"
          :dropdownplaceholderclass="['bg-secondary/10 hover:bg-secondary/20']"
          :dropdowncontentclass="['p-3 bg-secondary/10 hover:bg-secondary/20']" class="mb-3">
          <template #dropdownplaceholder>
            <span class="text-lg text-[#3C3C3B] font-semibold">Superior</span>
          </template>

          <template #dropdowncontent>
            <!-- Dropdown para grados de Superior -->
            <div v-show="values.superior && values.superior?.length > 0">
              <div v-for="superiorGrado in superiorCatalog" :key="superiorGrado?.id">
                <DropdownContent v-show="values?.superior.find(superiorElemento => superiorElemento?.academicLevelId === superiorGrado.id)" :show-options="showSuperiorDynamic[superiorGrado?.id] || false" @toggle-options-from-child="toggleSuperiorDynamicDropdown(superiorGrado?.id)"
                  :dropdowntitleclass="['text-sm font-medium mb-2']"
                  :dropdownplaceholderclass="['bg-white hover:bg-white/10']"
                  :dropdowncontentclass="['p-3 bg-white hover:bg-white/10']" class="mb-3">
                  <template #dropdownplaceholder>
                    <span class="text-lg text-[#3C3C3B] font-semibold">{{ superiorGrado?.label }}</span>
                  </template>
                
                  <template #dropdowncontent>
                    <div v-if="values?.superior.findIndex(superiorElemento => superiorElemento?.academicLevelId === superiorGrado.id) > -1" class="bg-white space-y-0 pb-2">
                      <FormField v-slot="{ componentField }" :name="`superior[${values?.superior.findIndex(superiorElemento => superiorElemento?.academicLevelId === superiorGrado.id)}].economicConceptId`" :validate-on-input="false" :validate-on-blur="true" :validate-on-change="false">
                        <FormItem v-auto-animate>
                          <FormLabel class="text-base text-[#3C3C3B] font-medium">Conceptos económicos principales</FormLabel>
                          <FormControl>
                            <OptionListField :model-value="componentField.modelValue" :options="interestTopics"
                              placeholder="Por favor, selecciona una de las siguientes opciones" label="" @update:model-value="(value) => {
                                console.log('🔄 OptionListField emitió:', value, typeof value)
                                componentField.onChange(value) }" placeholder-font-size="text-base" placeholder-class="placeholder:font-semibold font-medium" options-content-font-size="text-base" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      </FormField>
                      <FormField v-slot="{ componentField }" :name="`superior[${values?.superior.findIndex(superiorElemento => superiorElemento?.academicLevelId === superiorGrado.id)}].economicConcepSecondaryId`" :validate-on-input="false" :validate-on-blur="true" :validate-on-change="false">
                        <FormItem v-auto-animate class="mt-4">
                          <FormLabel class="text-base text-[#3C3C3B] font-medium">Conceptos económicos secundarios</FormLabel>
                          <FormControl>
                            <OptionListField :model-value="componentField.modelValue" :options="interestTopics"
                              placeholder="Por favor, selecciona una de las siguientes opciones" label="" @update:model-value="(value) => {
                                console.log('🔄 OptionListField emitió:', value, typeof value)
                                componentField.onChange(value) }" placeholder-font-size="text-base" placeholder-class="placeholder:font-semibold font-medium" options-content-font-size="text-base" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      </FormField>
                      <FormField v-slot="{ componentField }" :name="`superior[${values?.superior.findIndex(superiorElemento => superiorElemento?.academicLevelId === superiorGrado.id)}].schoolSubjectId`" :validate-on-input="false" :validate-on-blur="true" :validate-on-change="false">
                        <FormItem v-auto-animate class="mt-4">
                          <FormLabel class="text-base text-[#3C3C3B] font-medium">Materias</FormLabel>
                          <FormControl>
                            <OptionListField :model-value="componentField.modelValue" :options="scoolSubjects"
                              placeholder="Por favor, selecciona una o más opciones" label="" @update:model-value="(value) => {
                                console.log('🔄 OptionListField emitió:', value, typeof value)
                                componentField.onChange(value) }" placeholder-font-size="text-base" placeholder-class="placeholder:font-semibold font-medium" options-content-font-size="text-base" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      </FormField>
                    </div>
                  </template>
                </DropdownContent>
              </div>
            </div>
          </template>
        </DropdownContent>

        <!-- Dropdown solo para Posgrado -->
        <DropdownContent v-show="values.posgrado?.length > 0" :show-options="showPosgrado" @toggle-options-from-child="togglePosgradoDropdown"
          :dropdowntitleclass="['text-sm font-medium mb-2']"
          :dropdownplaceholderclass="['bg-secondary/10 hover:bg-secondary/20']"
          :dropdowncontentclass="['p-3 bg-secondary/10 hover:bg-secondary/20']" class="mb-3">
          <template #dropdownplaceholder>
            <span class="text-lg text-[#3C3C3B] font-semibold">Posgrado</span>
          </template>

          <template #dropdowncontent>
            <!-- Dropdown para grados de Posgrado -->
            <div v-show="values.posgrado && values.posgrado?.length > 0">
              <div v-for="posgradoGrado in posgradoCatalog" :key="posgradoGrado?.id">
                <DropdownContent v-show="values?.posgrado.find(posgradoElemento => posgradoElemento?.academicLevelId === posgradoGrado.id)" :show-options="showPosgradoDynamic[posgradoGrado?.id] || false" @toggle-options-from-child="togglePosgradoDynamicDropdown(posgradoGrado?.id)"
                  :dropdowntitleclass="['text-sm font-medium mb-2']"
                  :dropdownplaceholderclass="['bg-white hover:bg-white/10']"
                  :dropdowncontentclass="['p-3 bg-white hover:bg-white/10']" class="mb-3">
                  <template #dropdownplaceholder>
                    <span class="text-lg text-[#3C3C3B] font-semibold">{{ posgradoGrado?.label }}</span>
                  </template>
                
                  <template #dropdowncontent>
                    <div v-if="values?.posgrado.findIndex(posgradoElemento => posgradoElemento?.academicLevelId === posgradoGrado.id) > -1" class="bg-white space-y-0 pb-2">
                      <FormField v-slot="{ componentField }" :name="`posgrado[${values?.posgrado.findIndex(posgradoElemento => posgradoElemento?.academicLevelId === posgradoGrado.id)}].economicConceptId`" :validate-on-input="false" :validate-on-blur="true" :validate-on-change="false">
                        <FormItem v-auto-animate>
                          <FormLabel class="text-base text-[#3C3C3B] font-medium">Conceptos económicos principales</FormLabel>
                          <FormControl>
                            <OptionListField :model-value="componentField.modelValue" :options="interestTopics"
                              placeholder="Por favor, selecciona una de las siguientes opciones" label="" @update:model-value="(value) => {
                                console.log('🔄 OptionListField emitió:', value, typeof value)
                                componentField.onChange(value) }" placeholder-font-size="text-base" placeholder-class="placeholder:font-semibold font-medium" options-content-font-size="text-base" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      </FormField>
                      <FormField v-slot="{ componentField }" :name="`posgrado[${values?.posgrado.findIndex(posgradoElemento => posgradoElemento?.academicLevelId === posgradoGrado.id)}].economicConcepSecondaryId`" :validate-on-input="false" :validate-on-blur="true" :validate-on-change="false">
                        <FormItem v-auto-animate class="mt-4">
                          <FormLabel class="text-base text-[#3C3C3B] font-medium">Conceptos económicos secundarios</FormLabel>
                          <FormControl>
                            <OptionListField :model-value="componentField.modelValue" :options="interestTopics"
                              placeholder="Por favor, selecciona una de las siguientes opciones" label="" @update:model-value="(value) => {
                                console.log('🔄 OptionListField emitió:', value, typeof value)
                                componentField.onChange(value) }" placeholder-font-size="text-base" placeholder-class="placeholder:font-semibold font-medium" options-content-font-size="text-base" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      </FormField>
                      <FormField v-slot="{ componentField }" :name="`posgrado[${values?.posgrado.findIndex(posgradoElemento => posgradoElemento?.academicLevelId === posgradoGrado.id)}].schoolSubjectId`" :validate-on-input="false" :validate-on-blur="true" :validate-on-change="false">
                        <FormItem v-auto-animate class="mt-4">
                          <FormLabel class="text-base text-[#3C3C3B] font-medium">Materias</FormLabel>
                          <FormControl>
                            <OptionListField :model-value="componentField.modelValue" :options="scoolSubjects"
                              placeholder="Por favor, selecciona una o más opciones" label="" @update:model-value="(value) => {
                                console.log('🔄 OptionListField emitió:', value, typeof value)
                                componentField.onChange(value) }" placeholder-font-size="text-base" placeholder-class="placeholder:font-semibold font-medium" options-content-font-size="text-base" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      </FormField>
                    </div>
                  </template>
                </DropdownContent>
              </div>
            </div>
          </template>
        </DropdownContent>

        <Separator class="my-12 bg-[#B3B3B3] max-w-3/4 rounded-full mx-auto" />

        <div>
          <h1 class="text-2xl text-[#3C3C3B] font-semibold">Representante de grupo</h1>
          <div class="text-base text-[#3C3C3B] font-medium mt-2">
            Confirma tu participación como representante, o bien asigna esta función a otra persona. 
          </div>  
          <InfoAlert class="mt-3" :message-class="'text-[#3C3C3B] font-normal'" message-size="text-sm" title="Información" message="Ten en cuenta que quien asuma este rol deberá acudir a la visita y estar pendiente a las indicaciones del personal del MIDE para compartirlas con el resto del grupo. " />
          <Label class="text-base text-[#3C3C3B] font-medium mt-3 mb-1">¿La persona que reserva es la misma que se presentará el día de la visita?</Label>

          <div class="flex space-x-8">
            <div class="flex items-center space-x-2">
              <FormField v-slot="{ componentField, handleChange }" name="isReservationPersonAlsoResponsibleSi">
                <FormItem class="mb-1">
                  <FormControl class="py-0.5">
                    <div class="flex space-x-4 py-1">
                      <div class="flex items-center space-x-2 cursor-pointer">
                        <Label for="yes"
                          class="text-base text-[#3C3C3B] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                          Si
                        </Label>
                        <Checkbox id="yes" :class="'rounded-full border-2'" class="w-6 h-6 cursor-pointer" variant="secondary" :model-value="componentField.modelValue"
                          @update:model-value="(checked) => handleIsReservationPersonAlsoResponsibleSi(!!checked, handleChange)" />
                      </div>
                    </div>
                  </FormControl>
                </FormItem>
              </FormField>
            </div>
            <div class="flex items-center space-x-2">
              <FormField v-slot="{ componentField, handleChange }" name="isReservationPersonAlsoResponsibleNo">
                <FormItem class="mb-1">
                  <FormControl class="py-0.5">
                    <div class="flex space-x-4 py-1">
                      <div class="flex items-center space-x-2 cursor-pointer">
                        <Label for="no"
                          class="text-base text-[#3C3C3B] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                          No
                        </Label>
                        <Checkbox id="no" :class="'rounded-full border-2'" class="w-6 h-6 cursor-pointer" variant="secondary" :model-value="componentField.modelValue"
                          @update:model-value="(checked) => handleIsReservationPersonAlsoResponsibleNo(!!checked, handleChange)" />
                      </div>
                    </div>
                  </FormControl>
                </FormItem>
              </FormField>
            </div>
          </div>
          <!-- MANEJO MANUAL DE ERRORES EN CHECKBOXES isReservationPersonAlsoResponsibleSi Y isReservationPersonAlsoResponsibleNo -->
          <div v-if="errors.isReservationPersonAlsoResponsibleSi || errors.isReservationPersonAlsoResponsibleNo" class="text-sm text-[#DB0000] mt-2.5">
            {{ errors.isReservationPersonAlsoResponsibleSi || errors.isReservationPersonAlsoResponsibleNo }}
          </div>

          <!-- Si isReservationPersonAlsoResponsible en su isReservationPersonAlsoResponsibleSi e isReservationPersonAlsoResponsibleNo ambas estan unselect entonces no se muestran los siguientes campos del representante de la visita -->
          <div v-if="isAnyReservationPersonAlsoResponsibleSelectedOption">
            <FormField v-if="!hasReservationPersonAlsoResponsible" v-slot="{ componentField, handleChange }" name="isResponsibleNotAssigned">
              <FormItem>
                <FormItem class="mt-2.5 mb-1">
                  <FormControl class="py-0.5">
                    <div class="flex space-x-4 py-1">
                      <div class="flex items-center space-x-2 cursor-pointer">
                        <Checkbox id="notassigned" :class="'rounded-full border-2'" class="w-6 h-6 cursor-pointer" variant="secondary" :model-value="componentField.modelValue"
                          @update:model-value="(checked) => handleIsResponsibleNotAssigned(!!checked, handleChange)" />
                        <Label for="notassigned"
                          class="text-base text-[#3C3C3B] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                          Aún no asignado
                        </Label>
                      </div>
                    </div>
                  </FormControl>
                </FormItem>
              </FormItem>
            </FormField>

            <!-- Campos del representante - Se muestran si es "Sí" o "No", pero NO si es "Aún no asignado" -->
            <div v-if="!values.isResponsibleNotAssigned">
              <div class="space-y-2 mt-3">
                <FormField v-slot="{ componentField }" name="fullName">
                  <FormItem>
                    <FormLabel class="text-base text-[#3C3C3B] font-medium">Nombre completo del representante {{ values.isReservationPersonAlsoResponsible ? '(datos auto rellenados)' : '' }}</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="Nombre completo" :class="[{ 'cursor-text': !values.isReservationPersonAlsoResponsible }]" class="bg-muted border-0 placeholder:text-base placeholder:text-[#7D7D7D] placeholder:font-medium text-base text-[#3C3C3B] font-semibold truncate px-5" v-bind="componentField" :disabled="values.isReservationPersonAlsoResponsible"/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>
              </div>

              <div class="space-y-2 mt-3">
                <FormField v-slot="{ componentField }" name="email">
                  <FormItem>
                    <FormLabel class="text-base text-[#3C3C3B] font-medium">Correo electrónico del representante {{ values.isReservationPersonAlsoResponsible ? '(datos auto rellenados)' : '' }}</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="correo@correo.com" :class="[{ 'cursor-text': !values.isReservationPersonAlsoResponsible }]" class="bg-muted border-0 placeholder:text-base placeholder:text-[#7D7D7D] placeholder:font-medium text-base text-[#3C3C3B] font-semibold truncate px-5" v-bind="componentField" :disabled="values.isReservationPersonAlsoResponsible"/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>
              </div>

              <div class="space-y-2 mt-3">
                <FormField v-slot="{ componentField }" name="phone">
                  <FormItem>
                    <FormLabel class="text-base text-[#3C3C3B] font-medium">Teléfono del representante a 10 dígitos {{ values.isReservationPersonAlsoResponsible ? '(datos auto rellenados)' : '' }}</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="00 0000 - 0000" :class="[{ 'cursor-text': !values.isReservationPersonAlsoResponsible }]" class="bg-muted border-0 placeholder:text-base placeholder:text-[#7D7D7D] placeholder:font-medium text-base text-[#3C3C3B] font-semibold truncate px-5" v-bind="componentField" :disabled="values.isReservationPersonAlsoResponsible"/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>
              </div>
            </div>
          </div>
          <InfoAlert class="mt-5" :message-class="'text-[#3C3C3B] font-normal'" message-size="text-sm" title="Información" message="Te recomendamos mantener tus objetos personales bajo cuidado durante tu visita, ya que no podemos asumir responsabilidad por la pérdida o daño de los mismos. Agradecemos tu comprensión." />
        </div>

        <Separator class="my-12 bg-[#B3B3B3] max-w-3/4 rounded-full mx-auto" />


        <div v-show="hasDisabilityFromAPI" class="space-y-2">
          <h1 class="text-2xl text-[#3C3C3B] font-semibold">Información adicional asistentes</h1>
          <FormField v-slot="{ value, handleChange, validate }" name="specialAssistances">
            <FormItem>
              <FormLabel class="text-base text-[#3C3C3B] font-medium">¿Qué discapacidades identificaste entre las personas que te acompañarán a la visita?</FormLabel>
              <FormControl>
                <DisabilitySelector placeholder="Selecciona una o más opciones." :categories="disabilityCategories"
                  :model-value="value" @update:model-value="(newValue) => {
                    handleChange(newValue, true)
                    nextTick(() => {
                      setErrors({ specialAssistances: undefined })
                      validate()
                    })
                  }" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
        </div>

      </div>
    </div>

    <Button :disabled="isUpdating || !isValidForm" type="submit" variant="secondary" :class="[{ 'cursor-pointer': isValidForm }]" class="w-full text-lg font-medium mt-8 py-5">
      <div v-if="isUpdating" class="flex items-center justify-center">
        <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
          {{ isStepComplete(2) ? 'Guardando cambios...' : 'Guardando...' }}
      </div>
      <span v-else>Continuar</span>
    </Button>

  </form>
</template>

<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import * as z from "zod";
import { ref, watch, onMounted, computed, nextTick } from "vue";
import type { Ref, ComputedRef } from 'vue';
import { Separator } from "@/components/ui/separator";
import CheckboxListField from "@/components/common/CheckboxListField.vue";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from '@/components/ui/label'
import ReservationStepHeader from '@/components/reservations/ReservationStepHeader.vue'
import { Icon } from "@iconify/vue";
import DropdownContent from '@/components/common/DropdownContent.vue'
import { Checkbox } from "@/components/ui/checkbox";
import InfoAlert from "~/components/common/InfoAlert.vue";
import { Button } from '@/components/ui/button'
import OptionListField from "@/components/common/OptionListField.vue";
import DisabilitySelector from "@/components/reservations/formtypes/escolar/steps/components/DisabilitySelector.vue";
import { useReservationSchool } from "@/composables/reservations/useReservationSchool";
import { useReservationSchoolStore } from '@/stores/reservation-school'
import { useReservationStepStatusStore } from "@/stores/reservation-step-status";
import { useReservationStepLoader } from "@/composables/reservations/useReservationStepLoader";
import { useAuthStore } from '@/stores/auth'
import { useAuth } from "@/lib/api/composables/auth";
import { useCatalog } from "@/composables/catalog/useCatalog";
import { useMunicipality } from '@/composables/catalog/useMunicipality'

const props = defineProps({
  type: {
    type: String,
    required: true
  },
  data: {
    type: Object,
    required: true
  },
  reservationId: {
    type: Number,
    default: null
  },
  headerData: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['next', 'back', 'submit', 'update:generalData', 'navigate-to-step'])

// Store de reservaciones generales
const reservationGeneralStore = useReservationSchoolStore()

// Store de estado de pasos
const stepStatusStore = useReservationStepStatusStore();

// Composable para manejo de autenticación
const { user, isAuthenticated } = useAuth()
const authStore = useAuthStore()

// Composable para manejo de catálogos
const { catalogs, fetchCatalogs, fetchPublicCatalogs } = useCatalog();

// Composable para manejo de municipalidades
const { fetchMunicipalities, searchByMunicipality, municipalityOptions } = useMunicipality();

// Composable para reservaciones generales
const {
  store,
  currentReservationId,
  getAllReservationSchoolAcademicLevels,
  updateReservationSchoolsStep2,
  loadStep1,
  loadStep2,
  isUpdating,
  error: reservationError,
  isStep2Valid,
  currentReservation,
  checkReservationHasDisability
} = useReservationSchool()

// Composable para el estado de los pasos
const { isStepComplete } = useReservationStepLoader();

// Variable que controla si este componente se ha cargado en el hook onMounted. Util para cargar los nieveles academicos justo despues de obtenerlos con el props.header (esta carga no es lineal y debe usarse un watch)
const reservationStep2HasBeenMounted = ref(false)

// Variable reactiva para temas de interés
const interestTopics = ref([])

// Variable reactiva para materias
const scoolSubjects = ref([])

// Variable reactiva para campos formativos
const learningAreas = ref([])

// Variable reactiva para ejes articuladores
const coreAxes = ref([])

// Variable reactiva para necesidades especiales
const specialAssistances = ref([])

// Variable reactiva para categorías de discapacidades
const disabilityCategories = ref([])

// Variable reactiva para datos generales
const generalData = ref({})

// Bandera para controlar si se están cargando datos del header
const isLoadingHeaderData = ref(false);

// Variable reactiva para verificar si tiene personas con discapacidad desde el endpoint
const hasDisabilityFromAPI = ref(false);

// Los grados de preescolar que se cargarán desde el catálogo.ESTE DATO NO SE MANIPULA EN FORMULARIO DEBIDO A QUE EL SISTEMA AUTOMATICAMENTE MANIPULA LOS TALLERES Y MATERIALES A ESTE NIVEL ESCOLAR UNUCAMENTE
const preescolarCatalog = ref<Record<string, any>>([])

// Los grados de primaria que se cargarán desde el catálogo
const primariaCatalog = ref<Record<string, any>>([])

// Los grados de secundaria que se cargarán desde el catálogo
const secundariaCatalog = ref<Record<string, any>>([])

// Los grados de media superior que se cargarán desde el catálogo
const mediaSuperiorCatalog = ref<Record<string, any>>([])

// Los grados de superior que se cargarán desde el catálogo
const superiorCatalog = ref<Record<string, any>>([])

// Los grados de posgrado que se cargarán desde el catálogo
const posgradoCatalog = ref<Record<string, any>>([])

// Función para cargar grados preescolar
const loadPreescolarCatalog = async () => {
  try {
    const preescolarCatalogResponse = await getAllReservationSchoolAcademicLevels({ AcademicLevel: 'Preescolar' })
    const preescolar = preescolarCatalogResponse.filter(catalog => 
      catalog.level === 'Preescolar' && catalog.status === 'Activo'
    ).sort((a, b) => parseInt(a.grade, 10) - parseInt(b.grade, 10)) // Se ordena por grado, menor a mayor
    
    console.log('🔍 Niveles academicos cargados', preescolar)
    
    // Transformar el formato para que value sea el id numérico
    const transformedPreescolar = preescolar.map(obj => ({
      value: obj.id, // Usar el ID numérico como value
      label: obj.description, // Usar el campo 'description' del catálogo como label
      id: obj.id
    }))
    
    console.log('🔍 Niveles academicos transformados:', transformedPreescolar)
    preescolarCatalog.value = transformedPreescolar
  } catch (error) {
    console.error('❌ Error al cargar niveles academicos:', error)
    // En caso de error, mostrar opciones no disponibles
    preescolarCatalog.value = [
      { value: "no_disponible", label: "Opciones no disponibles" }
    ]
  }
}

// Función para cargar grados primaria
const loadPrimariaCatalog = async () => {
  try {
    const primariaCatalogResponse = await getAllReservationSchoolAcademicLevels({ AcademicLevel: 'Primaria' })
    const primaria = primariaCatalogResponse.filter(catalog => 
      catalog.level === 'Primaria' && catalog.status === 'Activo'
    ).sort((a, b) => parseInt(a.grade, 10) - parseInt(b.grade, 10)) // Se ordena por grado, menor a mayor
    
    console.log('🔍 Niveles academicos cargados', primaria)
    
    // Transformar el formato para que value sea el id numérico
    const transformedPrimaria = primaria.map(obj => ({
      value: obj.id, // Usar el ID numérico como value
      label: obj.description, // Usar el campo 'description' del catálogo como label
      id: obj.id
    }))
    
    console.log('🔍 Niveles academicos transformados:', transformedPrimaria)
    primariaCatalog.value = transformedPrimaria
  } catch (error) {
    console.error('❌ Error al cargar niveles academicos:', error)
    // En caso de error, mostrar opciones no disponibles
    primariaCatalog.value = [
      { value: "no_disponible", label: "Opciones no disponibles" }
    ]
  }
}

// Función para cargar grados secundaria
const loadSecundariaCatalog = async () => {
  try {
    const secundariaCatalogResponse = await getAllReservationSchoolAcademicLevels({ AcademicLevel: 'Secundaria' })
    const secundaria = secundariaCatalogResponse.filter(catalog => 
      catalog.level === 'Secundaria' && catalog.status === 'Activo'
    ).sort((a, b) => parseInt(a.grade, 10) - parseInt(b.grade, 10)) // Se ordena por grado, menor a mayor
    
    console.log('🔍 Niveles academicos cargados', secundaria)
    
    // Transformar el formato para que value sea el id numérico
    const transformedSecundaria = secundaria.map(obj => ({
      value: obj.id, // Usar el ID numérico como value
      label: obj.description, // Usar el campo 'description' del catálogo como label
      id: obj.id
    }))
    
    console.log('🔍 Niveles academicos transformados:', transformedSecundaria)
    secundariaCatalog.value = transformedSecundaria
  } catch (error) {
    console.error('❌ Error al cargar niveles academicos:', error)
    // En caso de error, mostrar opciones no disponibles
    secundariaCatalog.value = [
      { value: "no_disponible", label: "Opciones no disponibles" }
    ]
  }
}

// Función para cargar grados media superior
const loadMediaSuperiorCatalog = async () => {
  try {
    const mediaSuperiorCatalogResponse = await getAllReservationSchoolAcademicLevels({ AcademicLevel: 'MediaSuperior' })
    const mediaSuperior = mediaSuperiorCatalogResponse.filter(catalog => 
      catalog.level === 'MediaSuperior' && catalog.status === 'Activo'
    ).sort((a, b) => parseInt(a.grade, 10) - parseInt(b.grade, 10)) // Se ordena por grado, menor a mayor
    
    console.log('🔍 Niveles academicos cargados', mediaSuperior)
    
    // Transformar el formato para que value sea el id numérico
    const transformedMediaSuperior = mediaSuperior.map(obj => ({
      value: obj.id, // Usar el ID numérico como value
      label: obj.description, // Usar el campo 'description' del catálogo como label
      id: obj.id
    }))
    
    console.log('🔍 Niveles academicos transformados:', transformedMediaSuperior)
    mediaSuperiorCatalog.value = transformedMediaSuperior
  } catch (error) {
    console.error('❌ Error al cargar niveles academicos:', error)
    // En caso de error, mostrar opciones no disponibles
    mediaSuperiorCatalog.value = [
      { value: "no_disponible", label: "Opciones no disponibles" }
    ]
  }
}

// Función para cargar grados superior
const loadSuperiorCatalog = async () => {
  try {
    const superiorCatalogResponse = await getAllReservationSchoolAcademicLevels({ AcademicLevel: 'Superior' })
    const superior = superiorCatalogResponse.filter(catalog => 
      catalog.level === 'Superior' && catalog.status === 'Activo'
    ).sort((a, b) => parseInt(a.grade, 10) - parseInt(b.grade, 10)) // Se ordena por grado, menor a mayor
    
    console.log('🔍 Niveles academicos cargados', superior)
    
    // Transformar el formato para que value sea el id numérico
    const transformedSuperior = superior.map(obj => ({
      value: obj.id, // Usar el ID numérico como value
      label: obj.description, // Usar el campo 'description' del catálogo como label
      id: obj.id
    }))
    
    console.log('🔍 Niveles academicos transformados:', transformedSuperior)
    superiorCatalog.value = transformedSuperior
  } catch (error) {
    console.error('❌ Error al cargar niveles academicos:', error)
    // En caso de error, mostrar opciones no disponibles
    superiorCatalog.value = [
      { value: "no_disponible", label: "Opciones no disponibles" }
    ]
  }
}

// Función para cargar grados posgrado
const loadPosgradoCatalog = async () => {
  try {
    const posgradoCatalogResponse = await getAllReservationSchoolAcademicLevels({ AcademicLevel: 'Posgrado' })
    const posgrado = posgradoCatalogResponse.filter(catalog => 
      catalog.level === 'Posgrado' && catalog.status === 'Activo'
    ).sort((a, b) => parseInt(a.grade, 10) - parseInt(b.grade, 10)) // Se ordena por grado, menor a mayor
    
    console.log('🔍 Niveles academicos cargados', posgrado)
    
    // Transformar el formato para que value sea el id numérico
    const transformedPosgrado = posgrado.map(obj => ({
      value: obj.id, // Usar el ID numérico como value
      label: obj.description, // Usar el campo 'description' del catálogo como label
      id: obj.id
    }))
    
    console.log('🔍 Niveles academicos transformados:', transformedPosgrado)
    posgradoCatalog.value = transformedPosgrado
  } catch (error) {
    console.error('❌ Error al cargar niveles academicos:', error)
    // En caso de error, mostrar opciones no disponibles
    posgradoCatalog.value = [
      { value: "no_disponible", label: "Opciones no disponibles" }
    ]
  }
}

// Función para cargar temas de interés
const loadInterestEconomic = async () => {
  try {
    await fetchPublicCatalogs({ tableName: "SecondaryConcepts" })
    const topics = (catalogs.value || [])
      .filter(t => t.tableName === "SecondaryConcepts" && t.enable)
      .map(({ id, value }) => ({ value: id, label: value, id }))
    interestTopics.value = topics.length ? topics : [{ value: "no_disponible", label: "Opciones no disponibles" }]
  } catch (err) {
    console.error("❌ Error al cargar temas de interés:", err)
    interestTopics.value = [{ value: "no_disponible", label: "Opciones no disponibles" }]
  }
}

// Función para cargar materias
const loadScoolSubject = async () => {
  try {
    await fetchPublicCatalogs({ tableName: "ScoolSubject" })
    const topics = (catalogs.value || [])
      .filter(t => t.tableName === "ScoolSubject" && t.enable)
      .map(({ id, value }) => ({ value: id, label: value, id }))
    scoolSubjects.value = topics.length ? topics : [{ value: "no_disponible", label: "Opciones no disponibles" }]
  } catch (err) {
    console.error("❌ Error al cargar materias:", err)
    scoolSubjects.value = [{ value: "no_disponible", label: "Opciones no disponibles" }]
  }
}

// Función para cargar campos formativos
const loadLearningArea = async () => {
  try {
    await fetchPublicCatalogs({ tableName: "LearningArea" })
    const topics = (catalogs.value || [])
      .filter(t => t.tableName === "LearningArea" && t.enable)
      .map(({ id, value }) => ({ value: id, label: value, id }))
    learningAreas.value = topics.length ? topics : [{ value: "no_disponible", label: "Opciones no disponibles" }]
  } catch (err) {
    console.error("❌ Error al cargar campos formativos:", err)
    learningAreas.value = [{ value: "no_disponible", label: "Opciones no disponibles" }]
  }
}

// Función para cargar ejes articuladores
const loadCoreAxes = async () => {
  try {
    await fetchPublicCatalogs({ tableName: "CoreAxes" })
    const topics = (catalogs.value || [])
      .filter(t => t.tableName === "CoreAxes" && t.enable)
      .map(({ id, value }) => ({ value: id, label: value, id }))
    coreAxes.value = topics.length ? topics : [{ value: "no_disponible", label: "Opciones no disponibles" }]
  } catch (err) {
    console.error("❌ Error al cargar ejes articuladores:", err)
    coreAxes.value = [{ value: "no_disponible", label: "Opciones no disponibles" }]
  }
}

const loadSpecialAssistance = async () => {
  try {
    await fetchCatalogs({ tableName: "SpecialAssistance" })
    const data = (catalogs.value || [])
      .filter(c => c.tableName === "SpecialAssistance" && c.enable)
      .map(({ id, value }) => ({ value: id, label: value, id }))
    specialAssistances.value = data.length ? data : [{ value: "no_disponible", label: "Opciones no disponibles" }]
  } catch (err) {
    console.error("❌ Error al cargar necesidades especiales:", err)
    specialAssistances.value = [{ value: "no_disponible", label: "Opciones no disponibles" }]
  }
}

const loadDisabilityCategories = async () => {
  try {
    await fetchCatalogs({ tableName: "SpecialAssistance" })
    const disabilities = (catalogs.value || []).filter(c => c.tableName === "SpecialAssistance" && c.enable)
    const categoriesMap = {
      movilidad: { id: "movilidad", name: "Movilidad reducida", subcategories: [] },
      visual: { id: "visual", name: "Discapacidad visual", subcategories: [] },
      auditiva: { id: "auditiva", name: "Discapacidad auditiva", subcategories: [] },
      cognitiva: { id: "cognitiva", name: "Discapacidad cognitiva", subcategories: [] },
      salud: { id: "salud", name: "Condición de salud", subcategories: [] },
      otro: { id: "otro", name: "Otro (especificar)", subcategories: [] }
    }
    const patterns = [
      { key: "Movilidad reducida", target: "movilidad" },
      { key: "Discapacidad visual", target: "visual" },
      { key: "Discapacidad auditiva", target: "auditiva" },
      { key: "Discapacidad cognitiva", target: "cognitiva", startsWith: true },
      { key: "Condición de salud", target: "salud", startsWith: true },
      { key: "Otro", target: "otro", startsWith: true }
    ]
    disabilities.forEach(d => {
      const item = { id: d.id, name: d.value, description: d.description, disabled: !d.enable }
      const match = patterns.find(p => p.startsWith ? d.value.startsWith(p.key) : d.value === p.key)
      if (match) categoriesMap[match.target].subcategories.push(item)
    })
    disabilityCategories.value = Object.values(categoriesMap).flatMap(cat =>
      cat.subcategories.length === 1 ? [{ ...cat.subcategories[0] }] :
        cat.subcategories.length > 1 ? [cat] : []
    )
  } catch (err) {
    console.error("❌ Error al cargar categorías de discapacidades:", err)
    disabilityCategories.value = []
  }
}

// Función para actualizar datos
const updateGeneralData = (updates) => {
  Object.assign(generalData.value, updates)
}

// Función helper para verificar si hay discapacidad (usada en validación y mapeo)
const checkHasDisability = () => {
  // Verificar desde hasDisabilityFromAPI si está disponible
  if (hasDisabilityFromAPI.value !== null && hasDisabilityFromAPI.value !== undefined) {
    return hasDisabilityFromAPI.value;
  }

  // Fallback: Calcular desde datos locales
  const step1Data = stepStatusStore.stepStatus[1]?.data || currentReservation.value;

  if (step1Data) {
    return (
      step1Data.totalYoungAdultsWithDisabilities > 0 ||
      step1Data.totalAdultsWithDisabilities > 0 ||
      step1Data.totalSeniorsWithDisabilities > 0
    );
  }

  return false;
};

// Función para mapear datos del formulario al formato del API
const mapFormDataToApiRequest = (formData) => {
  const hasDisability = checkHasDisability();
  console.log("🔍 mapFormDataToApiRequest - hasDisability:", hasDisability);
  console.log(
    "🔍 mapFormDataToApiRequest - formData.specialAssistances:",
    formData.specialAssistances
  );
  return {
    reservationId: parseInt(String(props?.reservationId)),
    primaria: formData.primaria,
    secundaria: formData.secundaria,
    mediaSuperior: formData.mediaSuperior,
    superior: formData.superior,
    posgrado: formData.posgrado,
    isReservationPersonAlsoResponsible: formData.isReservationPersonAlsoResponsible || false,
    isResponsibleNotAssigned: formData.isResponsibleNotAssigned || false,
    fullName: formData.fullName || null,
    email: formData.email || null,
    phone: formData.phone || null,
    whereAreYouVisitingFromId: formData.whereAreYouVisitingFromId || null,
    specialAssistances: 
      hasDisability && formData.specialAssistances && formData.specialAssistances.length > 0
        ? formData.specialAssistances
        : [],
  }
}

const formSchema = toTypedSchema(
  z.object({
    preescolar: z.array(z.any()),
    primaria: z.array(z.any()),
    secundaria: z.array(z.any()),
    mediaSuperior: z.array(z.any()),
    superior: z.array(z.any()),
    posgrado: z.array(z.any()),
    isReservationPersonAlsoResponsible: z.boolean().default(true),
    isReservationPersonAlsoResponsibleSi: z.boolean().default(true),
    isReservationPersonAlsoResponsibleNo: z.boolean().default(false),
    isResponsibleNotAssigned: z.boolean().default(false),
    fullName: z.string().trim().nullable().optional(),
    email: z.string().trim().email('Por favor, ingresa un correo electrónico válido').nullable().optional(),
    phone: z.string().trim().regex(/^(?:\+\d{10,15}|\d{10})$/, 'Por favor, ingresa un número de teléfono válido').nullable().optional(),
    specialAssistances: z.array(z.any()).optional()
  }).superRefine((data, ctx) => {
    
    // Validación: isReservationPersonAlsoResponsibleSi o isReservationPersonAlsoResponsibleNo debe ser true
    if (!data.isReservationPersonAlsoResponsibleSi && !data.isReservationPersonAlsoResponsibleNo) {
      ctx.addIssue({
        path: ['isReservationPersonAlsoResponsibleSi'],
        code: z.ZodIssueCode.custom,
        message: 'Debes seleccionar al menos una opción relacionada con el representante de la visita.',
      });
      ctx.addIssue({
        path: ['isReservationPersonAlsoResponsibleNo'],
        code: z.ZodIssueCode.custom,
        message: 'Debes seleccionar al menos una opción relacionada con el representante de la visita.',
      })
    }

    const condition = (!data.isResponsibleNotAssigned && data.isReservationPersonAlsoResponsibleNo) || (data.isResponsibleNotAssigned && data.isReservationPersonAlsoResponsibleSi)
    
    if (condition) {
      if (!data.fullName) {
        ctx.addIssue({
          path: ['fullName'],
          code: z.ZodIssueCode.custom,
          message: 'Por favor, ingresa el nombre del representante',
        });
      }

      if (!data.email) {
        ctx.addIssue({
          path: ['email'],
          code: z.ZodIssueCode.custom,
          message: 'Por favor, ingresa un correo electrónico válido',
        });
      }

      if (!data.phone) {
        ctx.addIssue({
          path: ['phone'],
          code: z.ZodIssueCode.custom,
          message: 'Por favor, ingresa un número de teléfono válido',
        });
      }

    }

    // Validar necesidades especiales solo si hay personas con discapacidad
    if (data.specialAssistances !== undefined && data.specialAssistances.length === 0) {
      if(hasDisabilityFromAPI.value) {
        ctx.addIssue({
          code: "custom",
          message: "Por favor selecciona al menos una condición de asistencia especial",
          path: ["specialAssistances"],
        });
      }
    }
  })
);

const { handleSubmit, errors, setFieldValue, setErrors, validateField, values, meta } = useForm({
  // Evitar validación inicial automática para no mostrar errores antes de interactuar
  validateOnMount: false,
  // Configurar valores iniciales
  validationSchema: formSchema,
  initialValues: {
    preescolar: [],
    primaria: [],
    secundaria: [],
    mediaSuperior: [],
    superior: [],
    posgrado: [],
    isReservationPersonAlsoResponsible: true,
    isReservationPersonAlsoResponsibleSi: true,
    isReservationPersonAlsoResponsibleNo: false,
    isResponsibleNotAssigned: false,
    fullName: null,
    email: null,
    phone: null,
    specialAssistances: [],
  }
});

// Accedemos al valor real del formulario para isReservationPersonAlsoResponsible
const hasReservationPersonAlsoResponsible = computed(() => {
  return !!values?.isReservationPersonAlsoResponsible || false;
});

// Indica si se deben mostrar los datos del representante de la visita dependiendo de si hay al menos una opcion seleccionada de "Si/No"
const isAnyReservationPersonAlsoResponsibleSelectedOption = computed(() => {
  return (!!values?.isReservationPersonAlsoResponsibleSi || !!values?.isReservationPersonAlsoResponsibleNo) || false;
});

// INICIAN VARIABLES Y TOGGLES DE DROPDOWNS DE GRADOS
// Estado para controlar la visibilidad del dropdown de primaria
const showPrimaria = ref(false)

// Función para alternar la visibilidad del dropdown de primaria
const togglePrimariaDropdown = () => {
  showPrimaria.value = !showPrimaria.value
}

// Estado para controlar la visibilidad de los dropdowns dinamicos de primaria
const showPrimariaDynamic = ref({})

// Función para alternar la visibilidad de los dropdowns dinamicos de primaria
const togglePrimariaDynamicDropdown = (id:any) => {
  showPrimariaDynamic.value[id] = !showPrimariaDynamic.value[id]
}

// Estado para controlar la visibilidad del dropdown de secundaria
const showSecundaria = ref(false)

// Función para alternar la visibilidad del dropdown de secundaria
const toggleSecundariaDropdown = () => {
  showSecundaria.value = !showSecundaria.value
}

// Estado para controlar la visibilidad de los dropdowns dinamicos de secundaria
const showSecundariaDynamic = ref({})

// Función para alternar la visibilidad de los dropdowns dinamicos de secundaria
const toggleSecundariaDynamicDropdown = (id:any) => {
  showSecundariaDynamic.value[id] = !showSecundariaDynamic.value[id]
}

// Estado para controlar la visibilidad del dropdown de media superior
const showMediaSuperior = ref(false)

// Función para alternar la visibilidad del dropdown de media superior
const toggleMediaSuperiorDropdown = () => {
  showMediaSuperior.value = !showMediaSuperior.value
}

// Estado para controlar la visibilidad de los dropdowns dinamicos de media superior
const showMediaSuperiorDynamic = ref({})

// Función para alternar la visibilidad de los dropdowns dinamicos de media superior
const toggleMediaSuperiorDynamicDropdown = (id:any) => {
  showMediaSuperiorDynamic.value[id] = !showMediaSuperiorDynamic.value[id]
}

// Estado para controlar la visibilidad del dropdown de superior
const showSuperior = ref(false)

// Función para alternar la visibilidad del dropdown de superior
const toggleSuperiorDropdown = () => {
  showSuperior.value = !showSuperior.value
}

// Estado para controlar la visibilidad de los dropdowns dinamicos de superior
const showSuperiorDynamic = ref({})

// Función para alternar la visibilidad de los dropdowns dinamicos de superior
const toggleSuperiorDynamicDropdown = (id:any) => {
  showSuperiorDynamic.value[id] = !showSuperiorDynamic.value[id]
}

// Estado para controlar la visibilidad del dropdown de posgrado
const showPosgrado = ref(false)

// Función para alternar la visibilidad del dropdown de posgrado
const togglePosgradoDropdown = () => {
  showPosgrado.value = !showPosgrado.value
}

// Estado para controlar la visibilidad de los dropdowns dinamicos de posgrado
const showPosgradoDynamic = ref({})

// Función para alternar la visibilidad de los dropdowns dinamicos de posgrado
const togglePosgradoDynamicDropdown = (id:any) => {
  showPosgradoDynamic.value[id] = !showPosgradoDynamic.value[id]
}
// TERMINAN VARIABLES Y TOGGLES DE DROPDOWNS DE GRADOS

// Si hay un usuario, devuelve un objeto con shape del schema form con data del usuario autenticado. Si no, devuelve este shape con datos vacios string ''
const getReservationPersonAlsoResponsibleUserInformation = (currentUser:any):Record<string, any>|null => {
  if(!currentUser) return null
  // Construir el nombre completo a partir de las propiedades disponibles
  const fullName = currentUser.name ? `${currentUser.name} ${currentUser.paternalLastName || ''} ${currentUser.maternalLastName || ''}`.trim() : null
  const userData = {
    fullName: fullName,
    email: currentUser.email || null,
    phone: currentUser.phoneNumber || null
  }
  return userData
}

// Indica si el esquema/form del paso 2 es valido o no
const isValidForm: ComputedRef<boolean> = computed(() => meta.value.valid && !meta.value.pending)

// Setea los campos del representante de la visita con los datos enviados o en su defecto con datos vacios string ''
const setReservationPersonAlsoResponsibleUserInformation = (userData?:any) => {
  if(userData) {
    // Llenar los campos primero
    setFieldValue('fullName', userData.fullName);
    setFieldValue('email', userData.email);
    setFieldValue('phone', userData.phone);
  } 
  else {
    // Limpiar los campos
    setFieldValue('fullName', null);
    setFieldValue('email', null);
    setFieldValue('phone', null);
  }
}

// Función independiente para manejar el checkbox "Si" (mismo responsable)
const handleIsReservationPersonAlsoResponsibleSi = (checked: boolean, handleChange: Function) => {
  handleChange(checked);

  setFieldValue('isReservationPersonAlsoResponsibleNo', false);
  setFieldValue('isReservationPersonAlsoResponsible', true);
  setFieldValue('isResponsibleNotAssigned', false);

  // Llenar con datos del usuario si está disponible
  const userData = getReservationPersonAlsoResponsibleUserInformation(authStore.user || user.value);
  
  if (userData) {
    // Llenar los campos primero
    setReservationPersonAlsoResponsibleUserInformation(userData)

    updateGeneralData(userData);
    // Solo validar los campos del representante después de llenarlos
    nextTick(() => {
      setErrors({ fullName: undefined });
      setErrors({ email: undefined });
      setErrors({ phone: undefined });
      validateField('fullName');
      validateField('email');
      validateField('phone');
    });
  }
}

// Función independiente para manejar el checkbox "No" (diferente responsable)
const handleIsReservationPersonAlsoResponsibleNo = (checked: boolean, handleChange: Function) => {
  handleChange(checked);

  setFieldValue('isReservationPersonAlsoResponsibleSi', false);
  setFieldValue('isReservationPersonAlsoResponsible', false);
  setFieldValue('isResponsibleNotAssigned', false); // Duda quitar. Probar

  // Limpiar los campos
  setReservationPersonAlsoResponsibleUserInformation()

  updateGeneralData({
    fullName: null,
    email: null,
    phone: null
  });
  // Validar los campos después de limpiarlos
  nextTick(() => {
    setErrors({ fullName: undefined });
    setErrors({ email: undefined });
    setErrors({ phone: undefined });
    validateField('fullName');
    validateField('email');
    validateField('phone');
  });
}

// Función independiente para manejar el checkbox de "Aun no asignado"
const handleIsResponsibleNotAssigned = (checked: boolean, handleChange: Function) => {
  handleChange(checked)
  // Validar los campos después de limpiarlos
  nextTick(() => {
    setErrors({ fullName: undefined });
    setErrors({ email: undefined });
    setErrors({ phone: undefined });
    validateField('fullName');
    validateField('email');
    validateField('phone');
  });
}

 // Función para manejar el envío del formulario
 const onSubmit =  handleSubmit(async (formValues) => {
    
    try {      

      // Verificar si se están cargando datos del header
      if (isLoadingHeaderData.value) {
        console.log("⚠️ Formulario bloqueado - cargando datos del header");
        return;
      }

      // Imprimir valores actuales en consola
      console.log('=== VALORES DEL FORMULARIO PASO 2 ===')
      console.log('Tipo de reservación:', props.type)
      console.log('Datos generales:', props.data)
      console.log('Datos de reservación escolar:', generalData.value)
      console.log('Reservación actual:', currentReservation.value)
      console.log('ID de reservación actual:', store.currentReservationId)
      console.log('Store completo:', store)
      console.log('=====================================')
      
      console.log('✅ Formulario válido - Enviando datos al servidor')

      console.log('🔍 Formulario Step 2 - Datos enviados:', JSON.stringify(formValues, null, 2));
      
      // Verificar que hay una reservación activa
      if (!currentReservation.value && !store.currentReservationId) {
        console.error('❌ No hay una reservación activa')
        console.log('Error: No hay una reservación activa. Por favor regresa al paso 1.')
        return
      }
      
      // Si tenemos ID pero no el objeto completo, intentar cargar los datos
      if (!currentReservation.value && store.currentReservationId) {
        console.log('🔄 Cargando datos de la reservación desde el servidor...')
        try {
          const loaded = await loadStep2(store.currentReservationId)
          if (!loaded) {
            console.error('❌ No se pudieron cargar los datos de la reservación')
            console.log('Error: No se pudieron cargar los datos de la reservación. Por favor regresa al paso 1.')
            return
          }
        } catch (error) {
          console.error('❌ Error al cargar datos de la reservación:', error)
          console.log('Error al cargar los datos de la reservación. Por favor regresa al paso 1.')
          return
        }
      }
      // Mapear datos del formulario al formato del API
      const apiRequest = mapFormDataToApiRequest(formValues)
      
      // Actualizar los datos en el store antes de enviar
      store.updateFormData({
        reservationId: apiRequest.reservationId,
        primaria: apiRequest.primaria,
        secundaria: apiRequest.secundaria,
        mediaSuperior: apiRequest.mediaSuperior,
        superior: apiRequest.superior,
        posgrado: apiRequest.posgrado,
        isReservationPersonAlsoResponsible: apiRequest.isReservationPersonAlsoResponsible,
        isResponsibleNotAssigned: apiRequest.isResponsibleNotAssigned,
        fullName: apiRequest.fullName,
        email: apiRequest.email,
        phone: apiRequest.phone,
        whereAreYouVisitingFromId: apiRequest.whereAreYouVisitingFromId,
        specialAssistances: apiRequest.specialAssistances
      })
      
      // Llamar al endpoint PUT usando el composable
      const result = await updateReservationSchoolsStep2()
      
      if (result) {
        console.log('✅ Paso 2 actualizado exitosamente:', result)
        
        // Emitir evento con los datos del formulario
        emit('submit', {
          type: props.type,
          data: props.data,
          generalData: formValues,
          reservation: result
        })
        
        // También emitir el evento next para continuar al siguiente paso
        emit('next')
      } else {
        console.error('❌ Error al actualizar el paso 2')
        console.log('Error al guardar los datos. Por favor intenta de nuevo.')
      }
      
    } catch (error) {
      console.error('❌ Error al procesar formulario:', error)
      console.log('Error al procesar el formulario. Por favor intenta de nuevo.')
    }
})

// Funcion que se invoca al ir del paso 1 al 2 mediante boton de envio de formulario o mediante ReservationStepHeader (watch vigilando props.header)
const setearNivelesAcademicos = async (currentReservationId, data) => {
  try {
    const reservationSchoolStep1Response = await loadStep1(currentReservationId);

    if(reservationSchoolStep1Response?.schoolLevels?.preescolar?.length > 0) {
      // Mapear los datos del header a los campos del formulario del Step 2
      const preescolarFormateado = reservationSchoolStep1Response?.schoolLevels?.preescolar?.map(gradosPreescolar => {
        return { academicLevelId: gradosPreescolar, learningAreaId: null, coreAxesId: null }
      })
      setFieldValue('preescolar', preescolarFormateado)
    }
    if(reservationSchoolStep1Response?.schoolLevels?.primaria?.length > 0) {
      if(data?.primaria){
        if(Array.isArray(data?.primaria) && data?.primaria?.length > 0){
          setFieldValue('primaria', data?.primaria)
        }
        else { // Normalmente este else se ejecuta cuando es un formulario nuevo, paso 2 nuevo donde los campos deben estar en blanco y la respuesta del endpoint no traera datos
          const primariaFormateado = reservationSchoolStep1Response?.schoolLevels?.primaria?.map(gradosPrimaria => {
            return { academicLevelId: gradosPrimaria, learningAreaId: null, coreAxesId: null }
          })
          setFieldValue('primaria', primariaFormateado)
        }
      }
    }
    if(reservationSchoolStep1Response?.schoolLevels?.secundaria?.length > 0) {
      if(data?.secundaria){
        if(Array.isArray(data?.secundaria) && data?.secundaria?.length > 0){
          setFieldValue('secundaria', data?.secundaria)
        }
        else { // Normalmente este else se ejecuta cuando es un formulario nuevo, paso 2 nuevo donde los campos deben estar en blanco y la respuesta del endpoint no traera datos
          const secundariaFormateado = reservationSchoolStep1Response?.schoolLevels?.secundaria?.map(gradosSecundaria => {
            return { academicLevelId: gradosSecundaria, learningAreaId: null, coreAxesId: null }
          })
          setFieldValue('secundaria', secundariaFormateado)
        }
      }
    }
    if(reservationSchoolStep1Response?.schoolLevels?.mediaSuperior?.length > 0) {
      if(data?.mediaSuperior){
        if(Array.isArray(data?.mediaSuperior) && data?.mediaSuperior?.length > 0){
          setFieldValue('mediaSuperior', data?.mediaSuperior)
        }
        else { // Normalmente este else se ejecuta cuando es un formulario nuevo, paso 2 nuevo donde los campos deben estar en blanco y la respuesta del endpoint no traera datos
          const mediaSuperiorFormateado = reservationSchoolStep1Response?.schoolLevels?.mediaSuperior?.map(gradosMediaSuperior => {
            return { academicLevelId: gradosMediaSuperior, learningAreaId: null, coreAxesId: null }
          })
          setFieldValue('mediaSuperior', mediaSuperiorFormateado)
        }
      }
    }
    if(reservationSchoolStep1Response?.schoolLevels?.superior?.length > 0) {
      if(data?.superior){
        if(Array.isArray(data?.superior) && data?.superior?.length > 0){
          setFieldValue('superior', data?.superior)
        }
        else { // Normalmente este else se ejecuta cuando es un formulario nuevo, paso 2 nuevo donde los campos deben estar en blanco y la respuesta del endpoint no traera datos
          const superiorFormateado = reservationSchoolStep1Response?.schoolLevels?.superior?.map(gradosSuperior => {
            return { academicLevelId: gradosSuperior, learningAreaId: null, coreAxesId: null }
          })
          setFieldValue('superior', superiorFormateado)
        }
      }
    }
    if(reservationSchoolStep1Response?.schoolLevels?.posgrado?.length > 0) {
      if(data?.posgrado){
        if(Array.isArray(data?.posgrado) && data?.posgrado?.length > 0){
          setFieldValue('posgrado', data?.posgrado)
        }
        else { // Normalmente este else se ejecuta cuando es un formulario nuevo, paso 2 nuevo donde los campos deben estar en blanco y la respuesta del endpoint no traera datos
          const posgradoFormateado = reservationSchoolStep1Response?.schoolLevels?.posgrado?.map(gradosPosgrado => {
            return { academicLevelId: gradosPosgrado, learningAreaId: null, coreAxesId: null }
          })
          setFieldValue('posgrado', posgradoFormateado)
        }
      }
    }
  } catch (error) {
    console.error("❌ Error al verificar reservacion paso 1:", error);
  }
}


onMounted(async () => {

  // Llenar con datos del usuario si está disponible
  const userData = getReservationPersonAlsoResponsibleUserInformation(authStore.user || user.value);
  if (userData) {
    // Llenar los campos primero
    setReservationPersonAlsoResponsibleUserInformation(userData)
  }

  // Cargar catálogos
  await Promise.all([
    loadInterestEconomic(),
    loadScoolSubject(),
    loadLearningArea(),
    loadCoreAxes(),
    loadPreescolarCatalog(),
    loadPrimariaCatalog(),
    loadSecundariaCatalog(),
    loadMediaSuperiorCatalog(),
    loadSuperiorCatalog(),
    loadPosgradoCatalog(),
    fetchMunicipalities(),
    loadSpecialAssistance(),
    loadDisabilityCategories(),
  ])
  
  // Si tenemos ID de reservación pero no el objeto completo, cargarlo
  if (store.currentReservationId && !currentReservation.value) {
    console.log('🔄 Inicializando reservación desde ID persistido:', store.currentReservationId)
    try {
      const loaded = await loadStep2(store.currentReservationId)
      if (loaded) {
        console.log('✅ Reservación cargada exitosamente en onMounted')
        console.log('✅ currentReservation después de cargar:', currentReservation.value)
      } else if (loaded === false) {
        console.log("ℹ️ Carga omitida (ya está cargándose o se cargó recientemente)");
      } else {
        console.error('❌ No se pudo cargar la reservación en onMounted')
      }
    } catch (error) {
      console.error('❌ Error al cargar reservación en onMounted:', error)
    }
  } else if (currentReservation.value) {
    console.log('✅ Reservación ya disponible en onMounted:', currentReservation.value)
  } else {
    console.log('⚠️ No hay ID de reservación disponible en onMounted')
  }

  // Verificar si la reservación tiene personas con discapacidad desde el endpoint
  if (store.currentReservationId) {
    console.log("🔄 Verificando si la reservación tiene personas con discapacidad...");
    try {
      const hasDisability = await checkReservationHasDisability(store.currentReservationId);
      hasDisabilityFromAPI.value = hasDisability;
      console.log("✅ Resultado de verificación de discapacidad:", hasDisability);
    } catch (error) {
      console.error("❌ Error al verificar discapacidad:", error);
      hasDisabilityFromAPI.value = false;
    }
  }

  reservationStep2HasBeenMounted.value = true

});

// Watcher para detectar data enviada desde el header (igual que en Step 1)
watch(() => [ props.headerData, reservationStep2HasBeenMounted ], async ([ newHeaderData, newReservationStep2HasBeenMounted ]) => {

    if(!newReservationStep2HasBeenMounted) return

    console.log("🔍 Step 2 - Watcher headerData ejecutado:", newHeaderData);
    console.log("🔍 Step 2 - props.headerData:", props.headerData);

    if (newHeaderData && Object.keys(newHeaderData).length > 0) {
      console.log("📥 Data enviada desde el header en Step 2:", newHeaderData);
      console.log("🔍 newHeaderData.step:", newHeaderData.step);
      console.log("🔍 newHeaderData.data:", newHeaderData.data);

      // Si hay data del paso 2, actualizar el formulario
      if (newHeaderData.step === 2 && newHeaderData.data) {
        // Activar bandera para evitar validación automática
        isLoadingHeaderData.value = true;
        console.log(
          "🔄 Actualizando formulario Step 2 con data del header:",
          newHeaderData.data
        );
        console.log("🔍 Datos específicos del paso 2:", {
          isReservationPersonAlsoResponsible: newHeaderData.data.isReservationPersonAlsoResponsible,
          isResponsibleNotAssigned: newHeaderData.data.isResponsibleNotAssigned,
          fullName: newHeaderData.data.fullName,
          email: newHeaderData.data.email,
          phone: newHeaderData.data.phone,
          specialAssistances: newHeaderData.data.specialAssistances
        });

        console.log("🔍 Datos completos recibidos:", newHeaderData.data);

        const data = newHeaderData.data;

        // INICIA DATOS DE NIVELES ACADEMICOS
        console.log("🔄 Cargando reservacion escolar paso 1 con id...", store.currentReservationId);
        await setearNivelesAcademicos(store.currentReservationId, data)

        // TERMINA DATOS DE NIVELES ACADEMICOS

        // Datos del representante
        if (data.isReservationPersonAlsoResponsible !== undefined && data.isReservationPersonAlsoResponsible !== null) {
          setFieldValue("isReservationPersonAlsoResponsible", data.isReservationPersonAlsoResponsible);
          setFieldValue("isReservationPersonAlsoResponsibleSi", data.isReservationPersonAlsoResponsible);
          setFieldValue("isReservationPersonAlsoResponsibleNo",!data.isReservationPersonAlsoResponsible);
          if(data.isReservationPersonAlsoResponsible === false) { // Se agrega esta condicion para validar el flujo de API donde todas las banderas sean false. Como onMounted setea por defecto estos campos al usuario autenticado entonces hay que setear bien de nuevo estos campos de acuerdo a la espuesta API
            setFieldValue("fullName", null);
            setFieldValue("email", null);
            setFieldValue("phone", null);
          }
          console.log("✅ Datos de responsable seteados:", {
            isReservationPersonAlsoResponsible: data.isReservationPersonAlsoResponsible,
            isReservationPersonAlsoResponsibleSi: data.isReservationPersonAlsoResponsible,
            isReservationPersonAlsoResponsibleNo: !data.isReservationPersonAlsoResponsible,
          });
        }

        if (data.isResponsibleNotAssigned !== undefined && data.isResponsibleNotAssigned !== null) {
          setFieldValue("isResponsibleNotAssigned", data.isResponsibleNotAssigned);
          console.log("✅ isResponsibleNotAssigned seteado:", data.isResponsibleNotAssigned);
        }

        if (data.fullName && data.fullName !== null && data.fullName !== undefined) {
          setFieldValue("fullName", data.fullName);
          console.log("✅ fullName seteado:", data.fullName);
        }

        if (data.email && data.email !== null && data.email !== undefined) {
          setFieldValue("email", data.email);
          console.log("✅ email seteado:", data.email);
        }

        if (data.phone && data.phone !== null && data.phone !== undefined) {
          setFieldValue("phone", data.phone);
          console.log("✅ phone seteado:", data.phone);
        }

        // Necesidades especiales
        if (data.specialAssistances && Array.isArray(data.specialAssistances)) {
          setFieldValue("specialAssistances", data.specialAssistances);
          console.log("✅ specialAssistances seteado:", data.specialAssistances);
        }

        console.log("✅ Formulario Step 2 actualizado con datos del header");
        console.log("🔍 Valores finales del formulario:", {
          isReservationPersonAlsoResponsible: values.isReservationPersonAlsoResponsible,
          isResponsibleNotAssigned: values.isResponsibleNotAssigned,
          fullName: values.fullName,
          email: values.email,
          phone: values.phone,
          specialAssistances: values.specialAssistances
        });

        // Desactivar bandera después de cargar datos
        isLoadingHeaderData.value = false;
      }

    }

    reservationStep2HasBeenMounted.value = false // Se resetea la variable denido a que cumplio la ejecucion de codigo

  },
  { immediate: true, deep: true }
);
</script>