import { ref, computed, readonly } from 'vue'
import { useApiFetch, useApiPost, useApiPut, useApiDelete, API_ENDPOINTS } from '@/lib/api/core/useFetch'
import type { User, CreateUserRequest, UpdateUserRequest } from '@/lib/api/types/user'
import type { UserFormData, EditUserFormData } from '@/lib/validations/users'
import { useToast } from '../ui/useToast'
import { useErrorHandler } from '../ui/useErrorHandler'

export interface MuseoUser {
  id: string
  nombre: string
  apellidoPaterno: string
  apellidoMaterno: string
  correoElectronico: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export function useUsers() {
  const { showSuccess, showError } = useToast()
  const { getErrorMessage } = useErrorHandler()

  // API composables
  const getAllUsersComposable = useApiFetch<{ data: User[] }>(API_ENDPOINTS.user.getAll, { immediate: false })
  const getUserByEmailComposable = useApiFetch<{ data: User }>(API_ENDPOINTS.user.getById, { immediate: false })
  const createUserComposable = useApiPost<{ data: User }>(API_ENDPOINTS.user.create, { immediate: false })
  const updateUserComposable = useApiPut<{ data: User }>(API_ENDPOINTS.user.update, { immediate: false })
  const deleteUserComposable = useApiDelete<{ success: boolean }>(API_ENDPOINTS.user.delete, { immediate: false })

  // Estados reactivos
  const users = ref<MuseoUser[]>([])
  const isLoading = computed(() => 
    getAllUsersComposable.pending.value || 
    getUserByEmailComposable.pending.value ||
    createUserComposable.pending.value || 
    updateUserComposable.pending.value || 
    deleteUserComposable.pending.value
  )
  const error = computed(() => 
    getAllUsersComposable.error.value || 
    getUserByEmailComposable.error.value ||
    createUserComposable.error.value || 
    updateUserComposable.error.value || 
    deleteUserComposable.error.value
  )

  // Funciones de transformación
  const transformApiUserToMuseoUser = (apiUser: User): MuseoUser => ({
    id: apiUser.id,
    nombre: apiUser.name,
    apellidoPaterno: apiUser.paternalLastName,
    apellidoMaterno: apiUser.maternalLastName || '',
    correoElectronico: apiUser.email,
    isActive: apiUser.enable,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  })

  const transformUserFormToCreateRequest = (userData: UserFormData): CreateUserRequest => ({
    userName: userData.correoElectronico.split('@')[0],
    email: userData.correoElectronico,
    password: userData.contraseña,
    phoneNumber: '',
    name: userData.nombre,
    paternalLastName: userData.apellidoPaterno,
    maternalLastName: userData.apellidoMaterno || '',
    genderId: 1,
    userTypeId: 1,
    dateBirth: '',
    enableMarketing: false,
    enableUsePersonalData: true
  })

  const transformEditUserFormToUpdateRequest = (userId: string, userData: EditUserFormData): UpdateUserRequest => ({
    id: parseInt(userId),
    name: userData.nombre,
    paternalLastName: userData.apellidoPaterno,
    maternalLastName: userData.apellidoMaterno || '',
    enableMarketing: true,
    enableUsePersonalData: true,
    userModifiedId: 1
  })

  const getFullName = (user: MuseoUser): string => {
    return `${user.nombre} ${user.apellidoPaterno} ${user.apellidoMaterno}`.trim()
  }

  // Operaciones CRUD
  const loadUsers = async (): Promise<void> => {
    try {
      await getAllUsersComposable.execute()
      
      if (getAllUsersComposable.data.value?.data) {
        users.value = getAllUsersComposable.data.value.data.map(transformApiUserToMuseoUser)
      }
    } catch (error) {
      console.error('Error al cargar usuarios:', error)
      showError('Error', 'No se pudieron cargar los usuarios')
      throw error
    }
  }

  const createUser = async (userData: UserFormData): Promise<boolean> => {
    try {
      const createRequest = transformUserFormToCreateRequest(userData)
      await createUserComposable.execute({ body: createRequest })
      
      if (createUserComposable.data.value?.data) {
        const newUser = transformApiUserToMuseoUser(createUserComposable.data.value.data)
        users.value.push(newUser)
        
        showSuccess('Éxito', 'Usuario creado correctamente')
        return true
      }
      return false
    } catch (error) {
      console.error('Error al crear usuario:', error)
      const errorMessage = getErrorMessage(error as any)
      showError('Error', errorMessage || 'No se pudo crear el usuario')
      return false
    }
  }

  const updateUser = async (userIdOrData: string | any, userData?: EditUserFormData): Promise<boolean> => {
    try {
      let updateRequest: any
      
      // Si el primer parámetro es un objeto, asumimos que es el userId y los datos están en el objeto
      if (typeof userIdOrData === 'object' && userIdOrData !== null) {
        const fullUserData = userIdOrData
        const userId = fullUserData.id || fullUserData.userId
        
        if (!userId) {
          throw new Error('No se encontró el ID del usuario en los datos proporcionados')
        }
        
        updateRequest = {
          id: typeof userId === 'string' ? parseInt(userId) : userId,
          userName: fullUserData.userName,
          name: fullUserData.name,
          paternalLastName: fullUserData.paternalLastName,
          maternalLastName: fullUserData.maternalLastName,
          email: fullUserData.email,
          phoneNumber: fullUserData.phoneNumber,
          enableMarketing: fullUserData.enableMarketing,
          enableUsePersonalData: fullUserData.enableUsePersonalData,
          userModifiedId: 1
        }
      } else {
        // Caso original: userId como string y userData como EditUserFormData
        const userId = userIdOrData as string
        if (!userData) {
          throw new Error('Los datos del usuario son requeridos')
        }
        updateRequest = transformEditUserFormToUpdateRequest(userId, userData)
      }
      
      await updateUserComposable.execute({ body: updateRequest })
      
      const response = updateUserComposable.data.value as any
      const isSuccess = response?.code === 200 || response?.isValid === true || response?.data
      
      if (isSuccess) {
        if (response?.data) {
          const updatedUser = transformApiUserToMuseoUser(response.data)
          const userIdToUpdate = typeof userIdOrData === 'string' ? userIdOrData : (userIdOrData.id || userIdOrData.userId)
          const index = users.value.findIndex(u => u.id === userIdToUpdate)
          if (index !== -1) {
            users.value[index] = updatedUser
          }
        }
        return true
      }
      return false
    } catch (error) {
      console.error('Error al actualizar usuario:', error)
      const errorMessage = getErrorMessage(error as any)
      showError('Error', errorMessage || 'No se pudo actualizar el usuario')
      return false
    }
  }

  const deleteUser = async (userId: string): Promise<boolean> => {
    try {
      await deleteUserComposable.execute({ query: { id: userId } })
      
      users.value = users.value.filter(u => u.id !== userId)
      
      showSuccess('Éxito', 'Usuario eliminado correctamente')
      return true
    } catch (error) {
      console.error('Error al eliminar usuario:', error)
      const errorMessage = getErrorMessage(error as any)
      showError('Error', errorMessage || 'No se pudo eliminar el usuario')
      return false
    }
  }

  const searchUserByEmail = async (email: string): Promise<{ data: User } | null> => {
    try {
      await getUserByEmailComposable.execute({ query: { email } })
      return getUserByEmailComposable.data.value || null
    } catch (error) {
      console.error('Error al buscar usuario:', error)
      return null
    }
  }

  // Función para actualizar la preferencia de newsletter del usuario
  const updateUserNewsletterPreference = async (userEmail: string, enableMarketing: boolean): Promise<boolean> => {
    try {
      console.log('Actualizando preferencia de newsletter:', { userEmail, enableMarketing })
      
      if (!userEmail) {
        console.error('Error: No se proporcionó el email del usuario')
        showError('Error', 'No se encontró el email del usuario')
        return false
      }
      
      // Obtener los datos completos del usuario
      const apiResponse = await searchUserByEmail(userEmail)
      console.log('Respuesta de searchUserByEmail:', apiResponse)
      
      // Manejar la estructura de respuesta correcta
      let userData: any = null
      
      if (apiResponse && typeof apiResponse === 'object' && 'isValid' in apiResponse) {
        // Estructura con isValid y response
        const response = apiResponse as any
        if (response.isValid && response.response) {
          userData = response.response
        }
      } else if (apiResponse && apiResponse.data) {
        // Estructura con data
        userData = apiResponse.data
      }
      
      if (!userData) {
        console.error('Error: No se pudieron obtener los datos completos del usuario')
        showError('Error', 'No se pudieron obtener los datos del usuario')
        return false
      }
      
      // Crear objeto de actualización
      const updateData = {
        ...userData,
        enableMarketing: enableMarketing
      }
      
      console.log('Datos de actualización:', updateData)
      
      // Llamar a la función de actualización
      const result = await updateUser(updateData)
      
      if (result) {
        console.log('Preferencia de newsletter actualizada exitosamente')
        showSuccess('Éxito', 'Preferencia de newsletter actualizada correctamente')
        return true
      } else {
        console.error('Error: No se pudo actualizar la preferencia de newsletter')
        showError('Error', 'No se pudo actualizar la preferencia de newsletter')
        return false
      }
    } catch (error) {
      console.error('Error al actualizar preferencia de newsletter:', error)
      showError('Error', 'No se pudo actualizar la preferencia de newsletter')
      return false
    }
  }

  // Función para actualizar la preferencia de uso de datos personales del usuario
  const updateUserDataUsagePreference = async (userEmail: string, enableUsePersonalData: boolean): Promise<boolean> => {
    try {
      console.log('Actualizando preferencia de uso de datos:', { userEmail, enableUsePersonalData })
      
      if (!userEmail) {
        console.error('Error: No se proporcionó el email del usuario')
        showError('Error', 'No se encontró el email del usuario')
        return false
      }
      
      // Obtener los datos completos del usuario
      const apiResponse = await searchUserByEmail(userEmail)
      console.log('Respuesta de searchUserByEmail:', apiResponse)
      
      // Manejar la estructura de respuesta correcta
      let userData: any = null
      
      if (apiResponse && typeof apiResponse === 'object' && 'isValid' in apiResponse) {
        // Estructura con isValid y response
        const response = apiResponse as any
        if (response.isValid && response.response) {
          userData = response.response
        }
      } else if (apiResponse && apiResponse.data) {
        // Estructura con data
        userData = apiResponse.data
      }
      
      if (!userData) {
        console.error('Error: No se pudieron obtener los datos completos del usuario')
        showError('Error', 'No se pudieron obtener los datos del usuario')
        return false
      }
      
      // Crear objeto de actualización
      const updateData = {
        ...userData,
        enableUsePersonalData: enableUsePersonalData
      }
      
      console.log('Datos de actualización:', updateData)
      
      // Llamar a la función de actualización
      const result = await updateUser(updateData)
      
      if (result) {
        console.log('Preferencia de uso de datos actualizada exitosamente')
        showSuccess('Éxito', 'Preferencia de uso de datos actualizada correctamente')
        return true
      } else {
        console.error('Error: No se pudo actualizar la preferencia de uso de datos')
        showError('Error', 'No se pudo actualizar la preferencia de uso de datos')
        return false
      }
    } catch (error) {
      console.error('Error al actualizar preferencia de uso de datos:', error)
      showError('Error', 'No se pudo actualizar la preferencia de uso de datos')
      return false
    }
  }

  return {
    users: readonly(users),
    isLoading: readonly(isLoading),
    error: readonly(error),
    getFullName,
    loadUsers,
    createUser,
    updateUser,
    deleteUser,
    searchUserByEmail,
    updateUserNewsletterPreference,
    updateUserDataUsagePreference,
    filteredUsers: computed(() => users.value)
  }
}