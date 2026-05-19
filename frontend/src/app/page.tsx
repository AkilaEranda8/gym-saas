"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authStorage } from "@/lib/auth";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    if (authStorage.isLoggedIn()) {
      router.replace("/dashboard");
    } else {
      router.replace("/login");
    }
  }, [router]);

  return null;
}
