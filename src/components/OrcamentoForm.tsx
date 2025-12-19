import { useState, useEffect } from 'react'
import { Orcamento, OrcamentoItem } from '../types'
import './OrcamentoForm.css'

interface OrcamentoFormProps {
  onGerarOrcamento: (orcamento: Orcamento) => void
  orcamentoParaEditar?: Orcamento | null
}

const CATEGORIAS_BACKEND = [
  'API REST',
  'Banco de Dados',
  'Integração de Pagamento',
  'Autenticação/Autorização',
  'Processamento de Dados',
  'Infraestrutura/DevOps',
  'Testes Backend',
  'Documentação API',
  'Outros Backend'
]

const CATEGORIAS_FRONTEND = [
  'Interface Web',
  'App Mobile (Android/iOS)',
  'Design/UI/UX',
  'Integração Frontend',
  'Testes Frontend',
  'Responsividade',
  'Performance',
  'Outros Frontend'
]

function OrcamentoForm({ onGerarOrcamento, orcamentoParaEditar }: OrcamentoFormProps) {
  const [numero, setNumero] = useState('')
  const [data, setData] = useState(new Date().toISOString().split('T')[0])
  const [validade, setValidade] = useState('30')
  const [tipoOrcamento, setTipoOrcamento] = useState<'preliminar' | 'definitivo'>('preliminar')
  const [prazoEntrega, setPrazoEntrega] = useState('')
  const [horasPorSemana, setHorasPorSemana] = useState(40) // Padrão: 40 horas por semana
  const [cliente, setCliente] = useState({
    nome: '',
    email: '',
    telefone: '',
    endereco: '',
    empresa: ''
  })
  const [projeto, setProjeto] = useState({
    titulo: '',
    introducao: '',
    desenvolvimento: '',
    conclusao: ''
  })
  const [itensBackend, setItensBackend] = useState<OrcamentoItem[]>([])
  const [itensFrontend, setItensFrontend] = useState<OrcamentoItem[]>([])
  const [custosOperacionais, setCustosOperacionais] = useState([
    { descricao: '', valor: 0, periodicidade: 'mensal' }
  ])
  const [modeloReceita, setModeloReceita] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [termosCondicoes, setTermosCondicoes] = useState('')
  const [desconto, setDesconto] = useState(0)

  const adicionarItemBackend = () => {
    setItensBackend([...itensBackend, {
      id: `backend-${Date.now()}`,
      categoria: 'API REST',
      descricao: '',
      descricaoDetalhada: '',
      quantidade: 1,
      horas: 0,
      valorHora: 0,
      valorUnitario: 0,
      valorTotal: 0
    }])
  }

  const adicionarItemFrontend = () => {
    setItensFrontend([...itensFrontend, {
      id: `frontend-${Date.now()}`,
      categoria: 'Interface Web',
      descricao: '',
      descricaoDetalhada: '',
      quantidade: 1,
      horas: 0,
      valorHora: 0,
      valorUnitario: 0,
      valorTotal: 0
    }])
  }

  const removerItemBackend = (id: string) => {
    if (itensBackend.length > 1) {
      setItensBackend(itensBackend.filter(item => item.id !== id))
    }
  }

  const removerItemFrontend = (id: string) => {
    if (itensFrontend.length > 1) {
      setItensFrontend(itensFrontend.filter(item => item.id !== id))
    }
  }

  const atualizarItemBackend = (id: string, campo: keyof OrcamentoItem, valor: string | number) => {
    setItensBackend(itensBackend.map(item => {
      if (item.id === id) {
        const atualizado = { ...item, [campo]: valor }
        if (campo === 'horas' || campo === 'valorHora') {
          atualizado.valorTotal = atualizado.horas * atualizado.valorHora
          atualizado.valorUnitario = atualizado.valorHora
        } else if (campo === 'quantidade' || campo === 'valorUnitario') {
          atualizado.valorTotal = atualizado.quantidade * atualizado.valorUnitario
        }
        return atualizado
      }
      return item
    }))
  }

  const atualizarItemFrontend = (id: string, campo: keyof OrcamentoItem, valor: string | number) => {
    setItensFrontend(itensFrontend.map(item => {
      if (item.id === id) {
        const atualizado = { ...item, [campo]: valor }
        if (campo === 'horas' || campo === 'valorHora') {
          atualizado.valorTotal = atualizado.horas * atualizado.valorHora
          atualizado.valorUnitario = atualizado.valorHora
        } else if (campo === 'quantidade' || campo === 'valorUnitario') {
          atualizado.valorTotal = atualizado.quantidade * atualizado.valorUnitario
        }
        return atualizado
      }
      return item
    }))
  }

  const handleNumberInputChange = (
    id: string, 
    campo: 'horas' | 'valorHora', 
    e: React.ChangeEvent<HTMLInputElement>,
    tipo: 'backend' | 'frontend'
  ) => {
    const valor = e.target.value
    
    // Se o campo está vazio, define como 0
    if (valor === '') {
      if (tipo === 'backend') {
        atualizarItemBackend(id, campo, 0)
      } else {
        atualizarItemFrontend(id, campo, 0)
      }
      return
    }
    
    // Remove zeros à esquerda, mas mantém pelo menos um dígito
    const valorLimpo = valor.replace(/^0+(?=\d)/, '') || valor
    const valorNumerico = parseFloat(valorLimpo)
    
    // Se não for um número válido, mantém 0
    if (isNaN(valorNumerico)) {
      if (tipo === 'backend') {
        atualizarItemBackend(id, campo, 0)
      } else {
        atualizarItemFrontend(id, campo, 0)
      }
    } else {
      if (tipo === 'backend') {
        atualizarItemBackend(id, campo, valorNumerico)
      } else {
        atualizarItemFrontend(id, campo, valorNumerico)
      }
    }
  }

  const handleNumberInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Seleciona todo o texto quando focar, facilitando substituição
    e.target.select()
  }

  const adicionarCustoOperacional = () => {
    setCustosOperacionais([...custosOperacionais, { descricao: '', valor: 0, periodicidade: 'mensal' }])
  }

  const removerCustoOperacional = (index: number) => {
    if (custosOperacionais.length > 1) {
      setCustosOperacionais(custosOperacionais.filter((_, i) => i !== index))
    }
  }

  const atualizarCustoOperacional = (index: number, campo: string, valor: string | number) => {
    setCustosOperacionais(custosOperacionais.map((custo, i) => 
      i === index ? { ...custo, [campo]: valor } : custo
    ))
  }

  const calcularSubtotal = () => {
    const totalBackend = itensBackend.reduce((sum, item) => sum + item.valorTotal, 0)
    const totalFrontend = itensFrontend.reduce((sum, item) => sum + item.valorTotal, 0)
    return totalBackend + totalFrontend
  }

  const calcularTotalHoras = () => {
    const horasBackend = itensBackend.reduce((sum, item) => sum + item.horas, 0)
    const horasFrontend = itensFrontend.reduce((sum, item) => sum + item.horas, 0)
    return horasBackend + horasFrontend
  }

  const calcularPrazoEntrega = () => {
    const totalHoras = calcularTotalHoras()
    if (totalHoras === 0) return ''
    
    const semanas = Math.ceil(totalHoras / horasPorSemana)
    return semanas === 1 ? '1 semana' : `${semanas} semanas`
  }

  // Atualiza o prazo automaticamente quando as horas mudam
  useEffect(() => {
    const totalHoras = calcularTotalHoras()
    if (totalHoras > 0) {
      const semanas = Math.ceil(totalHoras / horasPorSemana)
      const novoPrazo = semanas === 1 ? '1 semana' : `${semanas} semanas`
      // Atualiza se o campo estiver vazio ou se o valor atual corresponde ao calculado
      const semanasAtual = prazoEntrega.match(/(\d+)\s*semana/i)
      const semanasCalculadas = semanas.toString()
      if (!prazoEntrega || (semanasAtual && semanasAtual[1] === semanasCalculadas)) {
        setPrazoEntrega(novoPrazo)
      }
    } else if (!prazoEntrega) {
      setPrazoEntrega('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itensBackend, itensFrontend, horasPorSemana])

  const calcularTotal = () => {
    const subtotal = calcularSubtotal()
    return subtotal - desconto
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validação: pelo menos uma seção deve ter itens
    const itensBackendValidos = itensBackend.filter(item => item.descricao.trim() !== '')
    const itensFrontendValidos = itensFrontend.filter(item => item.descricao.trim() !== '')
    
    if (itensBackendValidos.length === 0 && itensFrontendValidos.length === 0) {
      alert('Adicione pelo menos um item em Backend ou Frontend')
      return
    }
    
    const subtotal = calcularSubtotal()
    const total = calcularTotal()
    const totalHoras = calcularTotalHoras()

    const novoOrcamento: Orcamento = {
      numero: numero || `ORC-${Date.now()}`,
      data,
      validade,
      tipo: tipoOrcamento,
      prazoEntrega,
      cliente,
      projeto,
      itens: [
        ...itensBackend.filter(item => item.descricao.trim() !== ''),
        ...itensFrontend.filter(item => item.descricao.trim() !== '')
      ],
      custosOperacionais: custosOperacionais.filter(c => c.descricao.trim() !== ''),
      modeloReceita,
      observacoes,
      termosCondicoes: termosCondicoes || 'Este orçamento é válido pelo prazo indicado e está sujeito à aprovação do cliente. O desenvolvimento seguirá as melhores práticas de mercado e será entregue conforme especificado.',
      subtotal,
      desconto,
      total,
      totalHoras
    }

    onGerarOrcamento(novoOrcamento)
  }

  // Carrega dados do orçamento para edição
  useEffect(() => {
    if (orcamentoParaEditar) {
      setNumero(orcamentoParaEditar.numero)
      setData(orcamentoParaEditar.data)
      setValidade(orcamentoParaEditar.validade)
      setTipoOrcamento(orcamentoParaEditar.tipo)
      setPrazoEntrega(orcamentoParaEditar.prazoEntrega || '')
      setCliente(orcamentoParaEditar.cliente)
      setProjeto(orcamentoParaEditar.projeto)
      setCustosOperacionais(orcamentoParaEditar.custosOperacionais.length > 0 ? orcamentoParaEditar.custosOperacionais : [{ descricao: '', valor: 0, periodicidade: 'mensal' }])
      setModeloReceita(orcamentoParaEditar.modeloReceita || '')
      setObservacoes(orcamentoParaEditar.observacoes)
      setTermosCondicoes(orcamentoParaEditar.termosCondicoes)
      setDesconto(orcamentoParaEditar.desconto)
      
      // Separa itens em backend e frontend
      const categoriasBackend = [
        'API REST', 'Banco de Dados', 'Integração de Pagamento',
        'Autenticação/Autorização', 'Processamento de Dados',
        'Infraestrutura/DevOps', 'Testes Backend', 'Documentação API', 'Outros Backend'
      ]
      
      const backendItems = orcamentoParaEditar.itens.filter(item => categoriasBackend.includes(item.categoria))
      const frontendItems = orcamentoParaEditar.itens.filter(item => !categoriasBackend.includes(item.categoria))
      
      setItensBackend(backendItems.length > 0 ? backendItems : [])
      setItensFrontend(frontendItems.length > 0 ? frontendItems : [])
    }
  }, [orcamentoParaEditar])

  const handleImportarJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const jsonContent = e.target?.result as string
        const orcamentoImportado = JSON.parse(jsonContent) as Orcamento
        
        // Valida se é um orçamento válido
        if (!orcamentoImportado.numero || !orcamentoImportado.data || !orcamentoImportado.itens) {
          alert('Arquivo JSON inválido. Certifique-se de que é um orçamento exportado desta plataforma.')
          return
        }

        // Carrega os dados no formulário
        setNumero(orcamentoImportado.numero)
        setData(orcamentoImportado.data)
        setValidade(orcamentoImportado.validade)
        setTipoOrcamento(orcamentoImportado.tipo)
        setPrazoEntrega(orcamentoImportado.prazoEntrega || '')
        setCliente(orcamentoImportado.cliente)
        setProjeto(orcamentoImportado.projeto)
        setCustosOperacionais(orcamentoImportado.custosOperacionais.length > 0 ? orcamentoImportado.custosOperacionais : [{ descricao: '', valor: 0, periodicidade: 'mensal' }])
        setModeloReceita(orcamentoImportado.modeloReceita || '')
        setObservacoes(orcamentoImportado.observacoes)
        setTermosCondicoes(orcamentoImportado.termosCondicoes)
        setDesconto(orcamentoImportado.desconto)
        
        // Separa itens em backend e frontend
        const categoriasBackend = [
          'API REST', 'Banco de Dados', 'Integração de Pagamento',
          'Autenticação/Autorização', 'Processamento de Dados',
          'Infraestrutura/DevOps', 'Testes Backend', 'Documentação API', 'Outros Backend'
        ]
        
        const backendItems = orcamentoImportado.itens.filter(item => categoriasBackend.includes(item.categoria))
        const frontendItems = orcamentoImportado.itens.filter(item => !categoriasBackend.includes(item.categoria))
        
        setItensBackend(backendItems.length > 0 ? backendItems : [])
        setItensFrontend(frontendItems.length > 0 ? frontendItems : [])
        
        alert('Orçamento importado com sucesso! Você pode editá-lo agora.')
      } catch (error) {
        console.error('Erro ao importar JSON:', error)
        alert('Erro ao importar arquivo JSON. Certifique-se de que o arquivo está no formato correto.')
      }
    }
    reader.readAsText(file)
    
    // Limpa o input para permitir importar o mesmo arquivo novamente
    event.target.value = ''
  }

  const [mostrarRascunhos, setMostrarRascunhos] = useState(false)
  const [rascunhosSalvos, setRascunhosSalvos] = useState<any[]>([])

  useEffect(() => {
    // Carrega rascunhos salvos do localStorage
    const rascunhos = JSON.parse(localStorage.getItem('orcamentos-salvos') || '[]')
    setRascunhosSalvos(rascunhos)
  }, [])

  const carregarRascunho = (numero: string) => {
    const jsonData = localStorage.getItem(`orcamento-${numero}`)
    if (!jsonData) {
      alert('Rascunho não encontrado')
      return
    }

    try {
      const orcamentoImportado = JSON.parse(jsonData) as Orcamento
      
      setNumero(orcamentoImportado.numero)
      setData(orcamentoImportado.data)
      setValidade(orcamentoImportado.validade)
      setTipoOrcamento(orcamentoImportado.tipo)
      setPrazoEntrega(orcamentoImportado.prazoEntrega || '')
      setCliente(orcamentoImportado.cliente)
      setProjeto(orcamentoImportado.projeto)
      setCustosOperacionais(orcamentoImportado.custosOperacionais.length > 0 ? orcamentoImportado.custosOperacionais : [{ descricao: '', valor: 0, periodicidade: 'mensal' }])
      setModeloReceita(orcamentoImportado.modeloReceita || '')
      setObservacoes(orcamentoImportado.observacoes)
      setTermosCondicoes(orcamentoImportado.termosCondicoes)
      setDesconto(orcamentoImportado.desconto)
      
      const categoriasBackend = [
        'API REST', 'Banco de Dados', 'Integração de Pagamento',
        'Autenticação/Autorização', 'Processamento de Dados',
        'Infraestrutura/DevOps', 'Testes Backend', 'Documentação API', 'Outros Backend'
      ]
      
      const backendItems = orcamentoImportado.itens.filter(item => categoriasBackend.includes(item.categoria))
      const frontendItems = orcamentoImportado.itens.filter(item => !categoriasBackend.includes(item.categoria))
      
      setItensBackend(backendItems.length > 0 ? backendItems : [])
      setItensFrontend(frontendItems.length > 0 ? frontendItems : [])
      
      setMostrarRascunhos(false)
      alert('Rascunho carregado com sucesso!')
    } catch (error) {
      console.error('Erro ao carregar rascunho:', error)
      alert('Erro ao carregar rascunho')
    }
  }

  const removerRascunho = (numero: string) => {
    if (confirm('Deseja realmente remover este rascunho?')) {
      localStorage.removeItem(`orcamento-${numero}`)
      const novosRascunhos = rascunhosSalvos.filter(r => r.numero !== numero)
      localStorage.setItem('orcamentos-salvos', JSON.stringify(novosRascunhos))
      setRascunhosSalvos(novosRascunhos)
    }
  }

  return (
    <div className="form-container">
      <div className="form-header">
        <h2 className="form-title">Criar Orçamento Técnico Detalhado</h2>
        <div className="import-section">
          <div className="import-wrapper">
            <div className="import-buttons">
              <button
                type="button"
                onClick={() => setMostrarRascunhos(!mostrarRascunhos)}
                className="btn-rascunhos"
              >
                📋 Rascunhos Salvos {rascunhosSalvos.length > 0 && `(${rascunhosSalvos.length})`}
              </button>
              <label htmlFor="import-json" className="btn-import">
                📥 Importar JSON
              </label>
              <input
                id="import-json"
                type="file"
                accept=".json,application/json"
                onChange={handleImportarJSON}
                style={{ display: 'none' }}
              />
            </div>
            <small className="import-hint">
              {mostrarRascunhos 
                ? 'Selecione um rascunho abaixo ou importe um arquivo JSON'
                : 'Os orçamentos são salvos automaticamente. Clique em "Rascunhos Salvos" para ver.'}
            </small>
          </div>
        </div>
      </div>
      
      {mostrarRascunhos && rascunhosSalvos.length > 0 && (
        <div className="rascunhos-container">
          <h3>Rascunhos Salvos</h3>
          <div className="rascunhos-list">
            {rascunhosSalvos.map((rascunho) => (
              <div key={rascunho.numero} className="rascunho-item">
                <div className="rascunho-info">
                  <strong>{rascunho.titulo}</strong>
                  <span>Nº {rascunho.numero}</span>
                  <span>{new Date(rascunho.data).toLocaleDateString('pt-BR')}</span>
                  <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(rascunho.total)}</span>
                </div>
                <div className="rascunho-actions">
                  <button
                    type="button"
                    onClick={() => carregarRascunho(rascunho.numero)}
                    className="btn-carregar"
                  >
                    Carregar
                  </button>
                  <button
                    type="button"
                    onClick={() => removerRascunho(rascunho.numero)}
                    className="btn-remover-rascunho"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <form onSubmit={handleSubmit} className="orcamento-form">
        <div className="form-section">
          <h3>Informações do Orçamento</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Número do Orçamento</label>
              <input
                type="text"
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                placeholder="Ex: ORC-2024-001"
              />
            </div>
            <div className="form-group">
              <label>Data</label>
              <input
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Validade (dias)</label>
              <input
                type="number"
                value={validade === '0' ? '' : validade}
                onChange={(e) => {
                  const valor = e.target.value
                  const valorLimpo = valor.replace(/^0+/, '') || valor
                  setValidade(valorLimpo)
                }}
                onFocus={handleNumberInputFocus}
                placeholder="30"
                min="1"
                required
              />
            </div>
            <div className="form-group">
              <label>Tipo de Orçamento</label>
              <select
                value={tipoOrcamento}
                onChange={(e) => setTipoOrcamento(e.target.value as 'preliminar' | 'definitivo')}
                required
              >
                <option value="preliminar">Preliminar</option>
                <option value="definitivo">Definitivo</option>
              </select>
            </div>
            <div className="form-group">
              <label>Horas por Semana</label>
              <input
                type="number"
                value={horasPorSemana}
                onChange={(e) => {
                  const valor = e.target.value
                  if (valor === '') {
                    setHorasPorSemana(40)
                    return
                  }
                  const valorNumerico = parseInt(valor)
                  if (!isNaN(valorNumerico)) {
                    const valorLimitado = Math.max(1, Math.min(80, valorNumerico))
                    setHorasPorSemana(valorLimitado)
                  }
                }}
                onFocus={handleNumberInputFocus}
                min="1"
                max="80"
                step="1"
                title="Quantas horas de trabalho por semana para calcular o prazo"
              />
            </div>
            <div className="form-group">
              <label>Prazo de Entrega</label>
              <div className="prazo-container">
                <input
                  type="text"
                  value={prazoEntrega}
                  onChange={(e) => setPrazoEntrega(e.target.value)}
                  placeholder="Calculado automaticamente"
                  className="prazo-input"
                />
                {calcularTotalHoras() > 0 && (
                  <button
                    type="button"
                    onClick={() => setPrazoEntrega(calcularPrazoEntrega())}
                    className="btn-recalcular"
                    title="Recalcular prazo baseado nas horas"
                  >
                    ↻
                  </button>
                )}
              </div>
              {calcularTotalHoras() > 0 && (
                <small className="prazo-hint">
                  Calculado: {calcularTotalHoras()}h ÷ {horasPorSemana}h/semana = {calcularPrazoEntrega()}
                </small>
              )}
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Dados do Cliente</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Nome Completo / Empresa</label>
              <input
                type="text"
                value={cliente.nome}
                onChange={(e) => setCliente({ ...cliente, nome: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>E-mail</label>
              <input
                type="email"
                value={cliente.email}
                onChange={(e) => setCliente({ ...cliente, email: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Telefone</label>
              <input
                type="tel"
                value={cliente.telefone}
                onChange={(e) => setCliente({ ...cliente, telefone: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Endereço</label>
              <input
                type="text"
                value={cliente.endereco}
                onChange={(e) => setCliente({ ...cliente, endereco: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Informações do Projeto</h3>
          <div className="form-group">
            <label>Título do Projeto</label>
            <input
              type="text"
              value={projeto.titulo}
              onChange={(e) => setProjeto({ ...projeto, titulo: e.target.value })}
              placeholder="Ex: Sistema de Pagamentos Completo"
              required
            />
          </div>
          <div className="form-group">
            <label>Introdução / Visão Geral</label>
            <textarea
              value={projeto.introducao}
              onChange={(e) => setProjeto({ ...projeto, introducao: e.target.value })}
              placeholder="Descreva o projeto de forma clara e objetiva, explicando o que será desenvolvido..."
              rows={4}
              required
            />
          </div>
          <div className="form-group">
            <label>Desenvolvimento</label>
            <textarea
              value={projeto.desenvolvimento}
              onChange={(e) => setProjeto({ ...projeto, desenvolvimento: e.target.value })}
              placeholder="Descreva detalhadamente como será o desenvolvimento, metodologia, tecnologias, processos, etc..."
              rows={5}
            />
          </div>
          <div className="form-group">
            <label>Conclusão</label>
            <textarea
              value={projeto.conclusao}
              onChange={(e) => setProjeto({ ...projeto, conclusao: e.target.value })}
              placeholder="Conclusão do orçamento, benefícios esperados, próximos passos, etc..."
              rows={4}
            />
          </div>
        </div>

        <div className="form-section">
          <div className="section-header">
            <h3>Backend {itensBackend.length === 0 && <span className="section-optional">(Opcional)</span>}</h3>
            {itensBackend.length === 0 && (
              <button type="button" onClick={adicionarItemBackend} className="btn-add">
                + Adicionar Item Backend
              </button>
            )}
          </div>
          {itensBackend.length === 0 ? (
            <div className="empty-section">
              <p>Nenhum item de Backend adicionado. Clique no botão acima para adicionar.</p>
            </div>
          ) : (
            <div className="itens-container">
            {itensBackend.map((item) => (
              <div key={item.id} className="item-row-technical">
                <div className="item-categoria">
                  <label>Categoria</label>
                  <select
                    value={item.categoria}
                    onChange={(e) => atualizarItemBackend(item.id, 'categoria', e.target.value)}
                    required
                  >
                    {CATEGORIAS_BACKEND.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="item-descricao-full">
                  <label>Descrição do Item</label>
                  <input
                    type="text"
                    value={item.descricao}
                    onChange={(e) => atualizarItemBackend(item.id, 'descricao', e.target.value)}
                    placeholder="Ex: Desenvolvimento de API REST completa"
                    required
                  />
                </div>
                <div className="item-detalhes-full">
                  <label>Descrição Detalhada</label>
                  <textarea
                    value={item.descricaoDetalhada}
                    onChange={(e) => atualizarItemBackend(item.id, 'descricaoDetalhada', e.target.value)}
                    placeholder="Descreva em detalhes o que será desenvolvido, funcionalidades, tecnologias utilizadas..."
                    rows={3}
                  />
                </div>
                <div className="item-metrics">
                  <div className="item-horas">
                    <label>Horas</label>
                    <input
                      type="number"
                      value={item.horas === 0 ? '' : item.horas}
                      onChange={(e) => handleNumberInputChange(item.id, 'horas', e, 'backend')}
                      onFocus={handleNumberInputFocus}
                      min="0"
                      step="0.5"
                      required
                    />
                  </div>
                  <div className="item-valor-hora">
                    <label>Valor/Hora (R$)</label>
                    <input
                      type="number"
                      value={item.valorHora === 0 ? '' : item.valorHora}
                      onChange={(e) => handleNumberInputChange(item.id, 'valorHora', e, 'backend')}
                      onFocus={handleNumberInputFocus}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div className="item-total">
                    <label>Total</label>
                    <input
                      type="text"
                      value={new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(item.valorTotal)}
                      readOnly
                      className="readonly"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removerItemBackend(item.id)}
                  className="btn-remove"
                  title="Remover item"
                >
                  ×
                </button>
              </div>
            ))}
            </div>
          )}
          {itensBackend.length > 0 && (
            <div className="section-footer">
              <button type="button" onClick={adicionarItemBackend} className="btn-add btn-add-footer">
                + Adicionar Item Backend
              </button>
            </div>
          )}
        </div>

        <div className="form-section">
          <div className="section-header">
            <h3>Frontend {itensFrontend.length === 0 && <span className="section-optional">(Opcional)</span>}</h3>
            {itensFrontend.length === 0 && (
              <button type="button" onClick={adicionarItemFrontend} className="btn-add">
                + Adicionar Item Frontend
              </button>
            )}
          </div>
          {itensFrontend.length === 0 ? (
            <div className="empty-section">
              <p>Nenhum item de Frontend adicionado. Clique no botão acima para adicionar.</p>
            </div>
          ) : (
            <div className="itens-container">
            {itensFrontend.map((item) => (
              <div key={item.id} className="item-row-technical">
                <div className="item-categoria">
                  <label>Categoria</label>
                  <select
                    value={item.categoria}
                    onChange={(e) => atualizarItemFrontend(item.id, 'categoria', e.target.value)}
                    required
                  >
                    {CATEGORIAS_FRONTEND.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="item-descricao-full">
                  <label>Descrição do Item</label>
                  <input
                    type="text"
                    value={item.descricao}
                    onChange={(e) => atualizarItemFrontend(item.id, 'descricao', e.target.value)}
                    placeholder="Ex: Interface web responsiva"
                    required
                  />
                </div>
                <div className="item-detalhes-full">
                  <label>Descrição Detalhada</label>
                  <textarea
                    value={item.descricaoDetalhada}
                    onChange={(e) => atualizarItemFrontend(item.id, 'descricaoDetalhada', e.target.value)}
                    placeholder="Descreva em detalhes o que será desenvolvido, funcionalidades, tecnologias utilizadas..."
                    rows={3}
                  />
                </div>
                <div className="item-metrics">
                  <div className="item-horas">
                    <label>Horas</label>
                    <input
                      type="number"
                      value={item.horas === 0 ? '' : item.horas}
                      onChange={(e) => handleNumberInputChange(item.id, 'horas', e, 'frontend')}
                      onFocus={handleNumberInputFocus}
                      min="0"
                      step="0.5"
                      required
                    />
                  </div>
                  <div className="item-valor-hora">
                    <label>Valor/Hora (R$)</label>
                    <input
                      type="number"
                      value={item.valorHora === 0 ? '' : item.valorHora}
                      onChange={(e) => handleNumberInputChange(item.id, 'valorHora', e, 'frontend')}
                      onFocus={handleNumberInputFocus}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div className="item-total">
                    <label>Total</label>
                    <input
                      type="text"
                      value={new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(item.valorTotal)}
                      readOnly
                      className="readonly"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removerItemFrontend(item.id)}
                  className="btn-remove"
                  title="Remover item"
                >
                  ×
                </button>
              </div>
            ))}
            </div>
          )}
          {itensFrontend.length > 0 && (
            <div className="section-footer">
              <button type="button" onClick={adicionarItemFrontend} className="btn-add btn-add-footer">
                + Adicionar Item Frontend
              </button>
            </div>
          )}
          <div className="resumo-horas">
            <strong>Total de Horas: {calcularTotalHoras()}h</strong>
          </div>
        </div>

        <div className="form-section">
          <div className="section-header">
            <h3>Custos Operacionais (Opcional)</h3>
            <button type="button" onClick={adicionarCustoOperacional} className="btn-add">
              + Adicionar Custo
            </button>
          </div>
          <div className="custos-container">
            {custosOperacionais.map((custo, index) => (
              <div key={index} className="custo-row">
                <div className="custo-descricao">
                  <label>Descrição</label>
                  <input
                    type="text"
                    value={custo.descricao}
                    onChange={(e) => atualizarCustoOperacional(index, 'descricao', e.target.value)}
                    placeholder="Ex: Servidor, Asaas, etc."
                  />
                </div>
                <div className="custo-valor">
                  <label>Valor (R$)</label>
                  <input
                    type="number"
                    value={custo.valor === 0 ? '' : custo.valor}
                    onChange={(e) => {
                      const valor = e.target.value
                      const valorLimpo = valor === '' || valor === '0' ? 0 : parseFloat(valor.replace(/^0+/, '') || '0') || 0
                      atualizarCustoOperacional(index, 'valor', valorLimpo)
                    }}
                    onFocus={handleNumberInputFocus}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="custo-periodicidade">
                  <label>Periodicidade</label>
                  <select
                    value={custo.periodicidade}
                    onChange={(e) => atualizarCustoOperacional(index, 'periodicidade', e.target.value)}
                  >
                    <option value="mensal">Mensal</option>
                    <option value="anual">Anual</option>
                    <option value="unico">Único</option>
                  </select>
                </div>
                {custosOperacionais.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removerCustoOperacional(index)}
                    className="btn-remove"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="form-section">
          <h3>Modelo de Receita (Opcional)</h3>
          <textarea
            value={modeloReceita}
            onChange={(e) => setModeloReceita(e.target.value)}
            placeholder="Descreva o modelo de receita, taxas, comissões, etc. (opcional)"
            rows={3}
          />
        </div>

        <div className="form-section">
          <h3>Valores</h3>
          <div className="valores-container">
            <div className="valor-row">
              <span>Subtotal:</span>
              <span className="valor">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(calcularSubtotal())}
              </span>
            </div>
            <div className="valor-row">
              <div className="desconto-input">
                <label>Desconto:</label>
                <input
                  type="number"
                  value={desconto === 0 ? '' : desconto}
                  onChange={(e) => {
                    const valor = e.target.value
                    const valorLimpo = valor === '' || valor === '0' ? 0 : parseFloat(valor.replace(/^0+/, '') || '0') || 0
                    setDesconto(valorLimpo)
                  }}
                  onFocus={handleNumberInputFocus}
                  min="0"
                  step="0.01"
                />
              </div>
              <span className="valor">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(desconto)}
              </span>
            </div>
            <div className="valor-row total-row">
              <span>Total:</span>
              <span className="valor total">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(calcularTotal())}
              </span>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Observações Adicionais</h3>
          <textarea
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            placeholder="Informações adicionais, condições de pagamento, cronograma detalhado, etc."
            rows={4}
          />
        </div>

        <div className="form-section">
          <h3>Termos e Condições</h3>
          <textarea
            value={termosCondicoes}
            onChange={(e) => setTermosCondicoes(e.target.value)}
            placeholder="Termos e condições do orçamento (deixe em branco para usar o padrão)"
            rows={4}
          />
        </div>

        <button type="submit" className="btn-submit">
          Gerar Orçamento Técnico
        </button>
      </form>
    </div>
  )
}

export default OrcamentoForm
