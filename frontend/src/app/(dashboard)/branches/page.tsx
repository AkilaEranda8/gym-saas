"use client";
import Header from "@/components/Header";
import ComingSoon from "@/components/ComingSoon";
import { Building2 } from "lucide-react";
export default function BranchesPage() {
  return <div><Header title="Branches" /><ComingSoon title="Branch Management" description="Create and manage gym branches, assign managers, and configure opening hours." icon={Building2} /></div>;
}
