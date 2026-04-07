const ui = {
    updateLoadingState(isLoading) {
        const elements = document.querySelectorAll('button[type="submit"], .sync-btn');
        elements.forEach(el => {
            el.disabled = isLoading;
            el.style.opacity = isLoading ? '0.5' : '1';
        });
    },

    highlightPriority(element, priority) {
        const colors = {
            alta: '#dc2626',
            media: '#f59e0b',
            baixa: '#16a34a'
        };
        element.style.borderLeftColor = colors[priority];
    },

    animateTaskAdd(element) {
        element.style.animation = 'slideIn 0.3s ease';
    },

    getTaskTemplate(task) {
        return `
            <div class="task-card priority-${task.priority}">
                <div class="task-header">
                    <h3>${task.title}</h3>
                    <span class="priority-${task.priority}">${task.priority}</span>
                </div>
                <p>${task.description}</p>
                <div class="task-meta">
                    <span>📅 ${task.deadline}</span>
                    <span>👤 ${task.responsible}</span>
                </div>
            </div>
        `;
    }
};