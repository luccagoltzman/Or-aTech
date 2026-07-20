export interface OrcamentoItem {
  id: string;
  categoria: string;
  descricao: string;
  descricaoDetalhada: string;
  quantidade: number;
  horas: number;
  valorHora: number;
  valorUnitario: number;
  valorTotal: number;
}

export type ModoOrcamento = 'desenvolvimento' | 'implantacoes' | 'completo';

export interface SecoesPdf {
  projeto: boolean;
  backend: boolean;
  frontend: boolean;
  implantacoes: boolean;
  custos: boolean;
  modeloReceita: boolean;
  observacoes: boolean;
  termos: boolean;
}

export interface Orcamento {
  numero: string;
  data: string;
  validade: string;
  tipo: 'preliminar' | 'definitivo';
  modo: ModoOrcamento;
  prazoEntrega?: string;
  cliente: {
    nome: string;
    email: string;
    telefone: string;
    endereco: string;
    empresa?: string;
  };
  projeto: {
    titulo: string;
    introducao: string;
    desenvolvimento: string;
    conclusao: string;
  };
  itens: OrcamentoItem[];
  custosOperacionais: {
    descricao: string;
    valor: number;
    periodicidade: string;
  }[];
  modeloReceita?: string;
  observacoes: string;
  termosCondicoes: string;
  subtotal: number;
  desconto: number;
  total: number;
  totalHoras: number;
  secoesPdf?: SecoesPdf;
}
