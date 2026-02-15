"use client"

import { AuthenticatedLayout } from "@/components/authenticated-layout"
import { ApreensoesContent } from "@/components/apreensoes-content"

export default function ApreensoesPage() {
  return (
    <AuthenticatedLayout>
      <ApreensoesContent />
    </AuthenticatedLayout>
  )
}
