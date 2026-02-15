"use client"

import { AuthenticatedLayout } from "@/components/authenticated-layout"
import { AdminContent } from "@/components/admin-content"

export default function AdminPage() {
  return (
    <AuthenticatedLayout>
      <AdminContent />
    </AuthenticatedLayout>
  )
}
