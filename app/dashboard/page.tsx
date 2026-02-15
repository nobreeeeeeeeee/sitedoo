"use client"

import { AuthenticatedLayout } from "@/components/authenticated-layout"
import { DashboardContent } from "@/components/dashboard-content"

export default function DashboardPage() {
  return (
    <AuthenticatedLayout>
      <DashboardContent />
    </AuthenticatedLayout>
  )
}
