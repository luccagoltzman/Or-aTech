import { useRef } from 'react'
import { Orcamento } from '../types'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import logoPolaris from '../assets/P-Polaris.jpeg'
import './OrcamentoPreview.css'

interface OrcamentoPreviewProps {
  orcamento: Orcamento
  onVoltar: () => void
}

function OrcamentoPreview({ orcamento, onVoltar }: OrcamentoPreviewProps) {
  const printRef = useRef<HTMLDivElement>(null)

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

  const agruparItensPorBackendFrontend = () => {
    const backend: typeof orcamento.itens = []
    const frontend: typeof orcamento.itens = []
    
    // Categorias que são consideradas Backend
    const categoriasBackend = [
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
    
    orcamento.itens.forEach(item => {
      if (categoriasBackend.includes(item.categoria)) {
        backend.push(item)
      } else {
        frontend.push(item)
      }
    })
    
    return { backend, frontend }
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

      pdf.save(`Orcamento-Tecnico-${orcamento.numero}.pdf`)
    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
      alert('Erro ao gerar PDF. Tente novamente.')
    }
  }

  const imprimir = () => {
    window.print()
  }

  const { backend, frontend } = agruparItensPorBackendFrontend()
  const sectionNum = orcamento.projeto.titulo ? 2 : 1

  const gerarResumoEntregas = (itens: typeof orcamento.itens) => {
    const descricoes = itens
      .filter(item => item.descricao.trim() !== '')
      .map(item => item.descricao)
    
    if (descricoes.length === 0) return '-'
    
    // Se houver muitas descrições, limita e adiciona "..."
    if (descricoes.length > 5) {
      return descricoes.slice(0, 5).join(', ') + '...'
    }
    
    return descricoes.join(', ')
  }

  return (
    <div className="preview-container">
      <div className="preview-actions">
        <button onClick={onVoltar} className="btn-voltar">
          ← Voltar e Editar
        </button>
        <div className="action-buttons">
          <button onClick={imprimir} className="btn-action">
            🖨️ Imprimir
          </button>
          <button onClick={exportarPDF} className="btn-action btn-primary">
            📄 Exportar PDF
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
            <h2 className="documento-titulo">ORÇAMENTO TÉCNICO</h2>
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

        {orcamento.projeto.titulo && (
          <div className="projeto-section">
            <h2 className="section-title">1. Projeto</h2>
            <h3 className="projeto-titulo">{orcamento.projeto.titulo}</h3>
            {orcamento.projeto.introducao && (
              <div className="projeto-content">
                <h4>1.1 Introdução</h4>
                <p className="text-content">{orcamento.projeto.introducao}</p>
              </div>
            )}
            {orcamento.projeto.desenvolvimento && (
              <div className="projeto-content">
                <h4>1.2 Desenvolvimento</h4>
                <p className="text-content">{orcamento.projeto.desenvolvimento}</p>
              </div>
            )}
            {orcamento.projeto.conclusao && (
              <div className="projeto-content">
                <h4>1.3 Conclusão</h4>
                <p className="text-content">{orcamento.projeto.conclusao}</p>
              </div>
            )}
          </div>
        )}

        <div className="desenvolvimento-section">
          <h2 className="section-title">{sectionNum}. Desenvolvimento Técnico – Detalhamento Completo</h2>
          
          {backend.length > 0 && (
            <div className="categoria-group">
              <h3 className="categoria-title">{sectionNum}.1 Backend</h3>
              <div className="itens-categoria">
                {backend.map((item, itemIndex) => (
                  <div key={item.id} className="item-technical">
                    <div className="item-header-technical">
                      <h4>{sectionNum}.1.{itemIndex + 1} {item.descricao}</h4>
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
          )}

          {frontend.length > 0 && (
            <div className="categoria-group">
              <h3 className="categoria-title">{sectionNum}.2 Frontend</h3>
              <div className="itens-categoria">
                {frontend.map((item, itemIndex) => (
                  <div key={item.id} className="item-technical">
                    <div className="item-header-technical">
                      <h4>{sectionNum}.2.{itemIndex + 1} {item.descricao}</h4>
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
          )}
        </div>

        {orcamento.custosOperacionais.length > 0 && (
          <div className="custos-section">
            <h2 className="section-title">{orcamento.projeto.titulo ? '3' : '2'}. Custos Operacionais Mensais</h2>
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

        {orcamento.modeloReceita && (
          <div className="receita-section">
            <h2 className="section-title">
              {orcamento.projeto.titulo 
                ? (orcamento.custosOperacionais.length > 0 ? '4' : '3')
                : (orcamento.custosOperacionais.length > 0 ? '3' : '2')
              }. Modelo de Receita
            </h2>
            <p className="text-content">{orcamento.modeloReceita}</p>
          </div>
        )}

        <div className="resumo-section">
          <h2 className="section-title">
            {(() => {
              let num = orcamento.projeto.titulo ? 3 : 2
              if (orcamento.custosOperacionais.length > 0) num++
              if (orcamento.modeloReceita) num++
              return num
            })()}. Tabela Resumo dos Esforços
          </h2>
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
                {backend.length > 0 && (() => {
                  const totalHoras = backend.reduce((sum, item) => sum + item.horas, 0)
                  const entregas = gerarResumoEntregas(backend)
                  return (
                    <tr key="backend">
                      <td><strong>Backend</strong></td>
                      <td className="text-center">{totalHoras}h</td>
                      <td>{entregas}</td>
                    </tr>
                  )
                })()}
                {frontend.length > 0 && (() => {
                  const totalHoras = frontend.reduce((sum, item) => sum + item.horas, 0)
                  const entregas = gerarResumoEntregas(frontend)
                  return (
                    <tr key="frontend">
                      <td><strong>Frontend</strong></td>
                      <td className="text-center">{totalHoras}h</td>
                      <td>{entregas}</td>
                    </tr>
                  )
                })()}
                <tr className="resumo-total-row">
                  <td><strong>Total</strong></td>
                  <td className="text-center"><strong>{orcamento.totalHoras}h</strong></td>
                  <td><strong>Sistema completo</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

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

        {orcamento.observacoes && (
          <div className="orcamento-observacoes">
            <h3>
              {(() => {
                let num = orcamento.projeto.titulo ? 4 : 3
                if (orcamento.custosOperacionais.length > 0) num++
                if (orcamento.modeloReceita) num++
                num++
                return num
              })()}. Observações Adicionais
            </h3>
            <p className="text-content">{orcamento.observacoes}</p>
          </div>
        )}

        <div className="orcamento-termos">
          <h3>
            {(() => {
              let num = orcamento.projeto.titulo ? 4 : 3
              if (orcamento.custosOperacionais.length > 0) num++
              if (orcamento.modeloReceita) num++
              if (orcamento.observacoes) num++
              num++
              return num
            })()}. Termos e Condições
          </h3>
          <p className="text-content">{orcamento.termosCondicoes}</p>
        </div>

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
