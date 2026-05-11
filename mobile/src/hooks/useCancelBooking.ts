import { useState } from "react";
import api from "../lib/api";

export function useCancelBooking() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState<string | null>(null);

  const cancelBooking = async (bookingId: string, reason?: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      await api.delete(`/api/v1/classes/bookings/${bookingId}`, {
        data: { reason },
      });
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? "Cancellation failed";
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return { cancelBooking, isLoading, error };
}
