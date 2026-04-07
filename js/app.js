// Estado global da aplicação
const app = {
    tasks: [],
    filteredTasks: [],
    currentView: 'dashboard',
    isOfflineMode: false,
    editingTaskId: null,
    chart: {
        status: null,
        priority: null
    }
};

// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Iniciando Task Manager Inteligente');

    // Carregar tarefas
    await loadTasks();

    // Configurar event listeners
    setupEventListeners();

    // Inicializar dashboard
    updateDashboard();
    renderTasks();

    // Verificar conexão
    checkConnection();
});

// ======================
// GERENCIAMENTO DE VIEWS
// ======================

function setupEventListeners() {
    // Navegação
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const view = e.target.closest('.nav-btn').dataset.view;
            switchView(view);
        });
    });

    // Formulário de tarefa
    document.getElementById('taskForm').addEventListener('submit', handleSaveTask);
    document.getElementById('cancelBtn').addEventListener('click', () => switchView('tasks'));

    // Filtros e busca
    document.getElementById('searchInput').addEventListener('input', filterTasks);
    document.getElementById('statusFilter').addEventListener('change', filterTasks);
    document.getElementById('priorityFilter').addEventListener('change', filterTasks);

    // IA - Sugerir prioridade
    document.getElementById('aiPriorityBtn').addEventListener('click', suggestPriority);
    document.getElementById('taskDescription').addEventListener('blur', showAISuggestion);

    // Sincronização
    document.getElementById('syncBtn').addEventListener('click', syncTasks);
    document.getElementById('offlineToggle').addEventListener('click', toggleOfflineMode);

    // Modal
    document.querySelector('.close').addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        const modal = document.getElementById('taskModal');
        if (e.target === modal) closeModal();
    });
}

function switchView(viewName) {
    // Atualizar navegação
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === viewName);
    });

    // Esconder todas as views
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });

    // Mostrar view selecionada
    const viewElement = document.getElementById(`${viewName}-view`);
    if (viewElement) {
        viewElement.classList.add('active');
    }

    app.currentView = viewName;

    // Limpar formulário ao ir para criar tarefa
    if (viewName === 'create') {
        clearForm();
        app.editingTaskId = null;
    }
}

// ======================
// CRUD DE TAREFAS
// ======================

async function loadTasks() {
    try {
        app.tasks = await storage.getTasks();
        console.log(`✅ ${app.tasks.length} tarefas carregadas`);
    } catch (error) {
        console.error('Erro ao carregar tarefas:', error);
        app.tasks = [];
    }
}

