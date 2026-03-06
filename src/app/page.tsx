import LemonadeMenu from '@/components/LemonadeMenu'

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-6xl font-bold text-lemon-800 mb-4">
          🍋 Sweet Lemonade Stand 🍋
        </h1>
        <p className="text-xl text-lemon-700">
          Fresh squeezed lemonade with modern payments!
        </p>
      </div>
      
      <div className="max-w-4xl mx-auto">
        <LemonadeMenu />
      </div>
    </main>
  )
}