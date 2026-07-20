import { useRef } from 'react'
import { Orcamento, SecoesPdf } from '../types'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import logoPolaris from '../assets/P-Polaris.jpeg'
import { SECOES_PDF_PADRAO, separarItensPorCategoria, inferirModo } from '../constants/categorias'
import './OrcamentoPreview.css'

interface OrcamentoPreviewProps {
  orcamento: Orcamento
  onVoltar: () => void
  onEditar?: () => void
}

function OrcamentoPreview({ orcamento, onVoltar, onEditar }: OrcamentoPreviewProps) {
  const printRef = useRef<HTMLDivElement>(null)

  const modo = inferirModo(orcamento.itens, orcamento.modo)
  const secoes: SecoesPdf = { ...SECOES_PDF_PADRAO, ...orcamento.secoesPdf }

  const formatarData = (data: string) => {
    if (!data) return ''
    const date = new Date(data)
    return date.toLocaleDateString('pt-BR')
  }

  const calcularDataValidade = () => {
    if (!orcamento.validade) return ''
    const dias = parseInt(orcamento.validade)
    if (isNaN(dias)) return ''
    const data = new Date(orcamento.data)
    data.setDate(data.getDate() + dias)
    return formatarData(data.toISOString())
  }

  const gerarNomeArquivo = () => {
    let nomeBase = modo === 'implantacoes' ? 'Orcamento-Implantacao' : 'Orcamento-Tecnico'

    if (orcamento.projeto.titulo && orcamento.projeto.titulo.trim() !== '') {
      nomeBase = orcamento.projeto.titulo
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .substring(0, 50)
    } else {
      nomeBase = `Orcamento-${orcamento.numero}`
    }

    return `${nomeBase}.pdf`
  }

  const exportarPDF = async () => {
    if (!printRef.current) return

    try {
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        logging: false
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const imgWidth = 210
      const pageHeight = 297
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight
      let position = 0

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      pdf.save(gerarNomeArquivo())
      exportarJSONAutomatico()
    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
      alert('Erro ao gerar PDF. Tente novamente.')
    }
  }

  const exportarJSONAutomatico = () => {
    try {
      const jsonData = JSON.stringify(orcamento, null, 2)
      localStorage.setItem(`orcamento-${orcamento.numero}`, jsonData)
      const orcamentosSalvos = JSON.parse(localStorage.getItem('orcamentos-salvos') || '[]')
      if (!orcamentosSalvos.find((o: { numero: string }) => o.numero === orcamento.numero)) {
        orcamentosSalvos.push({
          numero: orcamento.numero,
          titulo: orcamento.projeto.titulo || 'Sem título',
          data: orcamento.data,
          total: orcamento.total
        })
        localStorage.setItem('orcamentos-salvos', JSON.stringify(orcamentosSalvos))
      }
    } catch (error) {
      console.error('Erro ao salvar JSON automaticamente:', error)
    }
  }

  const imprimir = () => {
    window.print()
  }

  const exportarJSON = () => {
    try {
      const jsonData = JSON.stringify(orcamento, null, 2)
      const blob = new Blob([jsonData], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = gerarNomeArquivo().replace('.pdf', '.json')
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Erro ao exportar JSON:', error)
      alert('Erro ao exportar JSON. Tente novamente.')
    }
  }

  const { backend, frontend, implantacoes } = separarItensPorCategoria(orcamento.itens)

  const showProjeto = !!orcamento.projeto.titulo && secoes.projeto
  const showBackend = backend.length > 0 && secoes.backend
  const showFrontend = frontend.length > 0 && secoes.frontend
  const showImplantacoes = implantacoes.length > 0 && secoes.implantacoes
  const showCustos = orcamento.custosOperacionais.length > 0 && secoes.custos
  const showModeloReceita = !!orcamento.modeloReceita && secoes.modeloReceita
  const showObservacoes = !!orcamento.observacoes && secoes.observacoes
  const showTermos = secoes.termos
  const showDetalhamento = showBackend || showFrontend || showImplantacoes

  const tituloDocumento =
    modo === 'implantacoes'
      ? `ORÇAMENTO DE IMPLANTAÇÃO ${orcamento.tipo === 'preliminar' ? 'PRELIMINAR' : 'DEFINITIVO'}`
      : modo === 'completo'
        ? `ORÇAMENTO COMPLETO ${orcamento.tipo === 'preliminar' ? 'PRELIMINAR' : 'DEFINITIVO'}`
        : `ORÇAMENTO TÉCNICO ${orcamento.tipo === 'preliminar' ? 'PRELIMINAR' : 'DEFINITIVO'}`

  const tituloDetalhamento =
    modo === 'implantacoes'
      ? 'Detalhamento da Implantação'
      : modo === 'completo'
        ? 'Detalhamento Técnico e de Implantação'
        : 'Desenvolvimento Técnico – Detalhamento Completo'

  let sectionCounter = 0
  const nextSection = () => ++sectionCounter

  const gerarResumoEntregas = (itens: typeof orcamento.itens) => {
    const descricoes = itens
      .filter(item => item.descricao.trim() !== '')
      .map(item => item.descricao)

    if (descricoes.length === 0) return '-'
    if (descricoes.length > 5) {
      return descricoes.slice(0, 5).join(', ') + '...'
    }
    return descricoes.join(', ')
  }

  const renderItensGrupo = (
    itens: typeof orcamento.itens,
    titulo: string,
    prefixo: string
  ) => (
    <div className="categoria-group">
      <h3 className="categoria-title">{prefixo} {titulo}</h3>
      <div className="itens-categoria">
        {itens.map((item, itemIndex) => (
          <div key={item.id} className="item-technical">
            <div className="item-header-technical">
              <h4>{prefixo}.{itemIndex + 1} {item.descricao}</h4>
              <div className="item-metrics-badge">
                <span className="metric">{item.horas}h</span>
                <span className="metric">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(item.valorHora)}/h
                </span>
                <span className="metric total">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(item.valorTotal)}
                </span>
              </div>
            </div>
            {item.descricaoDetalhada && (
              <div className="item-detalhes">
                <p>{item.descricaoDetalhada}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )

  const projetoNum = showProjeto ? nextSection() : 0
  const detalhamentoNum = showDetalhamento ? nextSection() : 0
  const custosNum = showCustos ? nextSection() : 0
  const receitaNum = showModeloReceita ? nextSection() : 0
  const resumoNum = showDetalhamento ? nextSection() : 0
  const observacoesNum = showObservacoes ? nextSection() : 0
  const termosNum = showTermos ? nextSection() : 0

  let subIdx = 0
  const nextSub = () => ++subIdx

  return (
    <div className="preview-container">
      <div className="preview-actions">
        <button onClick={onEditar || onVoltar} className="btn-voltar">
          ← Voltar e Editar
        </button>
        <div className="action-buttons">
          <button onClick={imprimir} className="btn-action">
            Imprimir
          </button>
          <button onClick={exportarJSON} className="btn-action">
            Exportar JSON
          </button>
          <button onClick={exportarPDF} className="btn-action btn-primary">
            Exportar PDF
          </button>
        </div>
      </div>

      <div ref={printRef} className="orcamento-preview technical">
        <div className="orcamento-header">
          <div className="header-left">
            <div className="logo-container">
              <img src={logoPolaris} alt="Polaris Software" className="empresa-logo" />
            </div>
            <h1 className="empresa-nome">Polaris Software</h1>
            <p className="empresa-tagline">Soluções em Software de Alto Padrão</p>
          </div>
          <div className="header-right">
            <h2 className="documento-titulo">{tituloDocumento}</h2>
            <div className="documento-numero">Nº {orcamento.numero}</div>
            <div className="documento-data">Data: {formatarData(orcamento.data)}</div>
          </div>
        </div>

        <div className="orcamento-info">
          <div className="info-section">
            <h3>Dados do Cliente</h3>
            <p><strong>Nome/Empresa:</strong> {orcamento.cliente.nome}</p>
            {orcamento.cliente.empresa && (
              <p><strong>Empresa:</strong> {orcamento.cliente.empresa}</p>
            )}
            <p><strong>E-mail:</strong> {orcamento.cliente.email}</p>
            <p><strong>Telefone:</strong> {orcamento.cliente.telefone}</p>
            {orcamento.cliente.endereco && (
              <p><strong>Endereço:</strong> {orcamento.cliente.endereco}</p>
            )}
          </div>
          <div className="info-section">
            <h3>Informações do Orçamento</h3>
            <p><strong>Validade:</strong> {orcamento.validade} dias</p>
            {calcularDataValidade() && (
              <p><strong>Válido até:</strong> {calcularDataValidade()}</p>
            )}
            {orcamento.prazoEntrega && (
              <p><strong>Prazo de Entrega:</strong> {orcamento.prazoEntrega}</p>
            )}
            <p><strong>Total de Horas:</strong> {orcamento.totalHoras}h</p>
          </div>
        </div>

        {showProjeto && (
          <div className="projeto-section">
            <h2 className="section-title">{projetoNum}. Projeto</h2>
            <h3 className="projeto-titulo">{orcamento.projeto.titulo}</h3>
            {orcamento.projeto.introducao && (
              <div className="projeto-content">
                <h4>{projetoNum}.1 Introdução</h4>
                <p className="text-content">{orcamento.projeto.introducao}</p>
              </div>
            )}
            {orcamento.projeto.desenvolvimento && (
              <div className="projeto-content">
                <h4>{projetoNum}.2 {modo === 'implantacoes' ? 'Detalhamento' : 'Desenvolvimento'}</h4>
                <p className="text-content">{orcamento.projeto.desenvolvimento}</p>
              </div>
            )}
            {orcamento.projeto.conclusao && (
              <div className="projeto-content">
                <h4>{projetoNum}.3 Conclusão</h4>
                <p className="text-content">{orcamento.projeto.conclusao}</p>
              </div>
            )}
          </div>
        )}

        {showDetalhamento && (
          <div className="desenvolvimento-section">
            <h2 className="section-title">{detalhamentoNum}. {tituloDetalhamento}</h2>

            {showBackend && renderItensGrupo(backend, 'Backend', `${detalhamentoNum}.${nextSub()}`)}
            {showFrontend && renderItensGrupo(frontend, 'Frontend', `${detalhamentoNum}.${nextSub()}`)}
            {showImplantacoes && renderItensGrupo(implantacoes, 'Implantações', `${detalhamentoNum}.${nextSub()}`)}
          </div>
        )}

        {showCustos && (
          <div className="custos-section">
            <h2 className="section-title">{custosNum}. Custos Operacionais Mensais</h2>
            <div className="custos-list">
              {orcamento.custosOperacionais.map((custo, index) => (
                <div key={index} className="custo-item">
                  <div className="custo-info">
                    <strong>{custo.descricao}</strong>
                    <span className="custo-periodicidade">({custo.periodicidade})</span>
                  </div>
                  <div className="custo-valor">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(custo.valor)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {showModeloReceita && (
          <div className="receita-section">
            <h2 className="section-title">{receitaNum}. Modelo de Receita</h2>
            <p className="text-content">{orcamento.modeloReceita}</p>
          </div>
        )}

        {showDetalhamento && (
          <div className="resumo-section">
            <h2 className="section-title">{resumoNum}. Tabela Resumo dos Esforços</h2>
            <div className="resumo-table">
              <table>
                <thead>
                  <tr>
                    <th>Parte</th>
                    <th className="text-center">Horas</th>
                    <th>Entregas</th>
                  </tr>
                </thead>
                <tbody>
                  {showBackend && (
                    <tr key="backend">
                      <td><strong>Backend</strong></td>
                      <td className="text-center">{backend.reduce((sum, item) => sum + item.horas, 0)}h</td>
                      <td>{gerarResumoEntregas(backend)}</td>
                    </tr>
                  )}
                  {showFrontend && (
                    <tr key="frontend">
                      <td><strong>Frontend</strong></td>
                      <td className="text-center">{frontend.reduce((sum, item) => sum + item.horas, 0)}h</td>
                      <td>{gerarResumoEntregas(frontend)}</td>
                    </tr>
                  )}
                  {showImplantacoes && (
                    <tr key="implantacoes">
                      <td><strong>Implantações</strong></td>
                      <td className="text-center">{implantacoes.reduce((sum, item) => sum + item.horas, 0)}h</td>
                      <td>{gerarResumoEntregas(implantacoes)}</td>
                    </tr>
                  )}
                  <tr className="resumo-total-row">
                    <td><strong>Total</strong></td>
                    <td className="text-center"><strong>{orcamento.totalHoras}h</strong></td>
                    <td>
                      <strong>
                        {modo === 'implantacoes' ? 'Implantação completa' : 'Sistema completo'}
                      </strong>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="orcamento-totais">
          <div className="total-row">
            <span>Subtotal:</span>
            <span>
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(orcamento.subtotal)}
            </span>
          </div>
          {orcamento.desconto > 0 && (
            <div className="total-row">
              <span>Desconto:</span>
              <span>
                - {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(orcamento.desconto)}
              </span>
            </div>
          )}
          <div className="total-row final">
            <span>TOTAL:</span>
            <span>
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(orcamento.total)}
            </span>
          </div>
          <div className="total-horas-final">
            <strong>Total de Horas: {orcamento.totalHoras}h</strong>
          </div>
        </div>

        {showObservacoes && (
          <div className="orcamento-observacoes">
            <h3>{observacoesNum}. Observações Adicionais</h3>
            <p className="text-content">{orcamento.observacoes}</p>
          </div>
        )}

        {showTermos && (
          <div className="orcamento-termos">
            <h3>{termosNum}. Termos e Condições</h3>
            <p className="text-content">{orcamento.termosCondicoes}</p>
          </div>
        )}

        <div className="orcamento-footer">
          <p>Obrigado pela confiança em nossos serviços!</p>
          <p className="footer-empresa">Polaris Software</p>
          <p className="footer-contact">Soluções em Software de Alto Padrão</p>
        </div>
      </div>
    </div>
  )
}

export default OrcamentoPreview
