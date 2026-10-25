import { useState, useRef, useEffect } from 'react'
import {
  Sparkles,
  MessageSquare,
  X,
  Send,
  RotateCcw,
  Bot,
  User,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react'
import api from '../../lib/api'

const QUICK_PROMPTS = [
  'Berapa saldo kas lingkungan saat ini?',
  'Bagaimana cara bayar iuran via Midtrans QRIS?',
  'Bagaimana alur dan cara membuat aduan warga?',
  'Apa saja nomor kontak darurat RT/RW?',
  'Bagaimana cara memantau CCTV pos kamling?',
]

export default function AiChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        'Halo warga! 👋 Saya Asisten AI Resmi SIAGA. Saya siap menjawab pertanyaan Anda seputar transparansi kas lingkungan, panduan pembayaran iuran via Midtrans QRIS, status penanganan aduan, pantauan CCTV gerbang, voting musyawarah, dan kontak darurat RT 004 / RW 002. Ada yang ingin Anda tanyakan?',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
      setTimeout(() => inputRef.current?.focus(), 150)
    }
  }, [isOpen, messages, loading])

  const handleSend = async (textToSend) => {
    const query = (textToSend || input).trim()
    if (!query || loading) return

    const userMsg = { role: 'user', content: query }
    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    setInput('')
    setLoading(true)

    const historyPayload = updatedMessages
      .filter((_, idx) => idx > 0)
      .slice(-4)
      .map((m) => ({
        role: m.role,
        content: typeof m.content === 'string' ? m.content.slice(0, 1000) : '',
      }))

    try {
      const res = await api.post('/public/chat', {
        message: query,
        history: historyPayload.slice(0, -1),
      })

      const botReply = res.data?.reply || 'Maaf, saya tidak dapat memproses jawaban saat ini.'
      setMessages((prev) => [...prev, { role: 'assistant', content: botReply }])
    } catch (err) {
      console.warn('AI chat error:', err)
      const fallbackReply =
        err?.response?.data?.reply ||
        'Mohon maaf, sistem AI SIAGA sedang memproses antrean. Silakan coba tanyakan kembali.'
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: fallbackReply,
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setMessages([
      {
        role: 'assistant',
        content:
          'Percakapan telah diatur ulang. Halo warga! 👋 Saya Asisten AI Resmi SIAGA. Ada informasi seputar kas, iuran, aduan, atau keamanan yang ingin Anda tanyakan?',
      },
    ])
    setInput('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const renderMessageContent = (content) => {
    const lines = content.split('\n')
    return (
      <div className="space-y-1.5 text-xs sm:text-[13px] leading-relaxed select-text">
        {lines.map((line, i) => {
          if (!line.trim()) return <div key={i} className="h-1" />
          const parts = line.split(/(\*\*.*?\*\*)/g)
          return (
            <p key={i}>
              {parts.map((part, pIdx) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                  return (
                    <strong key={pIdx} className="font-bold text-[#0F5A6B]">
                      {part.slice(2, -2)}
                    </strong>
                  )
                }
                return part
              })}
            </p>
          )
        })}
      </div>
    )
  }

  return (
    <>
      {/* Floating Trigger Button */}
      <div
        className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 transform-gpu will-change-transform flex items-center gap-3 transition-all duration-300 ease-out origin-bottom-right ${
          isOpen
            ? 'opacity-0 scale-75 pointer-events-none translate-y-3'
            : 'opacity-100 scale-100 pointer-events-auto translate-y-0'
        }`}
      >
        <div className="hidden sm:flex items-center gap-1.5 bg-[#0F5A6B] text-white text-xs font-semibold px-3.5 py-1.5 rounded-full shadow-lg border border-white/20 backdrop-blur-md">
          <Sparkles className="h-3 w-3 text-[#F7B538]" />
          <span>Tanya SIAGA AI</span>
        </div>

        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-[#0F5A6B] text-white shadow-xl shadow-[#0F5A6B]/30 transition-all duration-300 hover:scale-105 active:scale-95 border border-[#F7B538]/50"
          aria-label="Buka Chatbot AI SIAGA"
        >
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F7B538] opacity-75" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-[#F7B538] text-[9px] font-black text-[#0F5A6B] items-center justify-center">
              AI
            </span>
          </span>

          <Bot className="h-6 w-6 sm:h-7 sm:w-7 text-[#F7B538] transition-transform group-hover:rotate-6" />
        </button>
      </div>

      {/* Floating Chat Modal */}
      <div
        className={`fixed inset-x-3 bottom-3 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[400px] h-[540px] max-h-[85vh] z-50 flex flex-col rounded-3xl bg-white shadow-2xl border border-gray-200 overflow-hidden font-sans transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] origin-bottom-right ${
          isOpen
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 scale-90 translate-y-6 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 sm:px-5 sm:py-3.5 bg-[#0F5A6B] text-white border-b border-white/10">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-white/10 text-[#F7B538] border border-white/20 shadow-inner shrink-0">
              <Bot className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-[#3CC4B0] ring-2 ring-[#0F5A6B]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs sm:text-sm font-extrabold text-white tracking-tight truncate">SIAGA AI Bot</h3>
                <span className="inline-flex items-center px-1.5 py-0.2 rounded-md bg-[#F7B538]/20 text-[#F7B538] font-mono text-[9px] font-bold shrink-0">
                  Resmi
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-white/70 truncate">Asisten Cerdas Transparansi Lingkungan</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleReset}
              title="Mulai Ulang Percakapan"
              className="h-8 w-8 rounded-lg text-white/70 hover:text-white hover:bg-white/10 grid place-items-center transition"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              title="Tutup Chat"
              className="h-8 w-8 rounded-lg text-white/70 hover:text-white hover:bg-white/10 grid place-items-center transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/70">
          {messages.map((m, idx) => {
            const isAssistant = m.role === 'assistant'
            return (
              <div
                key={idx}
                className={`flex gap-2.5 ${isAssistant ? 'justify-start' : 'justify-end'}`}
              >
                {isAssistant && (
                  <div className="h-7 w-7 rounded-lg bg-[#0F5A6B] text-[#F7B538] grid place-items-center shrink-0 mt-0.5 shadow-xs">
                    <Bot className="h-4 w-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-xs ${
                    isAssistant
                      ? 'bg-white text-gray-800 border border-gray-200'
                      : 'bg-[#0F5A6B] text-white rounded-br-xs'
                  }`}
                >
                  {renderMessageContent(m.content)}
                </div>

                {!isAssistant && (
                  <div className="h-7 w-7 rounded-lg bg-[#3CC4B0] text-white grid place-items-center shrink-0 mt-0.5 shadow-xs">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            )
          })}

          {/* Quick Prompts */}
          {messages.length <= 2 && !loading && (
            <div className="pt-2">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                Pertanyaan Populer Warga:
              </p>
              <div className="flex flex-col gap-1.5">
                {QUICK_PROMPTS.map((prompt, pIdx) => (
                  <button
                    key={pIdx}
                    onClick={() => handleSend(prompt)}
                    className="text-left text-xs bg-white hover:bg-gray-100 text-[#0F5A6B] font-medium px-3 py-2 rounded-xl border border-gray-200 hover:border-gray-300 transition shadow-2xs flex items-center justify-between group"
                  >
                    <span>{prompt}</span>
                    <Sparkles className="h-3 w-3 text-[#F7B538] shrink-0 opacity-40 group-hover:opacity-100 transition" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Loading Indicator */}
          {loading && (
            <div className="flex gap-2.5 justify-start items-center">
              <div className="h-7 w-7 rounded-lg bg-[#0F5A6B] text-[#F7B538] grid place-items-center shrink-0 shadow-xs">
                <Bot className="h-4 w-4" />
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-xs flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#0F5A6B]/60 animate-bounce" />
                <span className="h-2 w-2 rounded-full bg-[#0F5A6B]/60 animate-bounce [animation-delay:0.2s]" />
                <span className="h-2 w-2 rounded-full bg-[#0F5A6B]/60 animate-bounce [animation-delay:0.4s]" />
                <span className="text-[11px] text-gray-500 font-medium ml-1">SIAGA AI sedang menjawab...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 bg-white border-t border-gray-200 space-y-2">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ketik pertanyaan seputar SIAGA..."
              disabled={loading}
              className="flex-1 rounded-xl border border-gray-300 px-3.5 py-2.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0F5A6B] disabled:opacity-50"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              className="h-10 w-10 rounded-xl bg-[#0F5A6B] text-[#F7B538] hover:bg-[#0c4756] disabled:opacity-40 disabled:cursor-not-allowed grid place-items-center shadow-sm shrink-0 transition"
              aria-label="Kirim Pesan"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center justify-between px-1 text-[10px] text-gray-400">
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="h-3 w-3 text-[#3CC4B0]" />
              Data bersumber dari sistem resmi SIAGA
            </span>
            <span>Tekan Enter ↵</span>
          </div>
        </div>
      </div>
    </>
  )
}
