import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('currentUser')
      if (window.location.pathname !== '/connexion' && window.location.pathname !== '/') {
        window.location.href = '/connexion'
      }
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  login: (data) => api.post('/auth/login/', data),
  register: (data) => api.post('/auth/register/', data),
  me: () => api.get('/auth/me/'),
  refresh: (refresh) => api.post('/auth/refresh/', { refresh }),
}

export const usersAPI = {
  getAll: (limit = 50) => api.get(`/users/?limit=${limit}`),
  search: (q) => api.get(`/users/search/?q=${encodeURIComponent(q)}`),
  getById: (id) => api.get(`/users/${id}/`),
  update: (id, data) => api.put(`/users/${id}/update/`, data),
  uploadPhoto: (file) => {
    const formData = new FormData()
    formData.append('photo', file)
    return api.post('/users/upload-photo/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
}

export const clubsAPI = {
  getAll: () => api.get('/clubs/'),
  getById: (id) => api.get(`/clubs/${id}/`),
  create: (data) => api.post('/clubs/create/', data),
  join: (id) => api.post(`/clubs/${id}/join/`),
  leave: (id) => api.post(`/clubs/${id}/leave/`),
  getMembers: (id) => api.get(`/clubs/${id}/members/`),
  myClubs: () => api.get('/clubs/user/my-clubs/'),
}

export const eventsAPI = {
  getAll: (upcoming = false) => api.get(`/events/?upcoming=${upcoming}`),
  getById: (id) => api.get(`/events/${id}/`),
  create: (data) => api.post('/events/create/', data),
  participate: (id) => api.post(`/events/${id}/participate/`),
  cancel: (id) => api.post(`/events/${id}/cancel/`),
  getParticipants: (id) => api.get(`/events/${id}/participants/`),
  myEvents: () => api.get('/events/user/my-events/'),
  update: (id, data) => api.put(`/events/${id}/update/`, data),
  delete: (id) => api.delete(`/events/${id}/delete/`),
}

export const messagesAPI = {
  getConversations: () => api.get('/messages/conversations/'),
  getMessages: (userId) => api.get(`/messages/${userId}/`),
  send: (data) => api.post('/messages/send/', data),
  delete: (id) => api.delete(`/messages/${id}/delete/`),
  unreadCount: () => api.get('/messages/unread/count/'),
  uploadFile: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/messages/upload-file/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
}

export const todosAPI = {
  getAll: (params = '') => api.get(`/todos/${params ? '?' + params : ''}`),
  create: (data) => api.post('/todos/create/', data),
  update: (id, data) => api.put(`/todos/${id}/update/`, data),
  delete: (id) => api.delete(`/todos/${id}/delete/`),
  toggle: (id) => api.post(`/todos/${id}/toggle/`),
}

export default api
