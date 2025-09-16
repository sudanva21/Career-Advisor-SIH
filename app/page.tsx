import Hero from '@/components/Hero'
import FeatureCards from '@/components/FeatureCards'

export default function Home() {
  return (
    <main className="relative min-h-screen" style={{ background: '#0B0E17' }}>
      <Hero />
      <FeatureCards />
    </main>
  )
}