import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

export default function Landing() {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="landing">
      <div className="landing-bg">
        <div className="landing-bg-circle c1" />
        <div className="landing-bg-circle c2" />
        <div className="landing-bg-circle c3" />
      </div>

      <button className="landing-theme-toggle" onClick={toggleTheme} title="Changer le thème">
        {theme === 'light' ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
        )}
      </button>

      <div className="landing-content">
        <div className="landing-logo-img-wrap">
          <img src="/logombn.png" alt="MBN Global Education" className="landing-logo-img" />
        </div>

        <h1 className="landing-title">
          Bienvenue sur <span className="landing-blue">MBN Global</span> Education
        </h1>

        <p className="landing-subtitle">
          La plateforme unifiée pour les étudiants, enseignants et campus du groupe MBN.
          Connectez-vous, collaborez et réussissez ensemble.
        </p>

        <div className="landing-features">
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <h3>Communauté</h3>
            <p>Rejoignez des clubs et connectez-vous avec vos camarades</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </div>
            <h3>Événements</h3>
            <p>Participez aux événements et activités du campus</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </div>
            <h3>Messagerie</h3>
            <p>Échangez en temps réel avec la communauté MBN</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
            </div>
            <h3>Todo List</h3>
            <p>Organisez vos cours, devoirs et projets efficacement</p>
          </div>
        </div>

        <div className="landing-actions">
          <Link to="/connexion" className="btn btn-primary btn-lg">
            Se connecter
          </Link>
          <Link to="/inscription" className="btn btn-outline btn-lg">
            Créer un compte
          </Link>
        </div>

        <div className="landing-campuses">
          <span>Nos campus :</span>
          <div className="campus-tags">
            <span className="campus-tag">Lyon</span>
            <span className="campus-tag">Paris</span>
            <span className="campus-tag">Dakar</span>
            <span className="campus-tag">Douala</span>
          </div>
        </div>
      </div>

      <footer className="landing-footer">
        <img src="/logombn.png" alt="" className="footer-logo" />
        <span>MBN Global Education &copy; 2026 — Tous droits réservés</span>
      </footer>
    </div>
  )
}