async function handleSaveTask(e) {
    e.preventDefault();

    const taskId = document.getElementById('taskId').value;
    const task = {
        id: taskId || generateId(),
        title: document.getElementById('taskTitle').value,
        description: document.getElementById('taskDescription').value,
        priority: document.getElementById('taskPriority').value,
        deadline: document.getElementById('taskDeadline').value,
        responsible: document.getElementById('taskResponsible').value,
        category: document.getElementById('taskCategory').value,
        status: taskId ? app.tasks.find(t => t.id === taskId)?.status : 'em-andamento',
        createdAt: taskId ? app.tasks.find(t => t.id === taskId)?.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    // Validações
    if (!task.title.trim()) {
        alert('❌ O título da tarefa é obrigatório');
        return;
    }

    try {
        if (taskId) {
            // Atualizar
            const index = app.tasks.findIndex(t => t.id === taskId);
            app.tasks[index] = task;
            console.log('✏️ Tarefa atualizada:', task.title);
        } else {
            // Criar
            app.tasks.push(task);
            console.log('✅ Tarefa criada:', task.title);
        }

        // Salvar
        await storage.saveTasks(app.tasks);

        // Sincronizar com backend se online
        if (!app.isOfflineMode && navigator.onLine) {
            await syncTaskToBackend(task);
        }

        // Atualizar UI
        clearForm();
        switchView('tasks');
        renderTasks();
        updateDashboard();

        showNotification(`✅ Tarefa ${taskId ? 'atualizada' : 'criada'} com sucesso!`, 'success');
    } catch (error) {
        console.error('Erro ao salvar tarefa:', error);
        showNotification('❌ Erro ao salvar tarefa', 'error');
    }
}

async function deleteTask(taskId) {
    if (confirm('⚠️ Tem certeza que deseja deletar esta tarefa?')) {
        try {
            app.tasks = app.tasks.filter(t => t.id !== taskId);
            await storage.saveTasks(app.tasks);

            // Sincronizar com backend
            if (!app.isOfflineMode && navigator.onLine) {
                await deleteTaskFromBackend(taskId);
            }

            renderTasks();
            updateDashboard();
            showNotification('✅ Tarefa deletada com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao deletar tarefa:', error);
            showNotification('❌ Erro ao deletar tarefa', 'error');
        }
    }
}

function editTask(taskId) {
    const task = app.tasks.find(t => t.id === taskId);
    if (!task) return;

    // Preencher formulário
    document.getElementById('taskId').value = task.id;
    document.getElementById('taskTitle').value = task.title;
    document.getElementById('taskDescription').value = task.description;
    document.getElementById('taskPriority').value = task.priority;
    document.getElementById('taskDeadline').value = task.deadline;
    document.getElementById('taskResponsible').value = task.responsible;
    document.getElementById('taskCategory').value = task.category;

    switchView('create');
    document.querySelector('.page-header h2').textContent = '✏️ Editar Tarefa';
}

async function toggleTaskStatus(taskId) {
    const task = app.tasks.find(t => t.id === taskId);
    if (!task) return;

    const statusSequence = {
        'em-andamento': 'concluido',
        'concluido': 'em-andamento',
        'atrasado': 'em-andamento'
    };

    task.status = statusSequence[task.status] || 'em-andamento';
    task.updatedAt = new Date().toISOString();

    try {
        await storage.saveTasks(app.tasks);

        if (!app.isOfflineMode && navigator.onLine) {
            await syncTaskToBackend(task);
        }

        renderTasks();
        updateDashboard();
        showNotification(`✅ Tarefa marcada como ${task.status}`, 'success');
    } catch (error) {
        console.error('Erro ao atualizar status:', error);
    }
}

// ======================
// CLASSIFICAÇÃO DE STATUS
// ======================

function classifyTaskStatus(task) {
    const now = new Date();
    const deadline = new Date(task.deadline);

    if (task.status === 'concluido') {
        return 'concluido';
    }

    if (task.deadline && deadline < now && task.status !== 'concluido') {
        return 'atrasado';
    }

    return task.status || 'em-andamento';
}

// ======================
// FILTROS E BUSCA
// ======================

function filterTasks() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;
    const priorityFilter = document.getElementById('priorityFilter').value;

    app.filteredTasks = app.tasks.filter(task => {
        const matchesSearch = 
            task.title.toLowerCase().includes(searchTerm) ||
            task.description.toLowerCase().includes(searchTerm) ||
            task.responsible.toLowerCase().includes(searchTerm);

        const matchesStatus = !statusFilter || classifyTaskStatus(task) === statusFilter;
        const matchesPriority = !priorityFilter || task.priority === priorityFilter;

        return matchesSearch && matchesStatus && matchesPriority;
    });

    renderTasks();
}

// ======================
// RENDERIZAÇÃO
// ======================

