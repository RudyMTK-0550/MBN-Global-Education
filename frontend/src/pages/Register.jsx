import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { usersAPI } from '../services/api'

const ECOLES = [
  { value: '', label: 'Choisir une école' },
  { value: 'ESIIA', label: 'ESIIA — Informatique & Intelligence Artificielle' },
  { value: 'EMSP', label: 'EMSP — Executive Management School of Paris' },
  { value: 'ESMEP', label: 'ESMEP — Management & Entrepreneuriat' },
  { value: 'DCG Formations', label: 'DCG — Droit, Comptabilité, Gestion' },
  { value: 'ILMIS', label: 'ILMIS — Langues & Management Interculturel' },
  { value: 'ISMOD Paris', label: 'ISMOD — Mode et Luxe de Paris' },
  { value: 'ESETH', label: 'ESETH — Tourisme & Hôtellerie' },
  { value: 'ESUV', label: 'ESUV — Vente & Relation Client' },
  { value: 'ESMAS', label: 'ESMAS — Management du Sport' },
  { value: 'ESMOSS', label: 'ESMOSS — Management Sanitaire & Social' },
  { value: 'ESEA', label: 'ESEA — Énergies Alternatives & Développement Durable' },
  { value: 'ESART Paris', label: 'ESART — Art & Industries Créatives' },
  { value: 'CESCOM Paris', label: 'CESCOM — Études Supérieures Commerciales' },
]

const FORMATIONS = {
  'ESIIA': [
    'Développement Web & Mobile',
    'Intelligence Artificielle & Data Science',
    'Cybersécurité',
    'Systèmes & Réseaux',
    'Cloud Computing & DevOps',
  ],
  'EMSP': [
    'Management Général',
    'Commerce International',
    'Marketing Digital',
    'Finance d\'Entreprise',
    'Ressources Humaines',
    'Gestion de Projet',
  ],
  'ESMEP': [
    'Entrepreneuriat & Innovation',
    'Management des Organisations',
    'Business Development',
  ],
  'DCG Formations': [
    'Droit des Affaires',
    'Comptabilité & Gestion',
    'Finance & Audit',
    'Contrôle de Gestion',
  ],
  'ILMIS': [
    'Management Interculturel',
    'Langues Étrangères Appliquées',
    'Communication Internationale',
  ],
  'ISMOD Paris': [
    'Mode & Design',
    'Luxe & Brand Management',
    'Stylisme & Modélisme',
  ],
  'ESETH': [
    'Management Hôtelier',
    'Tourisme & Événementiel',
    'Restauration & Gastronomie',
  ],
  'ESUV': [
    'Techniques de Vente',
    'Relation Client & CRM',
    'Négociation Commerciale',
  ],
  'ESMAS': [
    'Management du Sport',
    'Marketing Sportif',
    'Événementiel Sportif',
  ],
  'ESMOSS': [
    'Management Sanitaire',
    'Gestion des Établissements Sociaux',
    'Santé Publique',
  ],
  'ESEA': [
    'Énergies Renouvelables',
    'Développement Durable',
    'Management Environnemental',
  ],
  'ESART Paris': [
    'Design Graphique',
    'Direction Artistique',
    'Industries Créatives & Digitales',
  ],
  'CESCOM Paris': [
    'Commerce & Distribution',
    'Marketing & Communication',
    'Management Commercial',
  ],
}

const CAMPUS = [
  { value: '', label: 'Choisir un campus' },
  { value: 'Paris-Torcy', label: 'Paris — Torcy' },
  { value: 'Paris-Évry', label: 'Paris — Évry' },
  { value: 'Paris-Noisiel', label: 'Paris — Noisiel' },
  { value: 'Lyon', label: 'Lyon' },
  { value: 'Yaoundé', label: 'Yaoundé — Cameroun' },
  { value: 'Campus à distance', label: 'Campus à distance' },
]

const NIVEAUX = [
  { value: '', label: 'Choisir un niveau' },
  { value: 'BTS 1ère année', label: 'BTS — 1ère année' },
  { value: 'BTS 2ème année', label: 'BTS — 2ème année' },
  { value: 'Bachelor 1', label: 'Bachelor — 1ère année' },
  { value: 'Bachelor 2', label: 'Bachelor — 2ème année' },
  { value: 'Bachelor 3', label: 'Bachelor — 3ème année' },
  { value: 'Mastère 1', label: 'Mastère — 1ère année' },
  { value: 'Mastère 2', label: 'Mastère — 2ème année' },
]

