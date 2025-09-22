import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Control de Comportamiento
          </h1>
          <p className="mt-2 text-gray-600">
            Sistema de gestión de incidentes estudiantiles
          </p>
        </div>
        <div className="space-y-4">
          <Link
            href="/auth"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Iniciar Sesión
          </Link>
        </div>
      </div>
    </main>
  )
}
