import { useState } from 'react'
import { Button } from '@/components/ui/button'
import './App.css'

function App() {
  const [health, setHealth] = useState<{ ok?: boolean } | null>(null)
  const [loading, setLoading] = useState(false)

  const checkHealth = async () => {
    setLoading(true)
    setHealth(null)
    try {
      const res = await fetch('/api/health')
      const data = await res.json().catch(() => ({}))
      setHealth(res.ok ? data : { ok: false, error: `API returned ${res.status}`, hint: 'Is the API running? Try: cd api && node ace serve' })
    } catch (e) {
      setHealth({ ok: false, error: 'Request failed', hint: 'Start the API: cd api && node ace serve' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '2rem', maxWidth: 480, margin: '0 auto' }}>
      <h1>PRG Batch System</h1>
      <p>Stage 0 — API + Web + shadcn/ui</p>
      <Button onClick={checkHealth} disabled={loading}>
        {loading ? 'Checking…' : 'Check API health'}
      </Button>
      {health && (
        <pre style={{ marginTop: '1rem', padding: '1rem', background: '#1a1a1a', borderRadius: 8 }}>
          {JSON.stringify(health, null, 2)}
        </pre>
      )}
    </div>
  )
}

export default App
