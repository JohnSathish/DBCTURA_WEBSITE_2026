import BloodDonorForm from "@/components/blood-donors/BloodDonorForm"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export default async function BloodDonorsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <header className="space-y-4 text-center">
          <h1 className="text-4xl font-bold text-rose-900">Blood Donor Registration</h1>
          <p className="text-slate-600 max-w-3xl mx-auto">
            Sign up to join the Don Bosco College blood donor network. Provide accurate details so we can reach you
            quickly when there is an urgent need that matches your blood group.
          </p>
        </header>

        <div className="bg-white/90 backdrop-blur rounded-3xl border border-rose-100 shadow-xl p-6 sm:p-10">
          <BloodDonorForm />
        </div>
      </div>
    </div>
  )
}

