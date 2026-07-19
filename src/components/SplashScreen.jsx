import React, { useState, useEffect } from 'react'

export default function SplashScreen({ onFinish, userName }) {
  const [progress, setProgress] = useState(0)
  const [phase, setPhase] = useState(0) // 0: logo appear, 1: loading, 2: welcome, 3: fade out

  useEffect(() => {
    // Phase 0: Logo appears (0.5s)
    const t1 = setTimeout(() => setPhase(1), 500)
    // Phase 1: Progress bar fills (1.5s)
    const t2 = setTimeout(() => setPhase(2), 2000)
    // Phase 2: Welcome message (1s)
    const t3 = setTimeout(() => setPhase(3), 3000)
    // Phase 3: Fade out and finish (0.5s)
    const t4 = setTimeout(() => onFinish(), 3500)

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4) }
  }, [onFinish])

  useEffect(() => {
    if (phase >= 1) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) { clearInterval(interval); return 100 }
          return prev + 2
        })
      }, 25)
      return () => clearInterval(interval)
    }
  }, [phase])

  return (
    <div className={`fixed inset-0 z-[100] bg-dark-900 flex flex-col items-center justify-center transition-opacity duration-500 ${phase === 3 ? 'opacity-0' : 'opacity-100'}`}>
      {/* Background gradient circles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pix-500/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '0.5s'}} />
      </div>

      {/* Content */}
      <div className={`relative z-10 flex flex-col items-center transition-all duration-700 ${phase >= 0 ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
        {/* Logo */}
        <div className={`bg-white rounded-2xl p-5 mb-6 shadow-lg transition-all duration-700 ${phase >= 1 ? 'shadow-glow-blue' : ''}`}>
          <img src="/img/180x120px.png" alt="Parcelyx" className="h-16 w-auto object-contain" />
        </div>

        {/* Loading text */}
        <p className={`text-gray-400 text-sm mb-4 transition-all duration-500 ${phase >= 1 ? 'opacity-100' : 'opacity-0'}`}>
          Preparando seu painel...
        </p>

        {/* Progress bar */}
        <div className={`w-48 h-1.5 bg-dark-700 rounded-full overflow-hidden mb-6 transition-all duration-500 ${phase >= 1 ? 'opacity-100' : 'opacity-0'}`}>
          <div
            className="h-full bg-gradient-to-r from-primary-500 to-pix-500 rounded-full transition-all duration-100 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Welcome message */}
        <div className={`text-center transition-all duration-500 ${phase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <p className="text-lg font-semibold text-white">
            Olá, {userName || 'Usuário'}! 👋
          </p>
          <p className="text-sm text-gray-400 mt-1">Bom te ver de volta</p>
        </div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary-400/30 rounded-full animate-float"
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
              animationDuration: `${3 + i * 0.5}s`,
              animationDelay: `${i * 0.3}s`,
            }}
          />
        ))}
      </div>
    </div>
  )
}
