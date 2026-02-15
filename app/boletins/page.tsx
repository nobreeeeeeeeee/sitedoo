"use client"

import { AuthenticatedLayout } from "@/components/authenticated-layout"
import { BoletinsContent } from "@/components/boletins-content"

export default function BoletinsPage() {
  return (
    <AuthenticatedLayout>
      <BoletinsContent />
    </AuthenticatedLayout>
  )
}
