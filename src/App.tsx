import { useState } from 'react'
import { Orcamento } from './types'
import Header from './components/Header'
import OrcamentoForm from './components/OrcamentoForm'
import OrcamentoPreview from './components/OrcamentoPreview'
import './App.css'

function App() {
  const [orcamento, setOrcamento] = useState<Orcamento | null>(null)
  const [mostrarPreview, setMostrarPreview] = useState(false)
  const [orcamentoParaEditar, setOrcamentoParaEditar] = useState<Orcamento | null>(null)

  const handleGerarOrcamento = (novoOrcamento: Orcamento) => {
    setOrcamento(novoOrcamento)
    setMostrarPreview(true)
    setOrcamentoParaEditar(null) // Limpa o orçamento para edição após gerar
  }

  const handleVoltar = () => {
    setMostrarPreview(false)
    setOrcamentoParaEditar(orcamento) // Salva o orçamento atual para possível edição
  }

  const handleEditarOrcamento = () => {
    setMostrarPreview(false)
    setOrcamentoParaEditar(orcamento)
  }

  return (
    <div className="app">
      <Header />
      <main className="main-content">
        {!mostrarPreview ? (
          <OrcamentoForm 
            onGerarOrcamento={handleGerarOrcamento} 
            orcamentoParaEditar={orcamentoParaEditar}
          />
        ) : (
          orcamento && (
            <OrcamentoPreview 
              orcamento={orcamento} 
              onVoltar={handleVoltar}
              onEditar={handleEditarOrcamento}
            />
          )
        )}
      </main>
    </div>
  )
}

export default App

