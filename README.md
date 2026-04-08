# 📋 Task Manager Inteligente

Uma aplicação web moderna para gerenciamento de tarefas com inteligência artificial integrada, suporte offline e sincronização em tempo real.

<img width="512" height="328" alt="minhas-task-manager" src="https://github.com/user-attachments/assets/559e5c12-672e-44eb-886f-c63e016692f0" />

## ✨ Características Principais

### 🎯 CRUD Completo

- ✅ Criar, editar, visualizar e deletar tarefas
- 📝 Campos: Título, Descrição, Prioridade, Prazo, Responsável, Categoria
- 🏷️ Categorização automática de tarefas

### 🤖 Sistema de IA

- ✨ **Sugestão Automática de Prioridade** baseada em análise de texto
- 📊 Análise de sentimento simples
- ⏰ Estimativa de tempo baseada em descrição
- 🎯 Palavras-chave contextuais para priorização inteligente

### 📊 Dashboard Inteligente

<img width="479" height="317" alt="dashboard-task" src="https://github.com/user-attachments/assets/b9ebcefe-b4a4-41f9-a156-c5bfdd85ab76" />

- 📈 Gráficos interativos (Chart.js)
- 📌 KPIs em tempo real:
  - Total de tarefas
  - Tarefas concluídas vs pendentes
  - Tarefas atrasadas (críticas)
  - Taxa de conclusão
- 🎨 Visuais por prioridade (🔴 Alta | 🟡 Média | 🟢 Baixa)

### 🔍 Filtros e Busca

- 🔎 Busca dinâmica por título, descrição ou responsável
- 📌 Filtro por status: Concluído, Em Andamento, Atrasado
- 🎯 Filtro por prioridade
- ⚡ Atualização em tempo real

### 📱 Suporte Offline

- 💾 Sincronização automática com localStorage
- 🌐 Modo offline/online detectado automaticamente
- 🔄 Sincronização com backend quando disponível
- 📊 Merge inteligente de dados (local + servidor)

### 🎨 Design Responsivo

- 📱 Mobile-first approach
- 💻 Desktop, Tablet e Mobile otimizados
- 🌈 Interface moderna e intuitiva
- ⚡ Animações suaves

### 🔐 Persistência de Dados

- **Frontend**: localStorage para dados locais
- **Backend**: Node.js + Express + SQLite
- 🔄 Sincronização bidirecional

## 🛠️ Tecnologias Utilizadas

### Frontend

- 🌐 **HTML5** - Estrutura semântica
- 🎨 **CSS3** - Styling responsivo e animations
- ⚙️ **JavaScript Vanilla** - Sem dependências externas (exceto Chart.js)
- 📊 **Chart.js 3.9** - Gráficos interativos
- 💾 **localStorage API** - Persistência local

### Backend

- 🚀 **Node.js** - Runtime JavaScript
- ⚡ **Express.js** - Framework web
- 🗄️ **SQLite3** - Banco de dados leve
- 🔗 **CORS** - Requisições cross-origin
- 📦 **npm** - Gerenciador de pacotes

### DevOps

- 🔄 **Git** - Versionamento
- 📦 **npm** - Dependências
- 🚀 **nodemon** - Auto-reload em desenvolvimento

## 📸 Screenshots

### Dashboard

![Dashboard Screenshot](screenshots/dashboard.png)
- KPIs com indicadores visuais
- Gráficos de Status e Prioridades
- Estatísticas de conclusão

### Gerenciar Tarefas

![Tasks Screenshot](screenshots/tasks.png)
- Cards de tarefas com status visual
- Filtros dinâmicos
- Ações rápidas (editar, deletar, alternar status)

### Criar/Editar Tarefa

![Create Task Screenshot](screenshots/create-task.png)
- Formulário intuitivo
- Sugestão de prioridade por IA
- Validação em tempo real

### Modo Offline

![Offline Mode](screenshots/offline-mode.png)
- Indicador de sincronização
- Alternância entre online/offline
- Sincronização automática

## 🚀 Como Executar

### Pré-requisitos

- 🟢 Node.js 14+ instalado
- 📦 npm ou yarn
- 🌐 Navegador moderno

### Frontend (Modo Desenvolvimento Local)

```bash
# 1. Abrir diretamente no navegador
open index.html
# ou
# Windows: start index.html

# 2. Ou usar um servidor local (Python)
python -m http.server 8000

# 3. Acessar
http://localhost:8000
```

### Backend (Sincronização com Servidor)

```bash
# 1. Instalar dependências
npm install

# 2. Criar arquivo .env (opcional)
echo "PORT=3000" > .env

# 3. Iniciar em desenvolvimento
npm run dev

# 4. Ou em produção
npm start

# 5. O servidor rodará em
http://localhost:3000
```

## 📋 API Endpoints

### Tasks

