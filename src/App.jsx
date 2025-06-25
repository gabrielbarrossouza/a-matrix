import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Play, Pause, Volume2, VolumeX } from 'lucide-react'
import clubbedToDeathAudio from './assets/clubbed_to_death.mp3'
import './App.css'

function App() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [selectedPill, setSelectedPill] = useState(null)
  const [terminalText, setTerminalText] = useState('')
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(0.3)
  const canvasRef = useRef(null)
  const audioRef = useRef(null)

  // Chuvinha da Matrix
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const matrix = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    const matrixArray = matrix.split("")
    const fontSize = 16
    const columns = canvas.width / fontSize
    const drops = []

    for (let x = 0; x < columns; x++) {
      drops[x] = 1
    }

    function draw() {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.04)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.fillStyle = '#00ff41'
      ctx.font = fontSize + 'px monospace'

      for (let i = 0; i < drops.length; i++) {
        const text = matrixArray[Math.floor(Math.random() * matrixArray.length)]
        ctx.fillText(text, i * fontSize, drops[i] * fontSize)

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0
        }
        drops[i]++
      }
    }

    const interval = setInterval(draw, 35)

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    window.addEventListener('resize', handleResize)

    return () => {
      clearInterval(interval)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  // Audio setup
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    audio.volume = volume
    audio.loop = true

    const handleCanPlay = () => {
      // Auto-play after loading screen
      if (isLoaded) {
        audio.play().then(() => {
          setIsPlaying(true)
        }).catch(error => {
          console.log('Auto-play prevented:', error)
        })
      }
    }

    audio.addEventListener('canplaythrough', handleCanPlay)
    
    return () => {
      audio.removeEventListener('canplaythrough', handleCanPlay)
    }
  }, [isLoaded, volume])

  // Simula carregamento inicial
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true)
      // Try to start audio after loading
      if (audioRef.current) {
        audioRef.current.play().then(() => {
          setIsPlaying(true)
        }).catch(error => {
          console.log('Auto-play prevented:', error)
        })
      }
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  // Terminal typing effect
  useEffect(() => {
    if (!isLoaded) return

    const messages = [
      "Acorde, Neo...",
      "A Matrix te pegou...",
      "Siga o coelho branco.",
      "Toc, Toc, Neo."
    ]

    let messageIndex = 0
    let charIndex = 0
    let currentMessage = ""

    const typeMessage = () => {
      if (messageIndex < messages.length) {
        if (charIndex < messages[messageIndex].length) {
          currentMessage += messages[messageIndex][charIndex]
          setTerminalText(currentMessage)
          charIndex++
          setTimeout(typeMessage, 100)
        } else {
          setTimeout(() => {
            currentMessage += "\n"
            setTerminalText(currentMessage)
            messageIndex++
            charIndex = 0
            setTimeout(typeMessage, 1000)
          }, 2000)
        }
      }
    }

    const timer = setTimeout(typeMessage, 1000)
    return () => clearTimeout(timer)
  }, [isLoaded])

  const handlePillChoice = (pill) => {
    setSelectedPill(pill)
    
    if (pill === 'red') {
      setTerminalText(prev => prev + "\nVocê escolheu a pílula vermelha...\nBem vindo ao mundo real.\nA verdade vai te libertar.")
    } else {
      setTerminalText(prev => prev + "\nVocê escolheu a pílula azul...\nA história termina aqui.\nVocê acorda na sua cama e acredita no que quiser acreditar.")
    }
  }

  const toggleAudio = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      audio.play().then(() => {
        setIsPlaying(true)
      }).catch(error => {
        console.log('Play failed:', error)
      })
    }
  }

  const toggleMute = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isMuted) {
      audio.volume = volume
      setIsMuted(false)
    } else {
      audio.volume = 0
      setIsMuted(true)
    }
  }

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    
    const audio = audioRef.current
    if (audio && !isMuted) {
      audio.volume = newVolume
    }
  }

  return (
    <div className="matrix-app">
      {/* Audio Element */}
      <audio 
        ref={audioRef}
        src={clubbedToDeathAudio}
        preload="auto"
      />

      {/* Audio Controls */}
      <div className="audio-controls">
        <button 
          className="audio-button"
          onClick={toggleAudio}
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        </button>
        
        <button 
          className="audio-button"
          onClick={toggleMute}
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
        
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={handleVolumeChange}
          className="volume-slider"
          title="Volume"
        />
        
        <div className="audio-info">
          <span className="audio-title">Clubbed to Death</span>
        </div>
      </div>

      {/* Canvas Matrix Rain Effect */}
      <canvas 
        ref={canvasRef}
        className="matrix-canvas"
      />

      {/* Main Content */}
      <div className="matrix-content">
        {!isLoaded ? (
          <div className="loading-screen">
            <div className="loading-text">
              <span className="glitch" data-text="INICIALIZANDO A MATRIX...">INICIALIZANDO A MATRIX...</span>
            </div>
            <div className="loading-bar">
              <div className="loading-progress"></div>
            </div>
            <div className="loading-details">
              <div className="loading-line">Carregando vias neurais...</div>
              <div className="loading-line">Estabelecendo conexão...</div>
              <div className="loading-line">Transpassando protocolos de segurança...</div>
              <div className="loading-line">Carregando trilha sonora...</div>
            </div>
          </div>
        ) : (
          <div className="main-interface">
            <header className="matrix-header">
              <h1 className="matrix-title glitch" data-text="A MATRIX">
                A MATRIX
              </h1>
              <p className="matrix-subtitle">Bem Vindo ao Mundo Real</p>
            </header>

            <div className="matrix-controls">
              <Button 
                className={`matrix-button red-pill ${selectedPill === 'red' ? 'selected' : ''}`}
                onClick={() => handlePillChoice('vermelha')}
                disabled={selectedPill !== null}
              >
                Pegue a Pílula Vermelha
              </Button>
              <Button 
                className={`matrix-button blue-pill ${selectedPill === 'blue' ? 'selected' : ''}`}
                onClick={() => handlePillChoice('azul')}
                disabled={selectedPill !== null}
              >
                Pegue a Pílula Azul
              </Button>
            </div>

            <div className="matrix-terminal">
              <div className="terminal-header">
                <span className="terminal-title">TERMINAL</span>
                <div className="terminal-controls">
                  <span className="control-dot red"></span>
                  <span className="control-dot yellow"></span>
                  <span className="control-dot green"></span>
                </div>
              </div>
              <div className="terminal-content">
                <div className="terminal-line">
                  <span className="prompt">neo@matrix:~$</span>
                </div>
                <div className="terminal-output">
                  {terminalText.split('\n').map((line, index) => (
                    <div key={index} className="terminal-message">
                      {line}
                    </div>
                  ))}
                </div>
                <div className="terminal-line">
                  <span className="cursor">_</span>
                </div>
              </div>
            </div>

            <div className="matrix-info">
              <div className="info-panel">
                <h3>Status de Sistema</h3>
                <div className="status-item">
                  <span className="status-label">Conexão:</span>
                  <span className="status-value connected">ATIVA</span>
                </div>
                <div className="status-item">
                  <span className="status-label">Level de Realidade:</span>
                  <span className="status-value">SIMULAÇÃO</span>
                </div>
                <div className="status-item">
                  <span className="status-label">Agentes:</span>
                  <span className="status-value warning">DETECTADOS</span>
                </div>
                <div className="status-item">
                  <span className="status-label">Status da Pílula:</span>
                  <span className={`status-value ${selectedPill ? 'selected' : ''}`}>
                    {selectedPill ? selectedPill.toUpperCase() : 'AGUARDANDO'}
                  </span>
                </div>
                <div className="status-item">
                  <span className="status-label">Audio:</span>
                  <span className={`status-value ${isPlaying ? 'connected' : ''}`}>
                    {isPlaying ? 'RODANDO' : 'PAUSADO'}
                  </span>
                </div>
              </div>
            </div>

            {selectedPill && (
              <div className="matrix-revelation">
                <div className="revelation-text">
                  {selectedPill === 'red' ? (
                    <>
                      <h2>Verdade Revelada</h2>
                      <p>Você escolheu ver o quão fundo a toca de coelho vai...</p>
                    </>
                  ) : (
                    <>
                      <h2>De volta ao sono</h2>
                      <p>A ignorância é uma benção... O Sonho continua.</p>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default App

