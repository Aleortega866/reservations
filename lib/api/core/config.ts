export const API_CONFIG = {
//baseURL: 'https://api-mider-dev.buzzword.com.mx/',
//baseURL: 'http://localhost:5137/',
baseURL: 'https://api-mider-qa.buzzword.com.mx/',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
} as const

export const API_ENDPOINTS = {
  // Auth endpoints
  auth: {
    signIn: '/api/Auth/SignInAsync',
    resetPassword: '/api/Auth/ResetPasswordAsync',
    resetPasswordSignIn: '/api/Auth/ResetPasswordSignInAsync',
    confirmTokenAccess: '/api/Auth/ConfirmTokenAccessAsync',
    confirmTokenAccessEmailAlternative: '/api/Auth/ConfirmTokenAccessEmailAlternativeAsync'
  },
  
  // User endpoints
  user: {
    create: '/api/User/CreateUserAsync',
    getAll: '/api/User/GetAllUsersAsync',
    getById: '/api/User/GetUserAsync',
    update: '/api/User/UpdateUserAsync',
    delete: '/api/User/DeleteUserAsync',
    addPermissions: '/api/User/AddUsersPermissionsAsync',
    addAlternativeEmail: '/api/User/AddUsersAlternativeEmailAsync',
    getAllAlternativeEmails: '/api/User/GetAllUserEmalAlternativeAsync',
    deleteAlternativeEmail: '/api/User/DeleteUserAlternativeEmailAsync',
    sendEmailTokenResetPassword: '/api/User/SendEmailTokenRessetPasswordAsync',
    updateEmailPrimary: '/api/User/UpdateUserEmailPrimaryAsync'
  },
  
  // Attendance endpoints
  attendance: {
    addReservation: '/api/Attendance/AddAttendanceReservationAsync',
    getReservationByDay: '/api/Attendance/GetReservationbyDayAsync',
    getAttendance: '/api/Attendance/GetAttendanceAsync',
    updateVisitStatus: '/api/Attendance/UpdateVisitStatusAsync',
    updateReservation: '/api/Attendance/UpdateAttendanceReservationAsync',
    deleteReservation: '/api/Attendance/DeleteAttendanceReservationAsync'
  },
  
  // Calendar endpoints
  calendar: {
    getScheduleReservations: '/api/Calendar/GetScheduleReservationsAsync',
    getDigitalSessionsRecorded: '/api/Calendar/GetDigitalSessionsRecordedAsync'
  },
  
  // Catalog endpoints
  catalog: {
    create: '/api/Catalog/CreateCatalogAsync',
    getAll: '/api/Catalog/GetAllCatalogsAsync',
    getAllPublic: '/api/Catalog/GetAllCatalogsPublicAsync',
    getById: '/api/Catalog/GetCatalogAsync',
    update: '/api/Catalog/UpdateCatalogAsync',
    delete: '/api/Catalog/DeleteCatalogAsync'
  },
  
  // Cost endpoints
  cost: {
    create: '/api/Cost/CreateCostAsync',
    getAll: '/api/Cost/GetAllCostsAsync',
    getById: '/api/Cost/GetCostAsync',
    update: '/api/Cost/UpdateCostAsync',
    archive: '/api/Cost/ArchiveCostsAsync',
    delete: '/api/Cost/DeleteCostAsync',
    updateTicketPrice: '/api/Cost/UpdateTicketPriceAsync',
    getAllTicketPrices: '/api/Cost/GetAllTicketPricesAsync'
  },
  
  // Document endpoints
  document: {
    uploadReservation: '/api/Document/UploadReservationDocumentAsync',
    getReservationDocuments: '/api/Document/GetReservationDocumentsAsync',
    getFileBinary: '/api/Document/GetFileBinary',
    updateReservation: '/api/Document/UpdateReservationsDocumentAsync',
    deleteReservation: '/api/Document/DeleteReservationsDocumentAsync'
  },
  
  // Form endpoints
  form: {
    getAllFormTypes: '/api/Form/GetAllFormTypesAsync',
    getAllFormTypesAsyn: '/api/Form/GetAllFormTypesAsyn',
    createFormType: '/api/Form/CreateFormTypeAsync',
    getFormTypeById: '/api/Form/GetFormTypeAsync',
    updateFormType: '/api/Form/UpdateFormTypeAsync',
    updateFormTypeEnableStatus: '/api/Form/UpdateFormTypeEnableStatusAsync',
    deleteFormType: '/api/Form/DeleteFormTypeAsync',
    getAllSchedulesByDay: '/api/Form/GetAllSchedulesByDayAsync',
    getAllDays: '/api/Form/GetAllDaysAsync',
    updateScheduleEnableStatus: '/api/Form/UpdateScheduleEnableStatusAsync',
    updateAllSchedulesEnableStatus: '/api/Form/UpdateAllScehdulesEnableStatusAsync',
    createCustomRule: '/api/Form/CreateCustomRuleAsync',
    deleteCustomRule: '/api/Form/DeleteCustomRuleAsync',
    getAllTimeSlots: '/api/Form/GetAllTimeSlotsAsync',
    getCustomRuleByDate: '/api/Form/GetCustomRuleByDateAsync',
    getCustomRuleSchedulesByDate: '/api/Form/GetCustomRuleSchedulesByDateAsync',
    getValidationRules: '/api/Form/GetValidationRulesAsync',
    getCustomRuleByDateRange: '/api/Form/GetCustomRuleByDateRangeAsync',
    resetCustomRuleOverSlot: '/api/Form/ResetCustomRuleOverSlotAsync',
    updateCustomRuleTimeSlotStatus: '/api/Form/UpdateCustomRuleTimeSlotStatusAsync',
    getAvailabilityTypes: '/api/Form/GetAvailabilityTypesAsync',
    getDayAvailability: '/api/Form/GetDayAvailabilityAsync',
    getMonthlyAvailability: '/api/Form/GetMonthlyAvailabilityAsync',
    updateOverSlot: '/api/Form/UpdateOverSlotAsync',
    // DocumentRequest endpoints (submódulo de Form)
    documentRequest: {
      getAll: '/api/Form/DocumentRequest/GetAllDocumentRequestsAsync',
      getById: '/api/Form/DocumentRequest/GetDocumentRequestAsync',
      create: '/api/Form/DocumentRequest/CreateDocumentRequestAsync',
      update: '/api/Form/DocumentRequest/UpdateDocumentRequestAsync',
      enable: '/api/Form/DocumentRequest/EnableDocumentRequestAsync',
      disable: '/api/Form/DocumentRequest/DisableDocumentRequestAsync',
      delete: '/api/Form/DocumentRequest/DeleteDocumentRequestAsync'
    }
  },
  
  // Employee endpoints
  employee: {
    create: '/api/Employee/CreateEmployeeAsync',
    getAll: '/api/Employee/GetAllEmployeesAsync',
    getById: '/api/Employee/GetEmployeeAsync',
    update: '/api/Employee/UpdateEmployeeAsync',
    delete: '/api/Employee/DeleteEmployeeAsync'
  },
  
  // Historic endpoints
  historic: {
    create: '/api/Historic/CreateHistoricAsync',
    getAll: '/api/Historic/GetAllHistoricsAsync',
    getById: '/api/Historic/GetHistoricAsync',
    update: '/api/Historic/UpdateHistoricAsync',
    delete: '/api/Historic/DeleteHistoricAsync'
  },
  
  // Module endpoints
  module: {
    create: '/api/Module/CreateModuleAsync',
    createPermission: '/api/Module/CreateModulePermissionAsync',
    createRoleAccess: '/api/Module/CreateModuleRoleAccessAsync',
    createRolePermission: '/api/Module/CreateModulesRolePermissionsAsync',
    getAll: '/api/Module/GetAllModulesAsync',
    getAllPermissions: '/api/Module/GetAllModulesPermissionAsync',
    getAllRoleAccess: '/api/Module/GetAllModulesRoleAccessAsync',
    getAllRolePermissions: '/api/Module/GetAllModulesRolePermissionsAsync',
    update: '/api/Module/UpdateModuleAsync',
    updatePermission: '/api/Module/UpdateModulePermissionAsync',
    updateRoleAccess: '/api/Module/UpdateModulesRoleAccessAsync',
    activateRolePermission: '/api/Module/ActivateModulesRolePermissionsAsync',
    delete: '/api/Module/DeleteModuleAsync',
    deletePermission: '/api/Module/DeleteModulePermissionAsync',
    deleteRoleAccess: '/api/Module/DeleteModuleRoleAccessAsync',
    deleteRolePermission: '/api/Module/DeleteModuleRolePermissionsAsync'
  },
  
  // Payment endpoints
  payment: {
    add: '/api/Payment/AddPaymentAsync',
    getAll: '/api/Payment/GetAllPaymentsAsync',
    update: '/api/Payment/UpdatePaymentAsync',
    delete: '/api/Payment/DeletePaymentAsync'
  },
  
  // Promotion endpoints
  promotion: {
    create: '/api/Promotion/CreatePromotionAsync',
    createLinkingCode: '/api/Promotion/CreateLinkingCodeAsync',
    getAllLinkingCodes: '/api/Promotion/GetAllLinkingCodesAsync/',
    getLinkingCode: '/api/Promotion/GetLinkingCodeAsync',
    updateLinkingCode: '/api/Promotion/UpdateLinkingCodeAsync',
    deleteLinkingCode: '/api/Promotion/DeleteLinkingCodeAsync',
    activateLinkingCode: '/api/Promotion/ActivateLinkingCodeAsync',
    getAll: '/api/Promotion/GetAllPromotionsAsync',
    update: '/api/Promotion/UpdatePromotionAsync',
    archive: '/api/Promotion/ArchivePromotionsAsync',
    delete: '/api/Promotion/DeletePromotionAsync'
  },
  
  // Reservation endpoints
  reservation: {
    create: '/api/Attendance/AddAttendanceReservationAsync',
    getAll: '/api/Attendance/GetAttendanceAsync',
    getSchools: '/api/Catalog/GetAllCatalogsPublicAsync',
    getAllReservations: '/api/Reservation/GetAllReservationsAsync',
    getReservationCost: (reservationId: number) => `/api/Reservation/cost/${reservationId}`,
    createReservationGeneralStep1: '/api/Reservation/CreateReservationGeneralStep1Async',
    updateReservationGeneralStep1: '/api/Reservation/UpdateReservationGeneralStep1Async',
    updateReservationGeneralStep2: '/api/Reservation/UpdateReservationGeneralStep2Async',
    updateReservationGeneralStep3: '/api/Reservation/UpdateReservationGeneralStep3Async',
    getAllReservationGenerals: '/api/Reservation/GetAllReservationGeneralsAsync',
    getAllReservationGeneralObjectiveVisit: '/api/Reservation/GetAllReservationGeneralObjectiveVisitAsync',
    getReservationGeneralStep1: (reservationId: number) => `/api/Reservation/GetAllReservationGeneralStep1Async/${reservationId}`,
    getReservationGeneralStep2: (reservationId: number) => `/api/Reservation/GetAllReservationGeneralStep2Async/${reservationId}`,
    getReservationGeneralStep3: (reservationId: number) => `/api/Reservation/GetAllReservationGeneralStep3Async/${reservationId}`,
    getPostcardMaterialLinks: (reservationId: number) => `/api/ReservationDidacticMaterial/GetReservationSheetsPostcards/${reservationId}`,
    getVisitMenu: (reservationId: number) => `/api/Reservation/GetVisitMenu/${reservationId}`,
    getVisitMenuPdf: (reservationId: number) => `/api/Reservation/GetVisitMenuPdf/${reservationId}`,
    getSheetsAndPostcardsPdf: (materialId: number) => `/api/ReservationDidacticMaterial/GetSheetsAndPostcardsPdf/${materialId}`,

    // School reservation endpoints
    school: {
      createReservationSchoolsStep1: '/api/Reservation/CreateReservationSchoolsStep1Async',
      updateReservationSchoolsStep1: '/api/Reservation/UpdateReservationSchoolsStep1Async',
      updateReservationSchoolsStep2: '/api/Reservation/UpdateReservationSchoolsStep2Async',
      updateReservationSchoolsStep3: '/api/Reservation/UpdateReservationSchoolsStep3Async',
      getAllReservationSchoolObjectiveVisit: '/api/Reservation/GetAllReservationSchoolObjectiveVisitAsync',
      getReservationSchoolStep1: (reservationId: number) => `/api/Reservation/GetAllReservationSchoolStep1Async/${reservationId}`,
      getReservationSchoolStep2: (reservationId: number) => `/api/Reservation/GetAllReservationSchoolStep2Async/${reservationId}`,
      getReservationSchoolStep3: (reservationId: number) => `/api/Reservation/GetAllReservationSchoolStep3Async/${reservationId}`,
      getAllReservationSchoolAcademicLevels: '/api/Reservation/GetAllReservationSchoolAcademicLevelsAsync',
      checkReservationSchoolHasDisability: (reservationId: number) => `/api/Reservation/GetCheckReservationSchoolHasDisabilityAsync/${reservationId}`
    },
    
    // Company reservation endpoints
    company: {
      createStep1: '/api/Reservation/CreateReservationCompanyStep1Async',
      updateStep1: '/api/Reservation/UpdateReservationCompanyStep1Async',
      updateStep2: '/api/Reservation/UpdateReservationCompanyStep2Async',
      updateStep3: '/api/Reservation/UpdateReservationCompanyStep3Async',
      getStep1: (reservationId: number) => `/api/Reservation/GetReservationCompanyStep1Async/${reservationId}`,
      getStep2: (reservationId: number) => `/api/Reservation/GetReservationCompanyStep2Async/${reservationId}`,
      getStep3: (reservationId: number) => `/api/Reservation/GetReservationCompanyStep3Async/${reservationId}`,
      getAll: '/api/Reservation/GetAllReservationCompaniesAsync',
      getStats: '/api/Reservation/GetReservationCompanyStatsAsync',
      checkHasDisability: (reservationId: number) => `/api/Reservation/GetCheckReservationHasDisability/${reservationId}`
    },
    
    // Summer Course reservation endpoints
    summerCourse: {
      createStep1: '/api/Reservation/CreateReservationSummerCourseStep1Async',
      updateStep1: '/api/Reservation/UpdateReservationSummerCourseStep1Async',
      updateStep2: '/api/Reservation/UpdateReservationSummerCourseStep2Async',
      updateStep3: '/api/Reservation/UpdateReservationSummerCourseStep3Async',
      getAll: '/api/Reservation/GetAllReservationSummerCourseAsync',
      getStats: '/api/Reservation/GetReservationSummerCourseStatsAsync',
      getStep1: (reservationId: number) => `/api/Reservation/GetReservationSummerCourseStep1Async/${reservationId}`,
      getStep2: (reservationId: number) => `/api/Reservation/GetReservationSummerCourseStep2Async/${reservationId}`,
      getStep3: (reservationId: number) => `/api/Reservation/GetReservationSummerCourseStep3Async/${reservationId}`,
      checkHasDisability: (reservationId: number) => `/api/Reservation/GetCheckReservationHasDisability/${reservationId}`
    },

    confirmReservation: '/api/Reservation/ConfirmNewReservationAsync',
    cancelReservation: '/api/Reservation/CancelReservationAsync',
    getReservationQR: (reservationId: number) => `/api/Reservation/GetReservationQRAsync/${reservationId}`,
    
    
    // Documents endpoints
    documents: {
      upload: '/api/ReservationDocuments/UploadAsync',
      getAll: '/api/ReservationDocuments/GetAllAsync',
      get: '/api/ReservationDocuments/GetAsync',
      delete: '/api/ReservationDocuments/DeleteAsync'
    }
  },
  
  // Role endpoints
  role: {
    create: '/api/Role/CreateRolesAsync',
    addUser: '/api/Role/AddRollUserAsync',
    addClaims: '/api/Role/AddRoleClaimsAsync',
    getAll: '/api/Role/GetAllRolesAsync',
    getAllClaims: '/api/Role/GetAllRoleClaimsAsync',
    getAllUsers: '/api/Role/GetAllRoleUsersAsync',
    update: '/api/Role/UpdateRoleAsync',
    updateClaims: '/api/Role/UpdateRoleClaimsAsync',
    delete: '/api/Role/DeleteRoleAsync',
    deleteClaims: '/api/Role/DeleteRoleClaimsAsync',
    deleteUser: '/api/Role/DeleteRoleUserAsync'
  },
  
  // Schedule endpoints
  schedule: {
    addAvailability: '/api/Schedule/AddAvailabilityScheduleAsync',
    getAvailability: '/api/Schedule/GetAvailabilityScheduleAsync',
    updateAvailability: '/api/Schedule/UpdateAvailabilityScheduleAsync',
    deleteAvailability: '/api/Schedule/DeleteAvailabilityScheduleAsync'
  },
  
  // System endpoints
  system: {
    multilanguage: '/api/System/Multilanguage',
    sendEmail: '/api/System/SendEmailAsync'
  },
  
  // Video endpoints
  video: {
    getAll: '/api/Video/GetAllVideosAsync',
    getById: '/api/Video/GetVideoAsync',
    upload: '/api/Video/UploadVideoAsync',
    update: '/api/Video/UpdateVideoAsync',
    delete: '/api/Video/DeleteVideoAsync',
    duplicate: '/api/Video/DuplicateVideoAsync',
    toggleVisibility: '/api/Video/ToggleVisibilityVideoAsync',
    getVideoFile: '/api/Video/GetVideoFile',
    getAllSections: '/api/Video/GetAllSectionsAsync'
  },
  
  // Visitor endpoints
  visitor: {
    create: '/api/Visitor/CreateVisitorAsync',
    getAll: '/api/Visitor/GetAllVisitorsAsync',
    update: '/api/Visitor/UpdateVisitorAsync',
    delete: '/api/Visitor/DeleteVisitorAsync',
    createCompany: '/api/Visitor/CreateVisitorCompanyAsync',
    deleteCompany: '/api/Visitor/DeleteVisitorCompanyAsync',
    getAllCompanies: '/api/Visitor/GetAllVisitorCompaniesAsync',
    getAllInstitutions: '/api/Visitor/GetAllVisitorInstitutionsAsync',
    deleteInstitution: '/api/Visitor/DeleteVisitorInstitutionAsync',
    addInstitution: '/api/Visitor/CreateVisitorInstitutionAsync'
  },
  
  // Postal Code endpoints
  postalCode: {
    getAll: '/api/PostalCode/GetAllPostalCodeAsync'
  },
  
  // Institution endpoints
  institution: {
    create: '/api/Institution/CreateInstitutionAsync',
    update: '/api/Institution/UpdateInstitutionAsync',
    delete: '/api/Institution/DeleteInstitutionAsync',
    getById: '/api/Institution/GetInstitutionAsync',
    getAllCCTFilter: '/api/Institution/GetAllInstitutionCCTbyFilterAsync',
    getAllMunicipalities: '/api/Institution/GetAllInstitutionMunicipalityAsync',
    getAllLocalities: '/api/Institution/GetAllInstitutionLocalityAsync',
    getAll: '/api/Institution/GetAllInstitutionsAsync',
    getAllCCT: '/api/Institution/GetAllInstitutionCCTAsync'
  },
  
  // Municipality endpoints
  municipality: {
    getAll: '/api/Municipality/GetAllMunicipalitiesAsync'
  ,},

  // Workshop endpoints
  workshop: {
    getAllWorkShop: '/api/WorkShop/GetAllWorkShopAsync'
  },

  // Notification endpoints
  notifications: {
    getAll: '/api/ReservationNotifications/GetAllAsync',
    getUnreadCount: '/api/ReservationNotifications/GetUnreadCountAsync',
    markAsRead: '/api/ReservationNotifications/MarkAsReadAsync',
    delete: '/api/ReservationNotifications/DeleteAsync'
  }

} as const

export type ApiEndpoint = typeof API_ENDPOINTS 