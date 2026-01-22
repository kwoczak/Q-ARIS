import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950 text-white p-4 text-center">
      <div className="max-w-2xl space-y-8">
        <h1 className="text-5xl font-bold tracking-tighter bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          WebAR Storytelling
        </h1>
        <p className="text-xl text-neutral-400">
          Create immersive, multimedia museum guides with Augmented Reality.
          No app installation required.
        </p>

        <div className="flex gap-4 justify-center">
          <Link href="/admin">
            <Button size="lg" className="bg-white text-black hover:bg-neutral-200">
              Enter CMS (Admin)
            </Button>
          </Link>
          <Button variant="outline" size="lg" className="text-white border-neutral-700 hover:bg-neutral-800">
            Learn More
          </Button>
        </div>
      </div>
    </div>
  )
}
