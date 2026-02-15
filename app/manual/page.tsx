"use client"

import { AuthenticatedLayout } from "@/components/authenticated-layout"
import { ManualContent } from "@/components/manual-content"

export default function ManualPage() {
  return (
    <AuthenticatedLayout>
      <ManualContent />
    </AuthenticatedLayout>
  )
}
