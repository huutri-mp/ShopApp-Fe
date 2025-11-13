import { ChevronRight } from "lucide-react"
import Image from "next/image"

export default function Hero() {
  return (
    <div className="bg-gradient-to-br from-red-400 to-red-600 text-white py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-balance">Winter Sale</h1>
          <p className="text-xl md:text-2xl mb-6 text-red-100">Up to 50% off</p>
          <button className="bg-white text-red-600 px-8 py-3 rounded-lg font-semibold hover:bg-red-50 transition-colors flex items-center gap-2">
            Shop now
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <div className="relative h-80 md:h-96">
          <Image src="/wireless-headphones.png" alt="Winter Sale Hero" fill className="object-contain" />
        </div>
      </div>
    </div>
  )
}
