import { useState, useEffect, useCallback } from "react";
import api from "../lib/api";
import { BookingStatus, ClassType } from "./useClassSchedule";

export interface MyBookingDTO {
  id: string;
  sessionId: string;
  memberId: string;
  className: string;
  classType: ClassType;
  classColor: string;
  trainerName?: string;
  room?: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  bookedAt: string;
  cancelledAt?: string;
  waitlistPosition?: number;
  attendedAt?: string;
}

export function useMyBookings() {
  const [upcoming, setUpcoming] = useState<MyBookingDTO[]>([]);
  const [past, setPast]         = useState<MyBookingDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [upRes, pastRes] = await Promise.all([
        api.get<{ data: { content: MyBookingDTO[] } }>("/api/v1/classes/bookings/my/upcoming?size=50"),
        api.get<{ data: { content: MyBookingDTO[] } }>("/api/v1/classes/bookings/my/history?size=50"),
      ]);
      setUpcoming(upRes.data.data?.content ?? []);
      setPast(pastRes.data.data?.content ?? []);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Failed to load bookings");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { upcoming, past, isLoading, error, refetch };
}
