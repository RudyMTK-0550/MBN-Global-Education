import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { messagesAPI, usersAPI } from '../services/api'

export default function Messages() {
  const { userId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [conversations, setConversations] = useState([])
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [partner, setPartner] = useState(null)
  const [loading, setLoading] = useState(true)
  const [recording, setRecording] = useState(false)
  const [recordTime, setRecordTime] = useState(0)
  const [showEmoji, setShowEmoji] = useState(false)
  const [uploading, setUploading] = useState(false)
  const messagesEndRef = useRef(null)
  const timerRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const streamRef = useRef(null)
  const fileInputRef = useRef(null)
  const playingAudioRef = useRef(null)

  const emojis = ['😀','😂','😍','🥺','😎','🙏','👍','❤️','🔥','✨','😭','🤣','😊','💪','🎉','👏','💯','🙌','😢','🤔']

  useEffect(() => { loadConversations() }, [])

  useEffect(() => {
    if (userId) {
      loadMessages(userId)
      usersAPI.getById(userId).then(r => setPartner(r.data.user)).catch(() => {})
    } else {
      setMessages([])
      setPartner(null)
    }
  }, [userId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadConversations = async () => {
    try {
      const res = await messagesAPI.getConversations()
      setConversations(res.data.conversations)
    } catch {}
    finally { setLoading(false) }
  }

  const loadMessages = async (uid) => {
    try {
      const res = await messagesAPI.getMessages(uid)
      setMessages(res.data.messages)
      loadConversations()
    } catch {}
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !userId) return
    try {
      await messagesAPI.send({ receiver_id: parseInt(userId), content: newMessage.trim(), message_type: 'text' })
      setNewMessage('')
      loadMessages(userId)
    } catch {}
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearInterval(timerRef.current)
      streamRef.current?.getTracks().forEach(t => t.stop())
    }
  }, [])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
      const mediaRecorder = new MediaRecorder(stream, { mimeType })
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data)
      }

      mediaRecorder.start()
      setRecording(true)
      setRecordTime(0)
      timerRef.current = setInterval(() => setRecordTime(t => t + 1), 1000)
    } catch {
      alert('Impossible d\'accéder au microphone. Vérifiez les permissions.')
    }
  }

  const stopRecording = async () => {
    if (!mediaRecorderRef.current || !userId) return
    setRecording(false)
    clearInterval(timerRef.current)
    const duration = recordTime

    const blob = await new Promise((resolve) => {
      mediaRecorderRef.current.onstop = () => {
        const mime = mediaRecorderRef.current.mimeType || 'audio/webm'
        resolve(new Blob(audioChunksRef.current, { type: mime }))
      }
      mediaRecorderRef.current.stop()
    })

    streamRef.current?.getTracks().forEach(t => t.stop())

    const ext = blob.type.includes('mp4') ? 'm4a' : 'webm'
    const file = new File([blob], `vocal_${Date.now()}.${ext}`, { type: blob.type })

    setUploading(true)
    try {
      const uploadRes = await messagesAPI.uploadFile(file)
      await messagesAPI.send({
        receiver_id: parseInt(userId),
        content: '',
        message_type: 'voice',
        voice_duration: duration,
        file_url: uploadRes.data.file_url,
        file_name: uploadRes.data.file_name,
        file_size: uploadRes.data.file_size,
      })
      setRecordTime(0)
      loadMessages(userId)
    } catch {
      alert('Erreur lors de l\'envoi du vocal')
    } finally {
      setUploading(false)
    }
  }

  const playVoice = (url) => {
    if (playingAudioRef.current) {
      playingAudioRef.current.pause()
      playingAudioRef.current = null
    }
    if (url && url !== '#') {
      const audio = new Audio(url)
      playingAudioRef.current = audio
      audio.play().catch(() => {})
      audio.onended = () => { playingAudioRef.current = null }
    }
  }

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !userId) return
    e.target.value = ''

    if (file.size > 10 * 1024 * 1024) {
      alert('Le fichier ne doit pas dépasser 10 MB')
      return
    }

    setUploading(true)
    try {
      const uploadRes = await messagesAPI.uploadFile(file)
      await messagesAPI.send({
        receiver_id: parseInt(userId),
        content: '',
        message_type: 'file',
        file_name: uploadRes.data.file_name,
        file_url: uploadRes.data.file_url,
        file_size: uploadRes.data.file_size,
      })
      loadMessages(userId)
    } catch {
      alert('Erreur lors de l\'envoi du fichier')
    } finally {
      setUploading(false)
    }
  }

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
  const formatSize = (b) => b > 1000000 ? `${(b / 1000000).toFixed(1)} MB` : `${Math.round(b / 1000)} KB`

  const formatMsgTime = (d) => {
    const now = new Date()
    const date = new Date(d)
    const diff = now - date
    if (diff < 86400000 && now.getDate() === date.getDate()) {
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    }
    if (diff < 172800000) return 'Hier'
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  }

  if (loading) return <div className="page-loader"><div className="spinner" /></div>

  return (
    <div className="wa-page">
      {/* Sidebar */}
      <div className={`wa-sidebar ${userId ? 'hide-mobile' : ''}`}>
        <div className="wa-sidebar-header">
          <img src={user?.photo_profil} alt="" className="wa-my-avatar" />
          <h2>Discussions</h2>
        </div>
        <div className="wa-search-box">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input placeholder="Rechercher une discussion..." />
        </div>
        <div className="wa-conv-list">
          {conversations.length === 0 ? (
            <p className="empty-text">Aucune conversation</p>
          ) : conversations.map(c => (
            <div key={c.user_id} className={`wa-conv-item ${parseInt(userId) === c.user_id ? 'active' : ''}`} onClick={() => navigate(`/messages/${c.user_id}`)}>
              <div className="wa-conv-avatar-wrap">
                <img src={c.photo_profil || 'https://i.pinimg.com/736x/7d/ba/e2/7dbae2ef3c2e477d1721004644f55bbd.jpg'} alt="" className="wa-conv-avatar" />
                {c.unread_count > 0 && <span className="wa-online-dot" />}
              </div>
              <div className="wa-conv-body">
                <div className="wa-conv-top">
                  <span className="wa-conv-name">{c.nom} {c.prenom}</span>
                  <span className="wa-conv-time">{formatMsgTime(c.last_message_time)}</span>
                </div>
                <div className="wa-conv-bottom">
                  <span className="wa-conv-preview">{c.last_message}</span>
                  {c.unread_count > 0 && <span className="wa-unread-badge">{c.unread_count}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat */}
      <div className={`wa-chat ${!userId ? 'hide-mobile' : ''}`}>
        {!userId ? (
          <div className="wa-chat-empty">
            <div className="wa-empty-icon">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </div>
            <h3>MBN Messenger</h3>
            <p>Sélectionnez une conversation pour commencer</p>
          </div>
        ) : (
          <>
            <div className="wa-chat-header">
              <button className="back-btn show-mobile" onClick={() => navigate('/messages')}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
              </button>
              {partner && (
                <div className="wa-partner-info">
                  <img src={partner.photo_profil || 'https://i.pinimg.com/736x/7d/ba/e2/7dbae2ef3c2e477d1721004644f55bbd.jpg'} alt="" className="wa-partner-avatar" />
                  <div>
                    <h3>{partner.nom} {partner.prenom}</h3>
                    <span className="wa-partner-status">En ligne</span>
                  </div>
                </div>
              )}
            </div>

            <div className="wa-messages">
              {messages.map(msg => (
                <div key={msg.id} className={`wa-bubble ${msg.sender === user.id ? 'wa-sent' : 'wa-received'}`}>
                  {msg.message_type === 'voice' ? (
                    <div className="wa-voice-msg">
                      <button className="wa-play-btn" onClick={() => playVoice(msg.file_url)}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                      </button>
                      <div className="wa-voice-wave">
                        {[...Array(20)].map((_, i) => (
                          <div key={i} className="wa-wave-bar" style={{ height: `${8 + Math.random() * 20}px` }} />
                        ))}
                      </div>
                      <span className="wa-voice-dur">{formatTime(Math.round(msg.voice_duration || 0))}</span>
                    </div>
                  ) : msg.message_type === 'file' ? (
                    <div className="wa-file-msg">
                      <div className="wa-file-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                      </div>
                      <div className="wa-file-info">
                        <span className="wa-file-name">{msg.file_name}</span>
                        <span className="wa-file-size">{formatSize(msg.file_size)}</span>
                      </div>
                      <a href={msg.file_url} target="_blank" rel="noopener noreferrer" download={msg.file_name} className="wa-download-btn">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                      </a>
                    </div>
                  ) : (
                    <p>{msg.content}</p>
                  )}
                  <div className="wa-msg-meta">
                    <span>{new Date(msg.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                    {msg.sender === user.id && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={msg.is_read ? '#53bdeb' : 'currentColor'} strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {showEmoji && (
              <div className="wa-emoji-panel">
                {emojis.map(e => (
                  <button key={e} className="wa-emoji-btn" onClick={() => { setNewMessage(m => m + e); setShowEmoji(false) }}>{e}</button>
                ))}
              </div>
            )}

            <div className="wa-input-bar">
              <button className="wa-icon-btn" onClick={() => setShowEmoji(!showEmoji)} title="Emoji">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
              </button>
              <button className="wa-icon-btn" onClick={() => fileInputRef.current?.click()} title="Fichier">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                style={{ display: 'none' }}
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.jpg,.jpeg,.png,.gif,.webp"
              />

              {recording ? (
                <div className="wa-recording">
                  <div className="wa-rec-dot" />
                  <span className="wa-rec-time">{formatTime(recordTime)}</span>
                  <span>Enregistrement...</span>
                  <button className="wa-send-voice" onClick={stopRecording}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                  </button>
                </div>
              ) : (
                <>
                  <form className="wa-text-form" onSubmit={handleSend}>
                    <input type="text" placeholder="Tapez un message..." value={newMessage} onChange={e => setNewMessage(e.target.value)} />
                  </form>
                  {newMessage.trim() ? (
                    <button className="wa-send-btn" onClick={handleSend}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                    </button>
                  ) : (
                    <button className="wa-mic-btn" onClick={startRecording}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
                    </button>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
