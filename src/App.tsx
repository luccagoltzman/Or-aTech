import { useState } from 'react'
import { Orcamento } from './types'
import Header from './components/Header'
import OrcamentoForm from './components/OrcamentoForm'
import OrcamentoPreview from './components/OrcamentoPreview'
import './App.css'

function App() {
  const [orcamento, setOrcamento] = useState<Orcamento | null>(null)
  const [mostrarPreview, setMostrarPreview] = useState(false)

  const handleGerarOrcamento = (novoOrcamento: Orcamento) => {
    setOrcamento(novoOrcamento)
    setMostrarPreview(true)
  }

  const handleVoltar = () => {
    setMostrarPreview(false)
  }

  return (
    <div className="app">
      <Header />
      <main className="main-content">
        {!mostrarPreview ? (
          <OrcamentoForm onGerarOrcamento={handleGerarOrcamento} />
        ) : (
          orcamento && (
            <OrcamentoPreview orcamento={orcamento} onVoltar={handleVoltar} />
          )
        )}
      </main>
    </div>
  )
}

export default App

