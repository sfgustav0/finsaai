import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar, FloatingTrigger } from "@/components/ui/app_sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full">
        <FloatingTrigger />
        {children}
      </main>
    </SidebarProvider>
  )
}