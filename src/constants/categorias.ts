import { ModoOrcamento, OrcamentoItem, SecoesPdf } from '../types'

export const CATEGORIAS_BACKEND = [
  'API REST',
  'Banco de Dados',
  'Integração de Pagamento',
  'Autenticação/Autorização',
  'Processamento de Dados',
  'Infraestrutura/DevOps',
  'Testes Backend',
  'Documentação API',
  'Outros Backend'
] as const

export const CATEGORIAS_FRONTEND = [
  'Interface Web',
  'App Mobile (Android/iOS)',
  'Design/UI/UX',
  'Integração Frontend',
  'Testes Frontend',
  'Responsividade',
  'Performance',
  'Outros Frontend'
] as const

export const CATEGORIAS_IMPLANTACOES = [
  'Configuração',
  'Deploy',
  'Migração de dados',
  'Treinamento',
  'Homologação',
  'Go-live',
  'Suporte pós-implantação',
  'Outros Implantação'
] as const

export const SECOES_PDF_PADRAO: SecoesPdf = {
  projeto: true,
  backend: true,
  frontend: true,
  implantacoes: true,
  custos: true,
  modeloReceita: true,
  observacoes: true,
  termos: true
}

export function mostrarBackend(modo: ModoOrcamento) {
  return modo === 'desenvolvimento' || modo === 'completo'
}

export function mostrarFrontend(modo: ModoOrcamento) {
  return modo === 'desenvolvimento' || modo === 'completo'
}

export function mostrarImplantacoes(modo: ModoOrcamento) {
  return modo === 'implantacoes' || modo === 'completo'
}

export function separarItensPorCategoria(itens: OrcamentoItem[]) {
  const backend = itens.filter(item => CATEGORIAS_BACKEND.includes(item.categoria as typeof CATEGORIAS_BACKEND[number]))
  const implantacoes = itens.filter(item => CATEGORIAS_IMPLANTACOES.includes(item.categoria as typeof CATEGORIAS_IMPLANTACOES[number]))
  const frontend = itens.filter(
    item =>
      !CATEGORIAS_BACKEND.includes(item.categoria as typeof CATEGORIAS_BACKEND[number]) &&
      !CATEGORIAS_IMPLANTACOES.includes(item.categoria as typeof CATEGORIAS_IMPLANTACOES[number])
  )
  return { backend, frontend, implantacoes }
}

export function inferirModo(itens: OrcamentoItem[], modo?: ModoOrcamento): ModoOrcamento {
  if (modo) return modo
  const { backend, frontend, implantacoes } = separarItensPorCategoria(itens)
  const temDev = backend.length > 0 || frontend.length > 0
  const temImp = implantacoes.length > 0
  if (temImp && !temDev) return 'implantacoes'
  if (temImp && temDev) return 'completo'
  return 'desenvolvimento'
}
