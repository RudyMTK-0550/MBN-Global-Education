import { useState, useEffect, useCallback } from 'react'
import { clubsAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

const TYPES = [
  { value: 'all', label: 'Tous' },
  { value: 'creatif', label: 'Créatif' },
  { value: 'evenementiel', label: 'Événementiel' },
  { value: 'professionnel', label: 'Professionnel' },
  { value: 'sport', label: 'Sport' },
  { value: 'autre', label: 'Autre' },
]

export default function Clubs() {
  const { user } = useAuth()
  const [clubs, setClubs] = useState([])
  const [myClubs, setMyClubs] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [detailClub, setDetailClub] = useState(null)
  const [members, setMembers] = useState([])
  const [createForm, setCreateForm] = useState({ nom: '', description: '', type: 'autre' })
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  const loadData = useCallback(async () => {
    try {
      const [allRes, myRes] = await Promise.all([
        clubsAPI.getAll(),
        clubsAPI.myClubs(),
      ])
      setClubs(allRes.data.clubs)
      setMyClubs(myRes.data.clubs)
    } catch (err) {
      console.error('Erreur chargement clubs:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const handleJoin = async (clubId) => {
    try {
      await clubsAPI.join(clubId)
      loadData()
    } catch (err) {
      const msg = err.response?.data?.message
      if (msg?.includes('déjà membre')) {
        await clubsAPI.leave(clubId)
        loadData()
      }
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!createForm.nom.trim()) {
      setError('Le nom du club est requis')
      return
    }
    setCreating(true)
    setError('')
    try {
      await clubsAPI.create(createForm)
      setCreateForm({ nom: '', description: '', type: 'autre' })
      setShowCreate(false)
      loadData()
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la création')
    } finally {
      setCreating(false)
    }
  }

  const openDetail = async (club) => {
    setDetailClub(club)
    try {
      const res = await clubsAPI.getMembers(club.id)
      setMembers(res.data.members)
    } catch {
      setMembers([])
    }
  }

  const filteredClubs = filter === 'all'
    ? clubs
    : clubs.filter(c => c.type === filter)

  if (loading) return <div className="page-loader"><div className="spinner" /></div>

  return (
    <div className="clubs-page">
      {/* Header */}
      <div className="clubs-page-header">
        <div>
          <h1>Clubs & Associations</h1>
          <p className="clubs-page-subtitle">Découvrez et rejoignez les clubs de votre école</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Créer un club
        </button>
      </div>

      {/* Mes clubs */}
      {myClubs.length > 0 && (
        <section className="clubs-my-section">
          <h2 className="clubs-section-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            Mes clubs ({myClubs.length})
          </h2>
          <div className="clubs-my-scroll">
            {myClubs.map(club => (
              <div key={club.id} className="clubs-my-chip" onClick={() => openDetail(club)}>
                <span className="clubs-my-chip-icon">
                  {club.type === 'sport' ? '⚽' : club.type === 'creatif' ? '🎨' : club.type === 'evenementiel' ? '🎉' : club.type === 'professionnel' ? '💼' : '🔹'}
                </span>
                <span>{club.nom}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Filtres */}
      <div className="clubs-filter-bar">
        {TYPES.map(t => (
          <button
            key={t.value}
            className={`clubs-filter-chip ${filter === t.value ? 'active' : ''}`}
            onClick={() => setFilter(t.value)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Grille de clubs */}
      <div className="clubs-grid-page">
        {filteredClubs.map(club => (
          <div key={club.id} className="club-card glass">
            <div className="club-card-top" onClick={() => openDetail(club)}>
              <div className="club-type-badge">{club.type}</div>
              <h4>{club.nom}</h4>
              <p>{club.description || 'Aucune description'}</p>
            </div>
            <div className="club-footer">
              <span className="member-count">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                {club.member_count} membre{club.member_count !== 1 ? 's' : ''}
              </span>
              <button
                className={`btn btn-sm ${club.is_member ? 'btn-outline' : 'btn-primary'}`}
                onClick={() => handleJoin(club.id)}
              >
                {club.is_member ? 'Quitter' : 'Rejoindre'}
              </button>
            </div>
          </div>
        ))}
        {filteredClubs.length === 0 && (
          <div className="clubs-empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <p>Aucun club trouvé pour ce filtre</p>
          </div>
        )}
      </div>

      {/* Modal création */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal glass" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Créer un club</h2>
              <button className="modal-close" onClick={() => setShowCreate(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <form onSubmit={handleCreate} className="club-create-form">
              {error && <div className="form-error">{error}</div>}
              <div className="form-group">
                <label>Nom du club *</label>
                <input
                  type="text"
                  placeholder="Ex: Club Entrepreneuriat"
                  value={createForm.nom}
                  onChange={e => setCreateForm({ ...createForm, nom: e.target.value })}
                  maxLength={200}
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  placeholder="Décrivez les activités du club..."
                  value={createForm.description}
                  onChange={e => setCreateForm({ ...createForm, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="form-group">
                <label>Type de club</label>
                <select
                  value={createForm.type}
                  onChange={e => setCreateForm({ ...createForm, type: e.target.value })}
                >
                  <option value="creatif">Créatif</option>
                  <option value="evenementiel">Événementiel</option>
                  <option value="professionnel">Professionnel</option>
                  <option value="sport">Sport</option>
                  <option value="autre">Autre</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary btn-block" disabled={creating}>
                {creating ? 'Création...' : 'Créer le club'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal détail club */}
      {detailClub && (
        <div className="modal-overlay" onClick={() => setDetailClub(null)}>
          <div className="modal glass club-detail-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{detailClub.nom}</h2>
              <button className="modal-close" onClick={() => setDetailClub(null)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="club-detail-body">
              <div className="club-detail-meta">
                <span className="club-type-badge">{detailClub.type}</span>
                <span className="member-count">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                  {detailClub.member_count} membre{detailClub.member_count !== 1 ? 's' : ''}
                </span>
              </div>
              <p className="club-detail-desc">
                {detailClub.description || 'Aucune description disponible.'}
              </p>
              <div className="club-detail-creator">
                Créé par <strong>{detailClub.creator_prenom} {detailClub.creator_nom}</strong>
              </div>
              <button
                className={`btn btn-block ${detailClub.is_member ? 'btn-outline' : 'btn-primary'}`}
                onClick={() => { handleJoin(detailClub.id); setDetailClub(null) }}
              >
                {detailClub.is_member ? 'Quitter le club' : 'Rejoindre le club'}
              </button>

              {/* Liste des membres */}
              {members.length > 0 && (
                <div className="club-members-section">
                  <h3>Membres ({members.length})</h3>
                  <div className="club-member-list">
                    {members.map(m => (
                      <div key={m.id} className="club-member-item">
                        <img
                          src={m.photo_profil || 'https://i.pinimg.com/736x/7d/ba/e2/7dbae2ef3c2e477d1721004644f55bbd.jpg'}
                          alt={m.nom}
                          className="club-member-avatar"
                        />
                        <div className="club-member-info">
                          <span className="club-member-name">{m.prenom} {m.nom}</span>
                          <span className="club-member-role">{m.formation || m.role}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
