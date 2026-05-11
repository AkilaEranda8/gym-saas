import { useState, useEffect, useCallback } from "react";
import api from "../lib/api";

export type ClassType =
  | "YOGA" | "HIIT" | "ZUMBA" | "PILATES" | "BOXING"
  | "SPINNING" | "STRENGTH" | "MEDITATION"
  | "DANCE" | "CARDIO" | "CROSSFIT" | "OTHER";

export type ClassDifficulty = "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "ALL_LEVELS";
export type SessionStatus    = "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
export type BookingStatus    = "BOOKED" | "ATTENDED" | "CANCELLED" | "NO_SHOW" | "WAITLISTED";

export interface ClassSessionDTO {
  id: string;
  classId: string;
  gymId: string;
  className: string;
  classType: ClassType;
  classColor: string;
  trainerName?: string;
  room?: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  actualCapacity: number;
  bookedCount: number;
  availableSlots: number;
  waitlistCount: number;
  status: SessionStatus;
  fillPercentage: number;
  isFull: boolean;
  isUserBooked: boolean;
  userBookingStatus?: BookingStatus;
}

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function useClassSchedule(date: Date) {
  const [sessions, setSessions] = useState<ClassSessionDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dateStr = toISODate(date);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get<{ data: ClassSessionDTO[] }>(
        `/api/v1/classes/sessions/day?date=${dateStr}`
      );
      setSessions(res.data.data ?? []);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Failed to load schedule");
    } finally {
      setIsLoading(false);
    }
  }, [dateStr]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { sessions, isLoading, error, refetch };
}
