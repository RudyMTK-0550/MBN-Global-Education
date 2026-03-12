import { useState, useEffect } from 'react'

export default function SplashScreen({ onFinish }) {
  const [phase, setPhase] = useState('logo') // logo → expand → done

  useEffect(() => {
    // Phase 1 : Le logo apparait et pulse
    const t1 = setTimeout(() => setPhase('expand'), 2000)
    // Phase 2 : Animation d'expansion puis disparition
    const t2 = setTimeout(() => setPhase('done'), 3000)
    // Phase 3 : Callback fin
    const t3 = setTimeout(() => onFinish(), 3400)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [onFinish])

  if (phase === 'done') return null

  return (
    <div className={`splash ${phase}`} onClick={() => { setPhase('expand'); setTimeout(() => { setPhase('done'); onFinish() }, 500) }}>
      <div className="splash-bg" />

      <div className="splash-content">
        <div className="splash-logo-wrap">
          <img src="/logombn.png" alt="MBN Global Education" className="splash-logo" />
          <div className="splash-ring" />
          <div className="splash-ring splash-ring-2" />
        </div>

        <div className="splash-text">
          <h1 className="splash-title">MBN Global</h1>
          <h2 className="splash-subtitle">Education</h2>
        </div>

        <p className="splash-hint">Cliquez pour continuer</p>
      </div>

      <div className="splash-particles">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="splash-particle" style={{
            '--delay': `${i * 0.2}s`,
            '--x': `${Math.random() * 100}%`,
            '--y': `${Math.random() * 100}%`,
            '--size': `${4 + Math.random() * 8}px`,
          }} />
        ))}
      </div>
    </div>
  )
}
