import { createFileRoute } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"

export const Route = createFileRoute("/")({ component: App })

function App() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Button>Get Started</Button>
    </div>
  )
}
