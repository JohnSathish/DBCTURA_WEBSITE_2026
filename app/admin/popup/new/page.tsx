import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import AdminLayout from "@/components/admin/AdminLayout"
import PopupForm from "@/components/admin/popup/PopupForm"

export default async function NewPopupPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/admin/login")
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Create New Popup</h1>
        <PopupForm />
      </div>
    </AdminLayout>
  )
}