```
GET    /api/tasks           # Listar todas as tarefas
GET    /api/tasks/:id       # Obter tarefa específica
POST   /api/tasks           # Criar nova tarefa
PUT    /api/tasks/:id       # Atualizar tarefa
DELETE /api/tasks/:id       # Deletar tarefa
```

### Exemplo: Criar Tarefa

```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "id": "task_123",
    "title": "Corrigir bug crítico",
    "description": "Erro urgente no login que derruba a aplicação",
    "priority": "alta",
    "deadline": "2026-04-08",
    "responsible": "dev@example.com",
    "category": "Backend"
  }'
```

## 🧠 Sistema de IA

### Funcionamento da Priorização

A IA analisa a descrição da tarefa e procura por palavras-chave contextuais:

#### 🔴 Prioridade Alta

Palavras como: `urgente`, `crítico`, `bug`, `erro`, `quebrado`, `emergência`, `crash`, `falha`

**Exemplo:**
```
"URGENTE: Sistema offline, erro crítico no servidor de produção"
→ IA Sugere: ALTA (95% confiança)
```

#### 🟡 Prioridade Média

Palavras como: `importante`, `melhorar`, `feature`, `problema`, `implementar`, `esta semana`

**Exemplo:**
```
"Implementar nova funcionalidade de filtros para próxima semana"
→ IA Sugere: MÉDIA (75% confiança)
```

#### 🟢 Prioridade Baixa

Palavras como: `futuro`, `depois`, `documentação`, `refactor`, `estético`, `eventualmente`

**Exemplo:**
```
"Melhorar documentação futura do código"
→ IA Sugere: BAIXA (60% confiança)
```

### Análise Adicional

- 📊 Análise de sentimento (negativo/positivo)
- ⏰ Estimativa de tempo baseada em descrição
- 🎯 Contexto da tarefa

## 📊 Estrutura do Projeto

```
task-manager-inteligente/
├── index.html                 # Aplicação principal
├── css/
│   └── style.css             # Estilos globais
├── js/
│   ├── app.js                # Lógica principal
│   ├── storage.js            # LocalStorage + API
│   ├── ui.js                 # Funções de UI
│   └── ai-priority.js        # Sistema de IA
├── backend/
│   ├── server.js             # Express server
│   ├── database.js           # Configuração SQLite
│   ├── routes/
│   │   └── tasks.js          # CRUD endpoints
│   └── tasks.db              # Banco de dados (gerado)
├── package.json              # Dependências Node
├── .gitignore               # Arquivos ignorados
└── README.md                # Documentação
```

## 🔄 Fluxo de Sincronização

```
┌─────────────┐
│  Frontend   │  localStorage (sempre ativo)
└──────┬──────┘
       │
       ├─→ Online? → Sincronizar com Backend
       │
       └─→ Offline? → Fila local de pendências
                      Sincronizar quando conectar
```

## 🌟 Diferenciais

### ✨ IA Integrada

- Sugestão inteligente de prioridade
- Análise de contexto do texto
- Estimativa de tempo automática
- Melhoria contínua (pode ser expandida)

### 🔄 Sincronização Offline-First

- Funciona completamente offline
- Sincronização automática quando online
- Merge inteligente de conflitos
- Sem perda de dados

### 📱 Progressive Web App Ready

- Estrutura preparada para service workers
- Offline-first architecture
- Responsivo em todos dispositivos

### 🎨 UX/UI Moderna

- Design clean e profissional
- Animações suaves
- Feedback visual em tempo real
- Acessibilidade

## 🚧 Melhorias Futuras

- [ ] Autenticação com JWT
- [ ] Compartilhamento de tarefas entre usuários
- [ ] Notificações de prazo (push notifications)
- [ ] Tags e labels personalizadas
- [ ] Histórico de alterações
- [ ] Exportar para PDF/Excel
- [ ] Dark Mode
- [ ] Integração com Google Calendar
- [ ] Suporte a subtarefas
- [ ] IA mais avançada (ML models)

## 📝 Licença

MIT - Sinta-se livre para usar em seus projetos!

## 👨‍💻 Autora

**Belisnal Costa**
- 🔗 GitHub: [@BelisnalvaCosta](https://github.com/BelisnalvaCosta)
- 📧 Email: bella-costa@hotmail.com.br

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request
6. Não esqueça de dar uma estrela

## ❓ FAQ

**P: Como usar sem backend?**
A: A aplicação funciona perfeitamente com apenas localStorage. O backend é opcional para sincronização persistente.

**P: Posso usar em produção?**
A: Sim! Basta deployar o backend em um servidor (Heroku, Vercel, AWS, etc) e atualizar a URL da API.

**P: Como fazer backup de dados?**
A: Use a função de exportação localStorage ou faça download do banco SQLite do servidor.

**P: Posso customizar cores e temas?**
A: Sim! Edite as variáveis CSS em `css/style.css` (seção `:root`).

## 📞 Suporte

Abra uma issue no repositório para relatar bugs ou sugerir melhorias!

---

**Made with ❤️ by Belisnal Costa**
