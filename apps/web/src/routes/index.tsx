import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/")({ component: App })

function App() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Iron Giant</p>
    </div>
  )
}
