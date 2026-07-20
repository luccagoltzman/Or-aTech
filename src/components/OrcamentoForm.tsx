import { useState, useEffect } from 'react'
import { ModoOrcamento, Orcamento, OrcamentoItem, SecoesPdf } from '../types'
import {
  CATEGORIAS_BACKEND,
  CATEGORIAS_FRONTEND,
  CATEGORIAS_IMPLANTACOES,
  SECOES_PDF_PADRAO,
  mostrarBackend,
  mostrarFrontend,
  mostrarImplantacoes,
  separarItensPorCategoria,
  inferirModo
} from '../constants/categorias'
import './OrcamentoForm.css'

interface OrcamentoFormProps {
  onGerarOrcamento: (orcamento: Orcamento) => void
  orcamentoParaEditar?: Orcamento | null
}

type SecaoItens = 'backend' | 'frontend' | 'implantacoes'

function criarItemVazio(secao: SecaoItens): OrcamentoItem {
  const categorias = {
    backend: CATEGORIAS_BACKEND[0],
    frontend: CATEGORIAS_FRONTEND[0],
    implantacoes: CATEGORIAS_IMPLANTACOES[0]
  }
  return {
    id: `${secao}-${Date.now()}`,
    categoria: categorias[secao],
    descricao: '',
    descricaoDetalhada: '',
    quantidade: 1,
    horas: 0,
    valorHora: 0,
    valorUnitario: 0,
    valorTotal: 0
  }
}

