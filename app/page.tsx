import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-800 text-slate-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to TaskZen</h1>
        <p className="text-xl mb-8">A minimalist Kanban-style productivity app</p>
        <Link 
          href="/taskzen" 
          className="bg-cyan-600 hover:bg-cyan-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
        >
          Open TaskZen Board
        </Link>
      </div>
    </div>
  )
}
