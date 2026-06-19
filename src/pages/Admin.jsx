import { useEffect } from 'react'

export default function Admin() {
  useEffect(() => {
    // Redireciona para o painel admin HTML
    window.location.href = '/admin.html'
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecionando para o painel admin...</p>
      </div>
    </div>
  )
}
