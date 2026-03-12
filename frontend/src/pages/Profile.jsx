import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { usersAPI, clubsAPI, eventsAPI } from '../services/api'

const ECOLES = [
  { value: '', label: 'Choisir une école' },
  { value: 'ESIIA', label: 'ESIIA' },
  { value: 'EMSP', label: 'EMSP' },
  { value: 'ESMEP', label: 'ESMEP' },
  { value: 'DCG Formations', label: 'DCG Formations' },
  { value: 'ILMIS', label: 'ILMIS' },
  { value: 'ISMOD Paris', label: 'ISMOD Paris' },
  { value: 'ESETH', label: 'ESETH' },
  { value: 'ESUV', label: 'ESUV' },
  { value: 'ESMAS', label: 'ESMAS' },
  { value: 'ESMOSS', label: 'ESMOSS' },
  { value: 'ESEA', label: 'ESEA' },
  { value: 'ESART Paris', label: 'ESART Paris' },
  { value: 'CESCOM Paris', label: 'CESCOM Paris' },
]

const NIVEAUX = [
  { value: '', label: 'Choisir' },
  { value: 'BTS 1ère année', label: 'BTS 1' },
  { value: 'BTS 2ème année', label: 'BTS 2' },
  { value: 'Bachelor 1', label: 'Bachelor 1' },
  { value: 'Bachelor 2', label: 'Bachelor 2' },
  { value: 'Bachelor 3', label: 'Bachelor 3' },
  { value: 'Mastère 1', label: 'Mastère 1' },
  { value: 'Mastère 2', label: 'Mastère 2' },
]

const CAMPUS = [
  { value: '', label: 'Choisir' },
  { value: 'Paris-Torcy', label: 'Paris-Torcy' },
  { value: 'Paris-Évry', label: 'Paris-Évry' },
  { value: 'Paris-Noisiel', label: 'Paris-Noisiel' },
  { value: 'Lyon', label: 'Lyon' },
  { value: 'Yaoundé', label: 'Yaoundé' },
  { value: 'Campus à distance', label: 'À distance' },
]

export default function Profile() {
  const { user, updateUser } = useAuth()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({})
  const [myClubs, setMyClubs] = useState([])
  const [myEvents, setMyEvents] = useState([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [photoPreview, setPhotoPreview] = useState(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (user) {
      setForm({
        nom: user.nom || '',
        prenom: user.prenom || '',
        email: user.email || '',
        ecole: user.ecole || '',
        formation: user.formation || '',
        niveau: user.niveau || '',
        campus: user.campus || '',
      })
    }
    clubsAPI.myClubs().then((res) => setMyClubs(res.data.clubs)).catch(() => {})
    eventsAPI.myEvents().then((res) => setMyEvents(res.data.events)).catch(() => {})
  }, [user])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handlePhotoClick = () => {
    fileInputRef.current?.click()
  }

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Prévisualisation immédiate
    const reader = new FileReader()
    reader.onload = (ev) => setPhotoPreview(ev.target.result)
    reader.readAsDataURL(file)

    // Upload
    setUploading(true)
    try {
      const res = await usersAPI.uploadPhoto(file)
      updateUser(res.data.user)
      setPhotoPreview(null)
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de l\'upload')
      setPhotoPreview(null)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await usersAPI.update(user.id, form)
      updateUser(res.data.user)
      setEditing(false)
    } catch (err) {
      console.error('Erreur mise à jour:', err)
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  const avatarSrc = photoPreview || user.photo_profil || 'https://i.pinimg.com/736x/7d/ba/e2/7dbae2ef3c2e477d1721004644f55bbd.jpg'

  return (
    <div className="profile-page">
      <div className="profile-banner">
        <div className="profile-banner-overlay" />
      </div>

      <div className="profile-content">
        <div className="profile-main glass">
          <div className="profile-avatar-section">
            <div className="profile-avatar-wrap" onClick={handlePhotoClick}>
              <img src={avatarSrc} alt={user.nom} className="profile-lg-avatar" />
              <div className="profile-avatar-overlay">
                {uploading ? (
                  <div className="spinner-sm" style={{ borderTopColor: 'white', borderColor: 'rgba(255,255,255,0.3)' }} />
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handlePhotoChange}
                style={{ display: 'none' }}
              />
            </div>
            <div className="profile-name-section">
              <h1>{user.nom} {user.prenom}</h1>
              <span className="profile-role-badge">{user.role}</span>
            </div>
          </div>

          <div className="profile-details">
            <div className="detail-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              <span>{user.email}</span>
            </div>
            {user.ecole && (
              <div className="detail-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
                <span>{user.ecole}</span>
              </div>
            )}
            {user.formation && (
              <div className="detail-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                <span>{user.formation}</span>
              </div>
            )}
            {user.niveau && (
              <div className="detail-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                <span>{user.niveau}</span>
              </div>
            )}
            {user.campus && (
              <div className="detail-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                <span>{user.campus}</span>
              </div>
            )}
          </div>

          <button className="btn btn-primary" onClick={() => setEditing(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Modifier mon profil
          </button>
        </div>

        <div className="profile-sidebar">
          <div className="sidebar-card glass">
            <h3>Mes clubs ({myClubs.length})</h3>
            {myClubs.length === 0 ? (
              <p className="empty-text">Aucun club rejoint</p>
            ) : (
              <ul className="sidebar-list">
                {myClubs.map((club) => (
                  <li key={club.id}>{club.nom}</li>
                ))}
              </ul>
            )}
          </div>

          <div className="sidebar-card glass">
            <h3>Mes événements ({myEvents.length})</h3>
            {myEvents.length === 0 ? (
              <p className="empty-text">Aucun événement</p>
            ) : (
              <ul className="sidebar-list">
                {myEvents.map((event) => (
                  <li key={event.id}>
                    {event.titre}
                    <span className="event-date-sm">
                      {new Date(event.date_event).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Modal d'édition */}
      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(false)}>
          <div className="modal glass" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Modifier mon profil</h2>
              <button className="modal-close" onClick={() => setEditing(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Nom</label>
                  <input name="nom" value={form.nom} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Prénom</label>
                  <input name="prenom" value={form.prenom} onChange={handleChange} />
                </div>
              </div>
              <div className="form-group">
                <label>Email</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>École</label>
                  <select name="ecole" value={form.ecole} onChange={handleChange}>
                    {ECOLES.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Formation</label>
                  <input name="formation" value={form.formation} onChange={handleChange} placeholder="Votre formation" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Niveau</label>
                  <select name="niveau" value={form.niveau} onChange={handleChange}>
                    {NIVEAUX.map(n => <option key={n.value} value={n.value}>{n.label}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Campus</label>
                  <select name="campus" value={form.campus} onChange={handleChange}>
                    {CAMPUS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                {loading ? <span className="spinner-sm" /> : 'Enregistrer'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
