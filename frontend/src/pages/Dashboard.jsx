import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { usersAPI, clubsAPI, eventsAPI } from '../services/api'

export default function Dashboard() {
  const navigate = useNavigate()
  const [profiles, setProfiles] = useState([])
  const [clubs, setClubs] = useState([])
  const [events, setEvents] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    try {
      const [usersRes, clubsRes, eventsRes] = await Promise.all([
        usersAPI.getAll(6),
        clubsAPI.getAll(),
        eventsAPI.getAll(true),
      ])
      setProfiles(usersRes.data.users)
      setClubs(clubsRes.data.clubs)
      setEvents(eventsRes.data.events)
    } catch (err) {
      console.error('Erreur chargement:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const handleSearch = async (e) => {
    const q = e.target.value
    setSearch(q)
    if (q.length < 2) {
      const res = await usersAPI.getAll(6)
      setProfiles(res.data.users)
      return
    }
    try {
      const res = await usersAPI.search(q)
      setProfiles(res.data.users)
    } catch { /* ignore */ }
  }

  const handleJoinClub = async (clubId) => {
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

  const handleParticipate = async (eventId) => {
    try {
      await eventsAPI.participate(eventId)
      loadData()
    } catch (err) {
      const msg = err.response?.data?.message
      if (msg?.includes('déjà')) {
        await eventsAPI.cancel(eventId)
        loadData()
      }
    }
  }

  if (loading) return <div className="page-loader"><div className="spinner" /></div>

  return (
    <div className="dashboard">
      {/* Hero */}
      <section className="dashboard-hero">
        <div className="hero-overlay" />
        <div className="hero-content">
          <h1>Bienvenue sur MBN Global Education</h1>
          <p>La plateforme commune pour les étudiants, professeurs, clubs et campus du groupe MBN.</p>
        </div>
      </section>

      {/* Search */}
      <div className="dashboard-search">
        <div className="search-wrapper">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            type="text"
            placeholder="Rechercher un profil, un club, un événement..."
            value={search}
            onChange={handleSearch}
          />
        </div>
      </div>

      {/* Profiles */}
      <section className="dashboard-section">
        <div className="section-header">
          <h2>Profils à la une</h2>
          <span className="section-count">{profiles.length} profils</span>
        </div>
        <div className="profiles-grid">
          {profiles.map((user) => (
            <div key={user.id} className="profile-card glass" onClick={() => navigate(`/messages/${user.id}`)}>
              <img
                src={user.photo_profil || 'https://i.pinimg.com/736x/7d/ba/e2/7dbae2ef3c2e477d1721004644f55bbd.jpg'}
                alt={user.nom}
                className="profile-avatar"
              />
              <h4>{user.nom} {user.prenom}</h4>
              <span className="profile-role">{user.formation || user.role}</span>
              {user.campus && <span className="profile-campus">{user.campus}</span>}
            </div>
          ))}
        </div>
      </section>

      {/* Clubs */}
      <section className="dashboard-section">
        <div className="section-header">
          <h2>Clubs & associations</h2>
          <span className="section-count">{clubs.length} clubs</span>
        </div>
        <div className="clubs-grid">
          {clubs.map((club) => (
            <div key={club.id} className="club-card glass">
              <div className="club-type-badge">{club.type}</div>
              <h4>{club.nom}</h4>
              <p>{club.description}</p>
              <div className="club-footer">
                <span className="member-count">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                  {club.member_count} membre{club.member_count !== 1 ? 's' : ''}
                </span>
                <button
                  className={`btn btn-sm ${club.is_member ? 'btn-outline' : 'btn-primary'}`}
                  onClick={() => handleJoinClub(club.id)}
                >
                  {club.is_member ? 'Quitter' : 'Rejoindre'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Events */}
      <section className="dashboard-section">
        <div className="section-header">
          <h2>Événements à venir</h2>
          <span className="section-count">{events.length} événements</span>
        </div>
        <div className="events-list">
          {events.map((event) => {
            const date = new Date(event.date_event)
            const day = date.toLocaleDateString('fr-FR', { day: 'numeric' })
            const month = date.toLocaleDateString('fr-FR', { month: 'short' })
            return (
              <div key={event.id} className="event-card glass">
                <div className="event-date">
                  <span className="event-day">{day}</span>
                  <span className="event-month">{month}</span>
                </div>
                <div className="event-info">
                  <h4>{event.titre}</h4>
                  <p>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    {event.lieu} {event.campus && `- ${event.campus}`}
                  </p>
                  <span className="event-participants">
                    {event.participant_count} participant{event.participant_count !== 1 ? 's' : ''}
                  </span>
                </div>
                <button
                  className={`btn btn-sm ${event.is_participating ? 'btn-outline' : 'btn-primary'}`}
                  onClick={() => handleParticipate(event.id)}
                >
                  {event.is_participating ? 'Annuler' : 'Participer'}
                </button>
              </div>
            )
          })}
          {events.length === 0 && (
            <p className="empty-state">Aucun événement à venir</p>
          )}
        </div>
      </section>
    </div>
  )
}