export default function Register() {
  const { register, updateUser } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    nom: '', prenom: '', email: '', password: '', confirm: '',
    ecole: '', formation: '', niveau: '', campus: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const fileInputRef = useRef(null)

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowed.includes(file.type)) {
      setError('Format photo non supporté. Utilisez JPG, PNG, GIF ou WebP')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('La photo ne doit pas dépasser 5 MB')
      return
    }
    setError('')
    setPhotoFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => setPhotoPreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'ecole') {
      setForm({ ...form, ecole: value, formation: '' })
    } else {
      setForm({ ...form, [name]: value })
    }
  }

  const availableFormations = form.ecole ? (FORMATIONS[form.ecole] || []) : []

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!photoFile) {
      setError('Une photo de profil est obligatoire')
      return
    }
    if (!form.nom || !form.prenom || !form.email || !form.password || !form.confirm) {
      setError('Tous les champs obligatoires doivent être remplis')
      return
    }
    if (form.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      return
    }
    if (form.password !== form.confirm) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    setLoading(true)
    try {
      await register(form)
      const res = await usersAPI.uploadPhoto(photoFile)
      updateUser(res.data.user)
      navigate('/accueil')
    } catch (err) {
      const data = err.response?.data
      if (data?.email) setError(data.email[0])
      else if (data?.confirm) setError(data.confirm[0])
      else if (data?.message) setError(data.message)
      else setError("Une erreur est survenue lors de l'inscription")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-bg-shape s1" />
        <div className="auth-bg-shape s2" />
        <div className="auth-bg-shape s3" />
      </div>

      <button className="landing-theme-toggle" onClick={toggleTheme} title="Changer le thème">
        {theme === 'light' ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
        )}
      </button>

      <div className="auth-card glass auth-card-wide">
        <div className="auth-header">
          <img src="/logombn.png" alt="MBN" className="auth-logo" />
          <h1>Créer un compte</h1>
          <p className="auth-subtitle">Rejoignez la communauté MBN Global Education</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="form-error">{error}</div>}

          <div className="register-photo-upload" onClick={() => fileInputRef.current?.click()}>
            <div className="register-photo-circle">
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" />
              ) : (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
              )}
            </div>
            <span className="register-photo-label">
              {photoPreview ? 'Changer la photo' : 'Ajouter une photo *'}
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handlePhotoSelect}
              style={{ display: 'none' }}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nom">Nom *</label>
              <input id="nom" name="nom" placeholder="Votre nom" value={form.nom} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="prenom">Prénom *</label>
              <input id="prenom" name="prenom" placeholder="Votre prénom" value={form.prenom} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input id="email" name="email" type="email" placeholder="votre@email.edu" value={form.email} onChange={handleChange} />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Mot de passe *</label>
              <input id="password" name="password" type="password" placeholder="Min. 6 caractères" value={form.password} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="confirm">Confirmer *</label>
              <input id="confirm" name="confirm" type="password" placeholder="Confirmer" value={form.confirm} onChange={handleChange} />
            </div>
          </div>

          <div className="form-divider"><span>Votre parcours</span></div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="ecole">École</label>
              <select id="ecole" name="ecole" value={form.ecole} onChange={handleChange}>
                {ECOLES.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="formation">Formation</label>
              <select id="formation" name="formation" value={form.formation} onChange={handleChange} disabled={!form.ecole}>
                <option value="">{ form.ecole ? 'Choisir une formation' : 'Sélectionnez d\'abord une école' }</option>
                {availableFormations.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="niveau">Niveau</label>
              <select id="niveau" name="niveau" value={form.niveau} onChange={handleChange}>
                {NIVEAUX.map(n => <option key={n.value} value={n.value}>{n.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="campus">Campus</label>
              <select id="campus" name="campus" value={form.campus} onChange={handleChange}>
                {CAMPUS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? <span className="spinner-sm" /> : "S'inscrire"}
          </button>
        </form>

        <p className="auth-link">
          Déjà inscrit ? <Link to="/connexion">Se connecter</Link>
        </p>
      </div>
    </div>
  )
}
