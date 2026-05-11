import { useState } from "react";
import api from "../lib/api";

export interface ClassBookingDTO {
  id: string;
  sessionId: string;
  memberId: string;
  status: string;
  bookedAt: string;
  waitlistPosition?: number;
}

export function useBookClass() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState<string | null>(null);

  const bookClass = async (sessionId: string): Promise<ClassBookingDTO> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.post<{ data: ClassBookingDTO }>("/api/v1/classes/bookings", { sessionId });
      return res.data.data;
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? "Booking failed";
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return { bookClass, isLoading, error };
}
