import { useState, useEffect, useCallback } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import SplashScreen from './components/SplashScreen'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Messages from './pages/Messages'
import Todos from './pages/Todos'
import Clubs from './pages/Clubs'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="page-loader"><div className="spinner" /></div>
  return user ? children : <Navigate to="/connexion" />
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="page-loader"><div className="spinner" /></div>
  return user ? <Navigate to="/accueil" /> : children
}

export default function App() {
  const [showSplash, setShowSplash] = useState(false)

  useEffect(() => {
    const hasVisited = sessionStorage.getItem('mbn_visited')
    if (!hasVisited) {
      setShowSplash(true)
    }
  }, [])

  const handleSplashFinish = useCallback(() => {
    sessionStorage.setItem('mbn_visited', 'true')
    setShowSplash(false)
  }, [])

  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />
  }

  return (
    <Routes>
      <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
      <Route path="/connexion" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/inscription" element={<PublicRoute><Register /></PublicRoute>} />
      <Route element={<Layout />}>
        <Route path="/accueil" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/profil" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/messages" element={<PrivateRoute><Messages /></PrivateRoute>} />
        <Route path="/messages/:userId" element={<PrivateRoute><Messages /></PrivateRoute>} />
        <Route path="/clubs" element={<PrivateRoute><Clubs /></PrivateRoute>} />
        <Route path="/todos" element={<PrivateRoute><Todos /></PrivateRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}
