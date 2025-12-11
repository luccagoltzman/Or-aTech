# OrçaTech - Gerador de Orçamentos Profissionais

Aplicação web moderna para gerar orçamentos profissionais e bonitos para a **Polaris Software**.

## 🚀 Funcionalidades

- ✅ Interface moderna e intuitiva
- ✅ Formulário completo para criação de orçamentos
- ✅ Gerenciamento de múltiplos itens
- ✅ Cálculo automático de subtotal, desconto e total
- ✅ Visualização profissional do orçamento
- ✅ Exportação para PDF
- ✅ Impressão direta do navegador
- ✅ Design responsivo (mobile-friendly)
- ✅ Validação de formulários

## 📋 Pré-requisitos

- Node.js 16+ instalado
- npm ou yarn

## 🛠️ Instalação

1. Clone o repositório ou navegue até a pasta do projeto

2. Instale as dependências:
```bash
npm install
```

## ▶️ Como Executar

Para iniciar o servidor de desenvolvimento:

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`

## 📦 Build para Produção

Para gerar uma versão otimizada para produção:

```bash
npm run build
```

Os arquivos serão gerados na pasta `dist/`

Para visualizar a build de produção:

```bash
npm run preview
```

## 📝 Como Usar

1. **Preencha as informações do orçamento:**
   - Número do orçamento (opcional - será gerado automaticamente se não preenchido)
   - Data
   - Validade em dias

2. **Adicione os dados do cliente:**
   - Nome completo
   - E-mail
   - Telefone
   - Endereço (opcional)

3. **Adicione os itens do orçamento:**
   - Clique em "+ Adicionar Item" para adicionar mais itens
   - Preencha descrição, quantidade e valor unitário
   - O valor total é calculado automaticamente

4. **Configure valores:**
   - O subtotal é calculado automaticamente
   - Adicione desconto se necessário
   - O total final é calculado automaticamente

5. **Adicione observações (opcional):**
   - Condições de pagamento
   - Informações adicionais
   - Etc.

6. **Gere o orçamento:**
   - Clique em "Gerar Orçamento"
   - Visualize o orçamento formatado
   - Exporte para PDF ou imprima

## 🎨 Tecnologias Utilizadas

- **React 18** - Biblioteca JavaScript para interfaces
- **TypeScript** - Tipagem estática
- **Vite** - Build tool moderna e rápida
- **jsPDF** - Geração de PDFs
- **html2canvas** - Conversão HTML para imagem
- **CSS3** - Estilização moderna com variáveis CSS

## 📄 Estrutura do Projeto

```
Or-aTech/
├── src/
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── OrcamentoForm.tsx
│   │   └── OrcamentoPreview.tsx
│   ├── App.tsx
│   ├── main.tsx
│   ├── types.ts
│   └── *.css
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 🔧 Personalização

Para personalizar a empresa, edite o componente `Header.tsx` e `OrcamentoPreview.tsx` onde aparece "Polaris Software".

## 📱 Responsividade

A aplicação é totalmente responsiva e funciona perfeitamente em:
- 💻 Desktop
- 📱 Tablets
- 📱 Smartphones

## 📄 Licença

Este projeto é de uso interno da Polaris Software.

---

Desenvolvido com ❤️ para Polaris Software
