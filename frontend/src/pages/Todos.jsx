import { useState, useEffect } from 'react'
import { todosAPI } from '../services/api'

const CATEGORIES = [
  { value: '', label: 'Toutes' },
  { value: 'cours', label: 'Cours' },
  { value: 'devoir', label: 'Devoir' },
  { value: 'examen', label: 'Examen' },
  { value: 'projet', label: 'Projet' },
  { value: 'stage', label: 'Stage' },
  { value: 'personnel', label: 'Personnel' },
  { value: 'autre', label: 'Autre' },
]

const PRIORITIES = [
  { value: 'basse', label: 'Basse', color: '#10b981' },
  { value: 'moyenne', label: 'Moyenne', color: '#f59e0b' },
  { value: 'haute', label: 'Haute', color: '#f97316' },
  { value: 'urgente', label: 'Urgente', color: '#ef4444' },
]

export default function Todos() {
  const [todos, setTodos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState('')
  const [filterDone, setFilterDone] = useState('')
  const [form, setForm] = useState({ titre: '', description: '', categorie: 'autre', priorite: 'moyenne', date_echeance: '' })

  const loadTodos = async () => {
    try {
      let params = []
      if (filter) params.push(`categorie=${filter}`)
      if (filterDone) params.push(`completed=${filterDone}`)
      const res = await todosAPI.getAll(params.join('&'))
      setTodos(res.data.todos)
    } catch {}
    finally { setLoading(false) }
  }

  useEffect(() => { loadTodos() }, [filter, filterDone])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.titre.trim()) return
    const data = { ...form }
    if (!data.date_echeance) delete data.date_echeance
    try {
      await todosAPI.create(data)
      setForm({ titre: '', description: '', categorie: 'autre', priorite: 'moyenne', date_echeance: '' })
      setShowForm(false)
      loadTodos()
    } catch {}
  }

  const handleToggle = async (id) => { try { await todosAPI.toggle(id); loadTodos() } catch {} }
  const handleDelete = async (id) => { try { await todosAPI.delete(id); loadTodos() } catch {} }

  const getPriorityInfo = (p) => PRIORITIES.find(pr => pr.value === p) || PRIORITIES[1]
  const pending = todos.filter(t => !t.completed).length
  const done = todos.filter(t => t.completed).length

  if (loading) return <div className="page-loader"><div className="spinner" /></div>

  return (
    <div className="todo-page">
      <div className="todo-header-section">
        <div className="todo-header-top">
          <div>
            <h1>Ma Todo List</h1>
            <p className="todo-subtitle">Organisez vos cours, devoirs et projets</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Nouvelle tâche
          </button>
        </div>
        <div className="todo-stats">
          <div className="todo-stat glass"><span className="todo-stat-num">{todos.length}</span><span className="todo-stat-label">Total</span></div>
          <div className="todo-stat glass"><span className="todo-stat-num" style={{ color: '#f59e0b' }}>{pending}</span><span className="todo-stat-label">En cours</span></div>
          <div className="todo-stat glass"><span className="todo-stat-num" style={{ color: '#10b981' }}>{done}</span><span className="todo-stat-label">Terminées</span></div>
          <div className="todo-stat glass">
            <div className="todo-progress-bar"><div className="todo-progress-fill" style={{ width: `${todos.length ? (done / todos.length) * 100 : 0}%` }} /></div>
            <span className="todo-stat-label">{todos.length ? Math.round((done / todos.length) * 100) : 0}%</span>
          </div>
        </div>
        <div className="todo-filters">
          <div className="todo-filter-group">
            {CATEGORIES.map(c => (<button key={c.value} className={`todo-filter-btn ${filter === c.value ? 'active' : ''}`} onClick={() => setFilter(c.value)}>{c.label}</button>))}
          </div>
          <div className="todo-filter-group">
            <button className={`todo-filter-btn ${filterDone === '' ? 'active' : ''}`} onClick={() => setFilterDone('')}>Toutes</button>
            <button className={`todo-filter-btn ${filterDone === 'false' ? 'active' : ''}`} onClick={() => setFilterDone('false')}>En cours</button>
            <button className={`todo-filter-btn ${filterDone === 'true' ? 'active' : ''}`} onClick={() => setFilterDone('true')}>Terminées</button>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="todo-form-card glass">
          <h3>Ajouter une tâche</h3>
          <form onSubmit={handleSubmit} className="todo-form">
            <div className="form-group"><label>Titre *</label><input placeholder="Ex: Réviser le chapitre 5..." value={form.titre} onChange={e => setForm({ ...form, titre: e.target.value })} /></div>
            <div className="form-group"><label>Description</label><textarea placeholder="Détails..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} /></div>
            <div className="form-row">
              <div className="form-group"><label>Catégorie</label><select value={form.categorie} onChange={e => setForm({ ...form, categorie: e.target.value })}>{CATEGORIES.filter(c => c.value).map(c => <option key={c.value} value={c.value}>{c.label}</option>)}</select></div>
              <div className="form-group"><label>Priorité</label><select value={form.priorite} onChange={e => setForm({ ...form, priorite: e.target.value })}>{PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}</select></div>
              <div className="form-group"><label>Échéance</label><input type="datetime-local" value={form.date_echeance} onChange={e => setForm({ ...form, date_echeance: e.target.value })} /></div>
            </div>
            <div className="todo-form-actions"><button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Annuler</button><button type="submit" className="btn btn-primary">Ajouter</button></div>
          </form>
        </div>
      )}

      <div className="todo-list">
        {todos.length === 0 ? (
          <div className="todo-empty glass">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
            <p>Aucune tâche trouvée</p>
            <button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}>Créer ma première tâche</button>
          </div>
        ) : todos.map(todo => {
          const pri = getPriorityInfo(todo.priorite)
          return (
            <div key={todo.id} className={`todo-item glass ${todo.completed ? 'todo-done' : ''}`}>
              <button className={`todo-check ${todo.completed ? 'checked' : ''}`} onClick={() => handleToggle(todo.id)} style={{ borderColor: pri.color, background: todo.completed ? pri.color : 'transparent' }}>
                {todo.completed && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
              </button>
              <div className="todo-content">
                <div className="todo-title-row">
                  <span className={`todo-title ${todo.completed ? 'line-through' : ''}`}>{todo.titre}</span>
                  <div className="todo-badges">
                    <span className="todo-cat-badge">{todo.categorie}</span>
                    <span className="todo-pri-badge" style={{ background: pri.color + '20', color: pri.color }}>{pri.label}</span>
                  </div>
                </div>
                {todo.description && <p className="todo-desc">{todo.description}</p>}
                {todo.date_echeance && (
                  <span className="todo-deadline">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    {new Date(todo.date_echeance).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
              <button className="todo-delete-btn" onClick={() => handleDelete(todo.id)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