function renderTasks() {
    const container = document.getElementById('tasksContainer');
    const tasksToRender = app.filteredTasks.length > 0 ? app.filteredTasks : app.tasks;

    if (tasksToRender.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px;">
                <p style="font-size: 48px; margin-bottom: 10px;">📭</p>
                <p style="color: #6b7280; font-size: 16px;">Nenhuma tarefa encontrada</p>
            </div>
        `;
        return;
    }

    container.innerHTML = tasksToRender.map(task => {
        const status = classifyTaskStatus(task);
        const isOverdue = status === 'atrasado';

        return `
            <div class="task-card priority-${task.priority} ${isOverdue ? 'overdue' : ''}">
                <div class="task-header">
                    <h3 class="task-title">${escapeHtml(task.title)}</h3>
                    <span class="task-priority-badge ${task.priority}">
                        ${getPriorityEmoji(task.priority)} ${task.priority.toUpperCase()}
                    </span>
                </div>

                <p class="task-description">${escapeHtml(task.description)}</p>

                <div class="task-meta">
                    ${task.deadline ? `<span>📅 ${formatDate(task.deadline)}</span>` : ''}
                    ${task.responsible ? `<span>👤 ${escapeHtml(task.responsible)}</span>` : ''}
                    ${task.category ? `<span>🏷️ ${escapeHtml(task.category)}</span>` : ''}
                </div>

                <span class="task-status-badge ${status}">${getStatusEmoji(status)} ${status.toUpperCase()}</span>

                <div class="task-actions">
                    <button class="task-btn task-btn-toggle" onclick="toggleTaskStatus('${task.id}')">
                        ✓ Alternar
                    </button>
                    <button class="task-btn task-btn-edit" onclick="editTask('${task.id}')">
                        ✏️ Editar
                    </button>
                    <button class="task-btn task-btn-delete" onclick="deleteTask('${task.id}')">
                        🗑️ Deletar
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function updateDashboard() {
    const total = app.tasks.length;
    const completed = app.tasks.filter(t => classifyTaskStatus(t) === 'concluido').length;
    const pending = app.tasks.filter(t => 
        ['em-andamento', 'atrasado'].includes(classifyTaskStatus(t))
    ).length;
    const overdue = app.tasks.filter(t => classifyTaskStatus(t) === 'atrasado').length;

    // KPIs
    document.getElementById('totalTasks').textContent = total;
    document.getElementById('completedTasks').textContent = completed;
    document.getElementById('pendingTasks').textContent = pending;
    document.getElementById('overdueTasks').textContent = overdue;

    // Estatísticas
    const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100);
    document.getElementById('completionRate').style.width = completionRate + '%';
    document.getElementById('completionPercent').textContent = completionRate + '%';
    document.getElementById('criticalCount').textContent = overdue;

    // Gráficos
    updateCharts();
}

function updateCharts() {
    // Gráfico de Status
    const statusData = {
        concluido: app.tasks.filter(t => classifyTaskStatus(t) === 'concluido').length,
        em_andamento: app.tasks.filter(t => classifyTaskStatus(t) === 'em-andamento').length,
        atrasado: app.tasks.filter(t => classifyTaskStatus(t) === 'atrasado').length
    };

    updateChart('statusChart', {
        labels: ['✅ Concluído', '⏳ Em Andamento', '⚠️ Atrasado'],
        data: [statusData.concluido, statusData.em_andamento, statusData.atrasado],
        colors: ['#22c55e', '#eab308', '#ef4444']
    });

    // Gráfico de Prioridades
    const priorityData = {
        alta: app.tasks.filter(t => t.priority === 'alta').length,
        media: app.tasks.filter(t => t.priority === 'media').length,
        baixa: app.tasks.filter(t => t.priority === 'baixa').length
    };

    updateChart('priorityChart', {
        labels: ['🔴 Alta', '🟡 Média', '🟢 Baixa'],
        data: [priorityData.alta, priorityData.media, priorityData.baixa],
        colors: ['#dc2626', '#f59e0b', '#16a34a']
    });
}

function updateChart(canvasId, config) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    const ctx2d = ctx.getContext('2d');
    
    // Destruir gráfico anterior
    if (app.chart[canvasId]) {
        app.chart[canvasId].destroy();
    }

    // Criar novo gráfico
    app.chart[canvasId] = new Chart(ctx2d, {
        type: 'doughnut',
        data: {
            labels: config.labels,
            datasets: [{
                data: config.data,
                backgroundColor: config.colors,
                borderColor: '#fff',
                borderWidth: 3,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: { size: 12, weight: 'bold' },
                        padding: 15,
                        usePointStyle: true
                    }
                }
            }
        }
    });
}

// ======================
// UTILIDADES
// ======================

function clearForm() {
    document.getElementById('taskForm').reset();
    document.getElementById('taskId').value = '';
    document.getElementById('aiSuggestion').textContent = '';
    document.querySelector('.page-header h2').textContent = '➕ Nova Tarefa';
}

