import { ref } from 'vue';
import { useReservationOperations } from '@/composables/reservations/useReservationOperations';

export interface ReservationStatus {
  id: number;
  status: string;
  isConfirmed: boolean;
}

export interface CancellationResult {
  success: boolean;
  message?: string;
}

/**
 * ID del tipo de cancelación por defecto
 * Todos los tipos de cancelación usan el mismo ID según el catálogo de la BD
 */
const DEFAULT_CANCELLATION_TYPE_ID = 1621;

export const useCancelReservation = () => {
  const showCancelDialog = ref(false);
  const showConfirmedCancelDialog = ref(false);
  const currentReservationId = ref<number | null>(null);

  // Usar el composable de operaciones de reservaciones
  const { cancelReservation: cancelReservationApi } = useReservationOperations();

  /**
   * Closes all cancel dialogs
   */
  const closeCancelDialogs = () => {
    showCancelDialog.value = false;
    showConfirmedCancelDialog.value = false;
    currentReservationId.value = null;
  };

  /**
   * Helper para procesar el resultado de la API y retornar un CancellationResult
   */
  const processCancellationResult = (result: any): CancellationResult => {
    const isSuccess = result?.success || result?.isValid;

    if (isSuccess) {
      console.log('✅ Reservación cancelada exitosamente');
      closeCancelDialogs();
      return {
        success: true,
        message: result.comments || result.message || 'Reservación cancelada exitosamente'
      };
    } else {
      console.error('❌ Error al cancelar:', result?.comments || result?.message);
      return {
        success: false,
        message: result?.comments || result?.message || 'Error al cancelar la reservación'
      };
    }
  };

  /**
   * Opens the appropriate cancel dialog based on reservation status
   */
  const openCancelDialog = (reservationId: number, status: ReservationStatus): void => {
    currentReservationId.value = reservationId;

    // Mostrar el diálogo apropiado según el estado de la reservación
    if (status.isConfirmed || status.status === 'Confirmada') {
      showConfirmedCancelDialog.value = true;
      showCancelDialog.value = false;
    } else {
      showCancelDialog.value = true;
      showConfirmedCancelDialog.value = false;
    }
  };

  /**
   * Handles cancellation option for non-confirmed reservations
   */
  const handleCancellationOption = async (): Promise<CancellationResult> => {
    try {
      if (!currentReservationId.value) {
        console.error('❌ No hay ID de reservación para cancelar');
        return {
          success: false,
          message: 'No se pudo identificar la reservación'
        };
      }

      console.log('🔄 Cancelando reservación:', currentReservationId.value);

      // Llamar al API para cancelar la reservación
      const result = await cancelReservationApi(currentReservationId.value, DEFAULT_CANCELLATION_TYPE_ID);

      return processCancellationResult(result);
    } catch (error) {
      console.error('❌ Error en handleCancellationOption:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error al cancelar la reservación'
      };
    }
  };

  /**
   * Handles cancellation for confirmed reservations
   */
  const handleConfirmedCancellation = async (
    reservationId: number,
    reasonId: number
  ): Promise<CancellationResult> => {
    try {
      console.log('🔄 Cancelando reservación confirmada:', { reservationId, reasonId });

      // Llamar al API para cancelar la reservación confirmada
      const result = await cancelReservationApi(reservationId, reasonId);

      return processCancellationResult(result);
    } catch (error) {
      console.error('❌ Error en handleConfirmedCancellation:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error al cancelar la reservación'
      };
    }
  };

  return {
    showCancelDialog,
    showConfirmedCancelDialog,
    openCancelDialog,
    closeCancelDialogs,
    handleCancellationOption,
    handleConfirmedCancellation,
  };
};

