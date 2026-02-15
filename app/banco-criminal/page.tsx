"use client"

import { AuthenticatedLayout } from "@/components/authenticated-layout"
import { BancoCriminalContent } from "@/components/banco-criminal-content"

export default function BancoCriminalPage() {
  return (
    <AuthenticatedLayout>
      <BancoCriminalContent />
    </AuthenticatedLayout>
  )
}
