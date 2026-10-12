import { SignupForm } from "@/components/ui/signup-form"

export default function SignupPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10 bg-gray-50/50">
      <div className="w-full max-w-sm">
        <SignupForm />
      </div>
    </div>
  )
}