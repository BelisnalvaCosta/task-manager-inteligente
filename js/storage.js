const storage = {
    // LocalStorage
    async getTasks() {
        try {
            const tasks = localStorage.getItem('tasks');
            return tasks ? JSON.parse(tasks) : [];
        } catch (error) {
            console.error('Erro ao ler localStorage:', error);
            return [];
        }
    },

    async saveTasks(tasks) {
        try {
            localStorage.setItem('tasks', JSON.stringify(tasks));
            localStorage.setItem('lastSync', new Date().toISOString());
            console.log('💾 Tarefas salvas no localStorage');
        } catch (error) {
            console.error('Erro ao salvar no localStorage:', error);
            throw error;
        }
    },

    // Backend Sync
    async syncWithBackend() {
        try {
            const response = await fetch('http://localhost:3000/api/tasks');
            if (!response.ok) throw new Error('Erro ao conectar com backend');

            const backendTasks = await response.json();
            const localTasks = await this.getTasks();

            // Merge: backend + local (local tem prioridade para alterações recentes)
            const merged = this.mergeTasks(backendTasks, localTasks);
            await this.saveTasks(merged);

            return merged;
        } catch (error) {
            console.warn('⚠️ Não foi possível sincronizar com backend:', error);
            // Continuar com localStorage
            return await this.getTasks();
        }
    },

    mergeTasks(backendTasks, localTasks) {
        const merged = [...backendTasks];

        localTasks.forEach(localTask => {
            const backendIndex = merged.findIndex(t => t.id === localTask.id);
            
            if (backendIndex === -1) {
                // Tarefa nova localmente
                merged.push(localTask);
            } else {
                // Comparar timestamps - mais recente vence
                if (new Date(localTask.updatedAt) > new Date(merged[backendIndex].updatedAt)) {
                    merged[backendIndex] = localTask;
                }
            }
        });

        return merged;
    }
};