function generateId() {
    return 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function getPriorityEmoji(priority) {
    const emojis = { alta: '🔴', media: '🟡', baixa: '🟢' };
    return emojis[priority] || '⭕';
}

function getStatusEmoji(status) {
    const emojis = { 
        concluido: '✅', 
        'em-andamento': '⏳', 
        atrasado: '⚠️' 
    };
    return emojis[status] || '❓';
}

function showNotification(message, type = 'info') {
    console.log(`[${type.toUpperCase()}] ${message}`);
    // Você pode implementar um toast/notificação visual aqui
    alert(message);
}

function closeModal() {
    document.getElementById('taskModal').classList.remove('active');
}

// ======================
// SINCRONIZAÇÃO
// ======================

async function syncTasks() {
    try {
        const btn = document.getElementById('syncBtn');
        btn.disabled = true;
        btn.textContent = '⏳ Sincronizando...';

        if (navigator.onLine && !app.isOfflineMode) {
            await storage.syncWithBackend();
            showNotification('✅ Tarefas sincronizadas com sucesso!', 'success');
        } else {
            showNotification('📱 Modo offline - dados serão sincronizados ao conectar', 'info');
        }
    } catch (error) {
        console.error('Erro na sincronização:', error);
        showNotification('❌ Erro ao sincronizar tarefas', 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = '🔄 Sincronizar';
    }
}

function toggleOfflineMode() {
    app.isOfflineMode = !app.isOfflineMode;
    const indicator = document.getElementById('syncIndicator');
    const text = document.getElementById('syncText');

    if (app.isOfflineMode) {
        indicator.classList.remove('online');
        indicator.classList.add('offline');
        text.textContent = 'Modo Offline';
        showNotification('📱 Modo Offline Ativado', 'info');
    } else {
        indicator.classList.remove('offline');
        indicator.classList.add('online');
        text.textContent = 'Sincronizado';
        showNotification('🌐 Modo Online Ativado', 'info');
    }
}

function checkConnection() {
    window.addEventListener('online', () => {
        console.log('🌐 Conectado à internet');
        updateSyncStatus(true);
    });

    window.addEventListener('offline', () => {
        console.log('📱 Desconectado da internet');
        updateSyncStatus(false);
    });
}

function updateSyncStatus(isOnline) {
    const indicator = document.getElementById('syncIndicator');
    const text = document.getElementById('syncText');

    if (isOnline) {
        indicator.classList.add('online');
        text.textContent = 'Online';
    } else {
        indicator.classList.remove('online');
        text.textContent = 'Offline';
    }
}

// ======================
// IA - PRIORIZAÇÃO
// ======================

function showAISuggestion() {
    const description = document.getElementById('taskDescription').value;
    if (description.length < 10) return;

    const suggestion = aiPriority.suggestPriority(description);
    const element = document.getElementById('aiSuggestion');

    if (suggestion && suggestion.priority !== document.getElementById('taskPriority').value) {
        element.innerHTML = `
            ✨ IA Sugere: <strong>${suggestion.priority.toUpperCase()}</strong> 
            (Confiança: ${suggestion.confidence}%)
        `;
    }
}

function suggestPriority() {
    const description = document.getElementById('taskDescription').value;
    if (!description.trim()) {
        alert('⚠️ Descreva a tarefa para receber uma sugestão');
        return;
    }

    const suggestion = aiPriority.suggestPriority(description);
    if (suggestion) {
        document.getElementById('taskPriority').value = suggestion.priority;
        showNotification(
            `✨ Prioridade sugerida: ${suggestion.priority.toUpperCase()} (${suggestion.confidence}% confiança)`,
            'info'
        );
    }
}

// ======================
// BACKEND SYNC
// ======================

async function syncTaskToBackend(task) {
    try {
        const response = await fetch('http://localhost:3000/api/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(task)
        });

        if (!response.ok) throw new Error('Erro ao sincronizar');
        console.log('✅ Tarefa sincronizada com backend');
    } catch (error) {
        console.warn('⚠️ Não foi possível sincronizar com backend:', error);
    }
}

async function deleteTaskFromBackend(taskId) {
    try {
        const response = await fetch(`http://localhost:3000/api/tasks/${taskId}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Erro ao deletar');
        console.log('✅ Tarefa deletada do backend');
    } catch (error) {
        console.warn('⚠️ Não foi possível deletar do backend:', error);
    }
}