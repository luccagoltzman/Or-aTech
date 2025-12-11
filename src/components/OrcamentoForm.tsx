import { useState } from 'react'
import { Orcamento, OrcamentoItem } from '../types'
import './OrcamentoForm.css'

interface OrcamentoFormProps {
  onGerarOrcamento: (orcamento: Orcamento) => void
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

function OrcamentoForm({ onGerarOrcamento }: OrcamentoFormProps) {
  const [numero, setNumero] = useState('')
  const [data, setData] = useState(new Date().toISOString().split('T')[0])
  const [validade, setValidade] = useState('30')
  const [prazoEntrega, setPrazoEntrega] = useState('')
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
  const [itensBackend, setItensBackend] = useState<OrcamentoItem[]>([
    { 
      id: 'backend-1', 
      categoria: 'API REST',
      descricao: '', 
      descricaoDetalhada: '',
      quantidade: 1, 
      horas: 0,
      valorHora: 0,
      valorUnitario: 0, 
      valorTotal: 0 
    }
  ])
  const [itensFrontend, setItensFrontend] = useState<OrcamentoItem[]>([
    { 
      id: 'frontend-1', 
      categoria: 'Interface Web',
      descricao: '', 
      descricaoDetalhada: '',
      quantidade: 1, 
      horas: 0,
      valorHora: 0,
      valorUnitario: 0, 
      valorTotal: 0 
    }
  ])
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

  const calcularTotal = () => {
    const subtotal = calcularSubtotal()
    return subtotal - desconto
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const subtotal = calcularSubtotal()
    const total = calcularTotal()
    const totalHoras = calcularTotalHoras()

    const novoOrcamento: Orcamento = {
      numero: numero || `ORC-${Date.now()}`,
      data,
      validade,
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

  return (
    <div className="form-container">
      <h2 className="form-title">Criar Orçamento Técnico Detalhado</h2>
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
              <label>Prazo de Entrega</label>
              <input
                type="text"
                value={prazoEntrega}
                onChange={(e) => setPrazoEntrega(e.target.value)}
                placeholder="Ex: 4 semanas, 60 dias"
              />
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
            <h3>Backend</h3>
            <button type="button" onClick={adicionarItemBackend} className="btn-add">
              + Adicionar Item Backend
            </button>
          </div>
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
                {itensBackend.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removerItemBackend(item.id)}
                    className="btn-remove"
                    title="Remover item"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="form-section">
          <div className="section-header">
            <h3>Frontend</h3>
            <button type="button" onClick={adicionarItemFrontend} className="btn-add">
              + Adicionar Item Frontend
            </button>
          </div>
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
                {itensFrontend.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removerItemFrontend(item.id)}
                    className="btn-remove"
                    title="Remover item"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
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