function OrcamentoForm({ onGerarOrcamento, orcamentoParaEditar }: OrcamentoFormProps) {
  const [numero, setNumero] = useState('')
  const [data, setData] = useState(new Date().toISOString().split('T')[0])
  const [validade, setValidade] = useState('30')
  const [tipoOrcamento, setTipoOrcamento] = useState<'preliminar' | 'definitivo'>('preliminar')
  const [modo, setModo] = useState<ModoOrcamento>('desenvolvimento')
  const [prazoEntrega, setPrazoEntrega] = useState('')
  const [horasPorSemana, setHorasPorSemana] = useState(40)
  const [cliente, setCliente] = useState<{
    nome: string
    email: string
    telefone: string
    endereco: string
    empresa?: string
  }>({
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
  const [itensImplantacoes, setItensImplantacoes] = useState<OrcamentoItem[]>([])
  const [custosOperacionais, setCustosOperacionais] = useState([
    { descricao: '', valor: 0, periodicidade: 'mensal' }
  ])
  const [modeloReceita, setModeloReceita] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [termosCondicoes, setTermosCondicoes] = useState('')
  const [desconto, setDesconto] = useState(0)
  const [secoesPdf, setSecoesPdf] = useState<SecoesPdf>({ ...SECOES_PDF_PADRAO })
  const [mostrarRascunhos, setMostrarRascunhos] = useState(false)
  const [rascunhosSalvos, setRascunhosSalvos] = useState<any[]>([])

  const exibirBackend = mostrarBackend(modo)
  const exibirFrontend = mostrarFrontend(modo)
  const exibirImplantacoes = mostrarImplantacoes(modo)

  const adicionarItemBackend = () => setItensBackend([...itensBackend, criarItemVazio('backend')])
  const adicionarItemFrontend = () => setItensFrontend([...itensFrontend, criarItemVazio('frontend')])
  const adicionarItemImplantacao = () => setItensImplantacoes([...itensImplantacoes, criarItemVazio('implantacoes')])

  const removerItemBackend = (id: string) => {
    setItensBackend(itensBackend.filter(item => item.id !== id))
  }
  const removerItemFrontend = (id: string) => {
    setItensFrontend(itensFrontend.filter(item => item.id !== id))
  }
  const removerItemImplantacao = (id: string) => {
    setItensImplantacoes(itensImplantacoes.filter(item => item.id !== id))
  }

  const atualizarItem = (
    setter: React.Dispatch<React.SetStateAction<OrcamentoItem[]>>,
    itens: OrcamentoItem[],
    id: string,
    campo: keyof OrcamentoItem,
    valor: string | number
  ) => {
    setter(itens.map(item => {
      if (item.id !== id) return item
      const atualizado = { ...item, [campo]: valor }
      if (campo === 'horas' || campo === 'valorHora') {
        atualizado.valorTotal = atualizado.horas * atualizado.valorHora
        atualizado.valorUnitario = atualizado.valorHora
      } else if (campo === 'quantidade' || campo === 'valorUnitario') {
        atualizado.valorTotal = atualizado.quantidade * atualizado.valorUnitario
      }
      return atualizado
    }))
  }

  const atualizarItemBackend = (id: string, campo: keyof OrcamentoItem, valor: string | number) =>
    atualizarItem(setItensBackend, itensBackend, id, campo, valor)
  const atualizarItemFrontend = (id: string, campo: keyof OrcamentoItem, valor: string | number) =>
    atualizarItem(setItensFrontend, itensFrontend, id, campo, valor)
  const atualizarItemImplantacao = (id: string, campo: keyof OrcamentoItem, valor: string | number) =>
    atualizarItem(setItensImplantacoes, itensImplantacoes, id, campo, valor)

  const handleNumberInputChange = (
    id: string,
    campo: 'horas' | 'valorHora',
    e: React.ChangeEvent<HTMLInputElement>,
    secao: SecaoItens
  ) => {
    const valor = e.target.value
    const atualizar = {
      backend: atualizarItemBackend,
      frontend: atualizarItemFrontend,
      implantacoes: atualizarItemImplantacao
    }[secao]

    if (valor === '') {
      atualizar(id, campo, 0)
      return
    }

    const valorLimpo = valor.replace(/^0+(?=\d)/, '') || valor
    const valorNumerico = parseFloat(valorLimpo)
    atualizar(id, campo, isNaN(valorNumerico) ? 0 : valorNumerico)
  }

  const handleNumberInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
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

  const itensAtivos = () => {
    const itens: OrcamentoItem[] = []
    if (exibirBackend) itens.push(...itensBackend)
    if (exibirFrontend) itens.push(...itensFrontend)
    if (exibirImplantacoes) itens.push(...itensImplantacoes)
    return itens
  }

  const calcularSubtotal = () => itensAtivos().reduce((sum, item) => sum + item.valorTotal, 0)
  const calcularTotalHoras = () => itensAtivos().reduce((sum, item) => sum + item.horas, 0)

  const calcularPrazoEntrega = () => {
    const totalHoras = calcularTotalHoras()
    if (totalHoras === 0) return ''
    const semanas = Math.ceil(totalHoras / horasPorSemana)
    return semanas === 1 ? '1 semana' : `${semanas} semanas`
  }

  useEffect(() => {
    const totalHoras = calcularTotalHoras()
    if (totalHoras > 0) {
      const semanas = Math.ceil(totalHoras / horasPorSemana)
      const novoPrazo = semanas === 1 ? '1 semana' : `${semanas} semanas`
      const semanasAtual = prazoEntrega.match(/(\d+)\s*semana/i)
      const semanasCalculadas = semanas.toString()
      if (!prazoEntrega || (semanasAtual && semanasAtual[1] === semanasCalculadas)) {
        setPrazoEntrega(novoPrazo)
      }
    } else if (!prazoEntrega) {
      setPrazoEntrega('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itensBackend, itensFrontend, itensImplantacoes, horasPorSemana, modo])

  const calcularTotal = () => calcularSubtotal() - desconto

  const carregarOrcamentoNoFormulario = (orcamento: Orcamento) => {
    setNumero(orcamento.numero)
    setData(orcamento.data)
    setValidade(orcamento.validade)
    setTipoOrcamento(orcamento.tipo)
    setPrazoEntrega(orcamento.prazoEntrega || '')
    setCliente({
      ...orcamento.cliente,
      empresa: orcamento.cliente.empresa || ''
    })
    setProjeto(orcamento.projeto)
    setCustosOperacionais(
      orcamento.custosOperacionais.length > 0
        ? orcamento.custosOperacionais
        : [{ descricao: '', valor: 0, periodicidade: 'mensal' }]
    )
    setModeloReceita(orcamento.modeloReceita || '')
    setObservacoes(orcamento.observacoes)
    setTermosCondicoes(orcamento.termosCondicoes)
    setDesconto(orcamento.desconto)
    setSecoesPdf({ ...SECOES_PDF_PADRAO, ...orcamento.secoesPdf })

    const { backend, frontend, implantacoes } = separarItensPorCategoria(orcamento.itens)
    setItensBackend(backend)
    setItensFrontend(frontend)
    setItensImplantacoes(implantacoes)
    setModo(inferirModo(orcamento.itens, orcamento.modo))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const backendValidos = exibirBackend ? itensBackend.filter(i => i.descricao.trim() !== '') : []
    const frontendValidos = exibirFrontend ? itensFrontend.filter(i => i.descricao.trim() !== '') : []
    const implantacoesValidos = exibirImplantacoes ? itensImplantacoes.filter(i => i.descricao.trim() !== '') : []

    if (backendValidos.length === 0 && frontendValidos.length === 0 && implantacoesValidos.length === 0) {
      alert(
        modo === 'implantacoes'
          ? 'Adicione pelo menos um item de Implantação'
          : 'Adicione pelo menos um item nas seções ativas do orçamento'
      )
      return
    }

    const itens = [...backendValidos, ...frontendValidos, ...implantacoesValidos]
    const subtotal = calcularSubtotal()
    const total = calcularTotal()
    const totalHoras = calcularTotalHoras()

    const novoOrcamento: Orcamento = {
      numero: numero || `ORC-${Date.now()}`,
      data,
      validade,
      tipo: tipoOrcamento,
      modo,
      prazoEntrega,
      cliente,
      projeto,
      itens,
      custosOperacionais: custosOperacionais.filter(c => c.descricao.trim() !== ''),
      modeloReceita,
      observacoes,
      termosCondicoes:
        termosCondicoes ||
        'Este orçamento é válido pelo prazo indicado e está sujeito à aprovação do cliente. O desenvolvimento seguirá as melhores práticas de mercado e será entregue conforme especificado.',
      subtotal,
      desconto,
      total,
      totalHoras,
      secoesPdf
    }

    onGerarOrcamento(novoOrcamento)
  }

  useEffect(() => {
    if (orcamentoParaEditar) {
      carregarOrcamentoNoFormulario(orcamentoParaEditar)
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

        if (!orcamentoImportado.numero || !orcamentoImportado.data || !orcamentoImportado.itens) {
          alert('Arquivo JSON inválido. Certifique-se de que é um orçamento exportado desta plataforma.')
          return
        }

        carregarOrcamentoNoFormulario(orcamentoImportado)
        alert('Orçamento importado com sucesso! Você pode editá-lo agora.')
      } catch (error) {
        console.error('Erro ao importar JSON:', error)
        alert('Erro ao importar arquivo JSON. Certifique-se de que o arquivo está no formato correto.')
      }
    }
    reader.readAsText(file)
    event.target.value = ''
  }

  useEffect(() => {
    const rascunhos = JSON.parse(localStorage.getItem('orcamentos-salvos') || '[]')
    setRascunhosSalvos(rascunhos)
  }, [])

  const carregarRascunho = (numeroRascunho: string) => {
    const jsonData = localStorage.getItem(`orcamento-${numeroRascunho}`)
    if (!jsonData) {
      alert('Rascunho não encontrado')
      return
    }

    try {
      const orcamentoImportado = JSON.parse(jsonData) as Orcamento
      carregarOrcamentoNoFormulario(orcamentoImportado)
      setMostrarRascunhos(false)
      alert('Rascunho carregado com sucesso!')
    } catch (error) {
      console.error('Erro ao carregar rascunho:', error)
      alert('Erro ao carregar rascunho')
    }
  }

  const removerRascunho = (numeroRascunho: string) => {
    if (confirm('Deseja realmente remover este rascunho?')) {
      localStorage.removeItem(`orcamento-${numeroRascunho}`)
      const novosRascunhos = rascunhosSalvos.filter(r => r.numero !== numeroRascunho)
      localStorage.setItem('orcamentos-salvos', JSON.stringify(novosRascunhos))
      setRascunhosSalvos(novosRascunhos)
    }
  }

  const toggleSecaoPdf = (chave: keyof SecoesPdf) => {
    setSecoesPdf(prev => ({ ...prev, [chave]: !prev[chave] }))
  }

  const renderItemForm = (
    item: OrcamentoItem,
    secao: SecaoItens,
    categorias: readonly string[],
    onUpdate: (id: string, campo: keyof OrcamentoItem, valor: string | number) => void,
    onRemove: (id: string) => void,
    placeholderDesc: string
  ) => (
    <div key={item.id} className="item-row-technical">
      <div className="item-categoria">
        <label>Categoria</label>
        <select
          value={item.categoria}
          onChange={(e) => onUpdate(item.id, 'categoria', e.target.value)}
          required
        >
          {categorias.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>
      <div className="item-descricao-full">
        <label>Descrição do Item</label>
        <input
          type="text"
          value={item.descricao}
          onChange={(e) => onUpdate(item.id, 'descricao', e.target.value)}
          placeholder={placeholderDesc}
          required
        />
      </div>
      <div className="item-detalhes-full">
        <label>Descrição Detalhada</label>
        <textarea
          value={item.descricaoDetalhada}
          onChange={(e) => onUpdate(item.id, 'descricaoDetalhada', e.target.value)}
          placeholder="Descreva em detalhes o que será realizado..."
          rows={3}
        />
      </div>
      <div className="item-metrics">
        <div className="item-horas">
          <label>Horas</label>
          <input
            type="number"
            value={item.horas === 0 ? '' : item.horas}
            onChange={(e) => handleNumberInputChange(item.id, 'horas', e, secao)}
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
            onChange={(e) => handleNumberInputChange(item.id, 'valorHora', e, secao)}
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
        onClick={() => onRemove(item.id)}
        className="btn-remove"
        title="Remover item"
      >
        ×
      </button>
    </div>
  )

  const tituloFormulario =
    modo === 'implantacoes'
      ? 'Criar Orçamento de Implantação'
      : modo === 'completo'
        ? 'Criar Orçamento Completo'
        : 'Criar Orçamento Técnico Detalhado'

  return (
    <div className="form-container">
      <div className="form-header">
        <h2 className="form-title">{tituloFormulario}</h2>
        <div className="import-section">
          <div className="import-wrapper">
            <div className="import-buttons">
              <button
                type="button"
                onClick={() => setMostrarRascunhos(!mostrarRascunhos)}
                className="btn-rascunhos"
              >
                Rascunhos Salvos {rascunhosSalvos.length > 0 && `(${rascunhosSalvos.length})`}
              </button>
              <label htmlFor="import-json" className="btn-import">
                Importar JSON
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
          <h3>Modo do Orçamento</h3>
          <div className="modo-selector">
            <button
              type="button"
              className={`modo-option ${modo === 'desenvolvimento' ? 'active' : ''}`}
              onClick={() => setModo('desenvolvimento')}
            >
              <strong>Desenvolvimento</strong>
              <span>Backend e Frontend</span>
            </button>
            <button
              type="button"
              className={`modo-option ${modo === 'implantacoes' ? 'active' : ''}`}
              onClick={() => setModo('implantacoes')}
            >
              <strong>Implantações</strong>
              <span>Somente implantação</span>
            </button>
            <button
              type="button"
              className={`modo-option ${modo === 'completo' ? 'active' : ''}`}
              onClick={() => setModo('completo')}
            >
              <strong>Completo</strong>
              <span>Desenvolvimento + Implantação</span>
            </button>
          </div>
        </div>

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
                    setHorasPorSemana(Math.max(1, Math.min(80, valorNumerico)))
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
              placeholder="Descreva o projeto de forma clara e objetiva..."
              rows={4}
              required
            />
          </div>
          <div className="form-group">
            <label>{modo === 'implantacoes' ? 'Detalhamento da Implantação' : 'Desenvolvimento'}</label>
            <textarea
              value={projeto.desenvolvimento}
              onChange={(e) => setProjeto({ ...projeto, desenvolvimento: e.target.value })}
              placeholder={
                modo === 'implantacoes'
                  ? 'Descreva como será a implantação, etapas, responsáveis, etc...'
                  : 'Descreva detalhadamente como será o desenvolvimento...'
              }
              rows={5}
            />
          </div>
          <div className="form-group">
            <label>Conclusão</label>
            <textarea
              value={projeto.conclusao}
              onChange={(e) => setProjeto({ ...projeto, conclusao: e.target.value })}
              placeholder="Conclusão do orçamento, benefícios esperados, próximos passos..."
              rows={4}
            />
          </div>
        </div>

        {exibirBackend && (
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
                {itensBackend.map(item =>
                  renderItemForm(
                    item,
                    'backend',
                    CATEGORIAS_BACKEND,
                    atualizarItemBackend,
                    removerItemBackend,
                    'Ex: Desenvolvimento de API REST completa'
                  )
                )}
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
        )}

        {exibirFrontend && (
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
                {itensFrontend.map(item =>
                  renderItemForm(
                    item,
                    'frontend',
                    CATEGORIAS_FRONTEND,
                    atualizarItemFrontend,
                    removerItemFrontend,
                    'Ex: Interface web responsiva'
                  )
                )}
              </div>
            )}
            {itensFrontend.length > 0 && (
              <div className="section-footer">
                <button type="button" onClick={adicionarItemFrontend} className="btn-add btn-add-footer">
                  + Adicionar Item Frontend
                </button>
              </div>
            )}
          </div>
        )}

        {exibirImplantacoes && (
          <div className="form-section">
            <div className="section-header">
              <h3>
                Implantações{' '}
                {itensImplantacoes.length === 0 && <span className="section-optional">(Opcional)</span>}
              </h3>
              {itensImplantacoes.length === 0 && (
                <button type="button" onClick={adicionarItemImplantacao} className="btn-add">
                  + Adicionar Item Implantação
                </button>
              )}
            </div>
            {itensImplantacoes.length === 0 ? (
              <div className="empty-section">
                <p>Nenhum item de Implantação adicionado. Clique no botão acima para adicionar.</p>
              </div>
            ) : (
              <div className="itens-container">
                {itensImplantacoes.map(item =>
                  renderItemForm(
                    item,
                    'implantacoes',
                    CATEGORIAS_IMPLANTACOES,
                    atualizarItemImplantacao,
                    removerItemImplantacao,
                    'Ex: Configuração do ambiente de produção'
                  )
                )}
              </div>
            )}
            {itensImplantacoes.length > 0 && (
              <div className="section-footer">
                <button type="button" onClick={adicionarItemImplantacao} className="btn-add btn-add-footer">
                  + Adicionar Item Implantação
                </button>
              </div>
            )}
          </div>
        )}

        <div className="resumo-horas">
          <strong>Total de Horas: {calcularTotalHoras()}h</strong>
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

        <div className="form-section">
          <h3>Seções no PDF</h3>
          <p className="secoes-pdf-hint">Escolha quais seções aparecerão no preview e no PDF exportado.</p>
          <div className="secoes-pdf-grid">
            <label className="secao-pdf-item">
              <input type="checkbox" checked={secoesPdf.projeto} onChange={() => toggleSecaoPdf('projeto')} />
              Projeto
            </label>
            {exibirBackend && (
              <label className="secao-pdf-item">
                <input type="checkbox" checked={secoesPdf.backend} onChange={() => toggleSecaoPdf('backend')} />
                Backend
              </label>
            )}
            {exibirFrontend && (
              <label className="secao-pdf-item">
                <input type="checkbox" checked={secoesPdf.frontend} onChange={() => toggleSecaoPdf('frontend')} />
                Frontend
              </label>
            )}
            {exibirImplantacoes && (
              <label className="secao-pdf-item">
                <input type="checkbox" checked={secoesPdf.implantacoes} onChange={() => toggleSecaoPdf('implantacoes')} />
                Implantações
              </label>
            )}
            <label className="secao-pdf-item">
              <input type="checkbox" checked={secoesPdf.custos} onChange={() => toggleSecaoPdf('custos')} />
              Custos Operacionais
            </label>
            <label className="secao-pdf-item">
              <input type="checkbox" checked={secoesPdf.modeloReceita} onChange={() => toggleSecaoPdf('modeloReceita')} />
              Modelo de Receita
            </label>
            <label className="secao-pdf-item">
              <input type="checkbox" checked={secoesPdf.observacoes} onChange={() => toggleSecaoPdf('observacoes')} />
              Observações
            </label>
            <label className="secao-pdf-item">
              <input type="checkbox" checked={secoesPdf.termos} onChange={() => toggleSecaoPdf('termos')} />
              Termos e Condições
            </label>
          </div>
        </div>

        <button type="submit" className="btn-submit">
          {modo === 'implantacoes' ? 'Gerar Orçamento de Implantação' : 'Gerar Orçamento Técnico'}
        </button>
      </form>
    </div>
  )
}

export default OrcamentoForm
