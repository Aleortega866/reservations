import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useAuth } from '@/lib/api/composables/auth'


export const useAuthStore = defineStore('auth', () => {
  const { user, isAuthenticated, token, permissions, userRole, login, logout, updateUserInStore, refreshRoleFromToken } = useAuth()

  // Computed properties para compatibilidad con el store anterior
  const currentUser = computed(() => user.value)
  const isAdmin = computed(() => {
    // Verificar si el usuario tiene rol de administrador
    return userRole.value === 'SuperAdmin' || userRole.value === 'Admin'
  })

  // Computed para verificar permisos específicos
  const hasPermission = (permission: string) => {
    return permissions.value.includes(permission)
  }

  // Computed para verificar si tiene algún permiso de una lista
  const hasAnyPermission = (permissionList: string[]) => {
    return permissionList.some(permission => permissions.value.includes(permission))
  }

  // Computed para verificar si tiene todos los permisos de una lista
  const hasAllPermissions = (permissionList: string[]) => {
    return permissionList.every(permission => permissions.value.includes(permission))
  }

  // Función para actualizar el correo electrónico del usuario
  const updateUserEmail = (newEmail: string) => {
    if (user.value) {
      const updatedUser = { ...user.value, email: newEmail }
      updateUserInStore(updatedUser)
    }
  }

  const addAlternativeEmail = (newEmail: string) => {
    if (user.value) {
      // Verificar si backupEmails existe, si no, crear un array vacío
      const currentBackupEmails = user.value.backupEmails || []
      
      // Verificar que el email no esté duplicado
      if (!currentBackupEmails.includes(newEmail)) {
        const updatedUser = { 
          ...user.value, 
          backupEmails: [...currentBackupEmails, newEmail] 
        }
        updateUserInStore(updatedUser)
      }
    }
  }

  return {
    // State (readonly)
    user: computed(() => user.value),
    isAuthenticated: computed(() => isAuthenticated.value),
    token: computed(() => token.value),
    permissions: computed(() => permissions.value),
    userRole: computed(() => userRole.value),
    
    // Computed
    currentUser,
    isAdmin,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    
    // Actions
    login,
    logout,
    updateUserInStore,
    updateUserEmail,
    addAlternativeEmail,
    refreshRoleFromToken
  }
}) 