const express = require('express');
const db = require('../database');
const router = express.Router();

// GET - Todas as tarefas
router.get('/', (req, res) => {
    db.getAllTasks((err, tasks) => {
        if (err) {
            return res.status(500).json({ error: 'Erro ao buscar tarefas' });
        }
        res.json(tasks || []);
    });
});

// GET - Uma tarefa específica
router.get('/:id', (req, res) => {
    db.getTaskById(req.params.id, (err, task) => {
        if (err) {
            return res.status(500).json({ error: 'Erro ao buscar tarefa' });
        }
        if (!task) {
            return res.status(404).json({ error: 'Tarefa não encontrada' });
        }
        res.json(task);
    });
});

// POST - Criar tarefa
router.post('/', (req, res) => {
    const { id, title, description, priority, status, deadline, responsible, category } = req.body;

    if (!title) {
        return res.status(400).json({ error: 'Título é obrigatório' });
    }

    const task = {
        id: id || `task_${Date.now()}`,
        title,
        description: description || '',
        priority: priority || 'media',
        status: status || 'em-andamento',
        deadline: deadline || null,
        responsible: responsible || '',
        category: category || ''
    };

    db.createTask(task, (err) => {
        if (err) {
            return res.status(500).json({ error: 'Erro ao criar tarefa' });
        }
        res.status(201).json(task);
    });
});

// PUT - Atualizar tarefa
router.put('/:id', (req, res) => {
    const { title, description, priority, status, deadline, responsible, category } = req.body;

    if (!title) {
        return res.status(400).json({ error: 'Título é obrigatório' });
    }

    const task = {
        title,
        description: description || '',
        priority: priority || 'media',
        status: status || 'em-andamento',
        deadline: deadline || null,
        responsible: responsible || '',
        category: category || ''
    };

    db.updateTask(req.params.id, task, (err) => {
        if (err) {
            return res.status(500).json({ error: 'Erro ao atualizar tarefa' });
        }
        res.json({ ...task, id: req.params.id });
    });
});

// DELETE - Deletar tarefa
router.delete('/:id', (req, res) => {
    db.deleteTask(req.params.id, (err) => {
        if (err) {
            return res.status(500).json({ error: 'Erro ao deletar tarefa' });
        }
        res.json({ message: 'Tarefa deletada com sucesso' });
    });
});

module.exports = router;