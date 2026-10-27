# 💊 FarmaApp (Pharma-Helper)

> **Assistente Farmacêutico de Bolso** — Progressive Web App (PWA) responsivo, gratuito e **100% offline**, projetado para uso diário no balcão e retaguarda de farmácias e drogarias no celular (iOS e Android), sem precisar pagar taxas da Apple Developer ou Google Play.

---

## 📱 Por que um PWA?
- **Zero custo de loja**: Não precisa pagar a anuidade da Apple (\$99/ano) nem conta Google Play.
- **Instalável como App Nativo**: Funciona em tela cheia no iPhone e Android sem barra de navegador.
- **Funciona Offline**: Graças ao Service Worker e banco de dados local IndexedDB (Dexie.js), você pode consultar medicamentos, receitas e interações mesmo sem sinal de Wi-Fi ou 4G dentro da farmácia.

---

## 🚀 Funcionalidades Principais

### 1. 📋 Checagem e Conferência de Receitas
- Validação rápida dos requisitos legais obrigatórios de dispensação segundo a **Portaria SVS/MS nº 344/1998** e **RDC nº 20/2011** (Antimicrobianos).
- Tipos cobertos:
  - **Receita Simples (Branca 1 via)** — Medicamentos isentos e tarja vermelha comum.
  - **Receita de Antimicrobianos (RDC 20/2011)** — Regra estrita de 10 dias corridos e retenção da 2ª via.
  - **Receita de Controle Especial (Branca 2 vias)** — Lista C1 e C5 (anabolizantes).
  - **Notificação de Receita Azul (B1 e B2)** — Psicotrópicos ansiolíticos e anorexígenos.
  - **Notificação de Receita Amarela (A1, A2 e A3)** — Entorpecentes e estimulantes.
  - **Receita Especial de Retinóides (C2)** — Isotretinoína e termos obrigatórios.
- Checklist interativo dos campos: data, CRM/CRF, endereço, quantidade por extenso, vias retidas e validade.

### 2. 💊 Tabela de Equivalência Genérico ↔ Referência
- Pesquisa bidirecional por **Nome Comercial (Referência)**, **Nome do Genérico** ou **Princípio Ativo (DCB)**.
- Filtro por forma farmacêutica (comprimido, cápsula, gotas, suspensão oral, etc.).
- Indica apresentações disponíveis, concentrações e similares populares.

### 3. ⚠️ Checador de Interações Medicamentosas
- Seleção de múltiplos fármacos para identificação instantânea de interações cruzadas.
- Classificação por severidade:
  - 🔴 **Grave / Alto Risco** (ex: Varfarina + AINEs, Fluoxetina + Tramadol, Estatinas + Azóis, Metformina + Álcool).
  - 🟡 **Moderada** (ex: IECA + Espironolactona, Omeprazol + Clopidogrel, Ciprofloxacino + Cálcio).
  - 🔵 **Leve** / Monitoramento.
- Explicação do mecanismo farmacológico e conduta prática imediata para o farmacêutico orientar o paciente ou médico.

### 4. 🧮 Calculadora Farmacêutica
- **Dose Pediátrica por Peso**: Predefinições automáticas dos analgésicos e antibióticos mais dispensados:
  - Dipirona Gotas (500mg/mL) — cálculo exato de gotas por kg.
  - Paracetamol Gotas (200mg/mL) e Bebê (100mg/mL).
  - Ibuprofeno Gotas (50mg/mL e 100mg/mL).
  - Amoxicilina Suspensão (250mg/5mL e 500mg/5mL) — dose diária dividida a cada 8h.
  - Azitromicina Suspensão (200mg/5mL).
- **Conversor Gotas ↔ mL**: conversão ágil (padrão 1 mL = 20 gotas).
- **Cálculo de Diluição**: regra $C_1 \times V_1 = C_2 \times V_2$ para diluentes e preparos.

### 5. 📦 Conferência de Pedidos & Baixas
- Formulário rápido de recebimento de caixas e distribuidoras (Santa Cruz, Profarma, Panpharma, etc.).
- Registro de lote, validade, nota fiscal e conferência física vs faturada.
- Alerta para produtos **termolábeis** (geladeira 2°C a 8°C) e **controlados da Portaria 344**.
- Histórico completo de conferências salvo localmente no celular.

### 6. 🩺 Guia de Indicações & Balcão (MIPs)
- Guia seguro de prescrição farmacêutica para Medicamentos Isentos de Prescrição (MIPs) por queixa:
  - Cefaleia e Dor
  - Gripe, Resfriado e Congestão
  - Tosse Seca vs Tosse Produtiva
  - Azia, Queimação e Má Digestão
  - Cólica Abdominal e Menstrual
  - Rinite e Alergias
  - Diarreia e Reidratação Oral
- **Sinais de Alerta Vermelhos (Red Flags)**: orienta quando NÃO medicar no balcão e encaminhar imediatamente para atendimento médico hospitalar.

---

## 📲 Como Instalar no Celular

### No iPhone (iOS):
1. Abra o link do app no navegador **Safari**.
2. Toque no botão de **Compartilhar** (ícone de quadrado com seta para cima no rodapé).
3. Role para baixo e selecione **"Adicionar à Tela de Início"** (Add to Home Screen).
4. O ícone do **FarmaApp** aparecerá na tela do seu iPhone como um app nativo, funcionando em tela cheia e offline!

### No Android:
1. Abra o link do app no **Google Chrome**.
2. Toque nos 3 pontinhos no canto superior direito.
3. Selecione **"Instalar aplicativo"** ou **"Adicionar à tela inicial"**.
4. Pronto! O app fica instalado na gaveta de aplicativos.

---

## 🌐 Como Publicar Grátis no GitHub Pages

Para ter o seu FarmaApp disponível online no seu celular:

1. Suba este repositório para o seu GitHub: `https://github.com/GilsonCataoDev/Pharma-helper.git`
2. No GitHub, abra a aba **Settings** do repositório.
3. No menu lateral esquerdo, clique em **Pages**.
4. Em **Build and deployment > Source**, selecione **Deploy from a branch**.
5. Em **Branch**, selecione `main` e a pasta `/(root)`, depois clique em **Save**.
6. Aguarde cerca de 1 a 2 minutos. O GitHub gerará o link oficial:
   ```
   https://gilsoncataodev.github.io/Pharma-helper/
   ```
7. Abra esse link no celular e adicione à tela inicial!

---

## 💻 Como Rodar Localmente no Computador

Você pode testar e rodar o projeto localmente com qualquer servidor HTTP simples:

### Usando Python:
```bash
python -m http.server 8000
```
Depois abra no navegador: `http://localhost:8000`

### Usando Node.js / npx:
```bash
npx serve .
```

---

## 🛠️ Tecnologias Utilizadas
- **HTML5 & Vanilla JavaScript Moderno (ES Modules)** — Leve, rápido e sem dependências pesadas de build.
- **Tailwind CSS (via CDN)** — Interface moderna, limpa e pensada para celular (mobile-first).
- **Dexie.js (IndexedDB)** — Armazenamento offline local no navegador do usuário.
- **Service Worker** — Cache de aplicação e funcionamento offline.
- **Lucide Icons** — Ícones clínicos elegantes e intuitivos.

---

## ⚖️ Aviso Legal
*Este aplicativo é uma ferramenta de suporte, conferência e consulta rápida para farmacêuticos, estudantes e profissionais de farmácia. O uso desta ferramenta não substitui a avaliação clínica criteriosa, a responsabilidade técnica e o cumprimento da legislação sanitária vigente estabelecida pelo Conselho Federal de Farmácia (CFF) e ANVISA.*
