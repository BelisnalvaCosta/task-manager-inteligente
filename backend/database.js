const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'tasks.db');
const db = new sqlite3.Database(dbPath);

const database = {
    init() {
        db.run(`
            CREATE TABLE IF NOT EXISTS tasks (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                description TEXT,
                priority TEXT DEFAULT 'media',
                status TEXT DEFAULT 'em-andamento',
                deadline TEXT,
                responsible TEXT,
                category TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        `, (err) => {
            if (err) {
                console.error('Erro ao criar tabela:', err);
            } else {
                console.log('✅ Tabela de tarefas inicializada');
            }
        });
    },

    getAllTasks(callback) {
        db.all('SELECT * FROM tasks ORDER BY created_at DESC', callback);
    },

    getTaskById(id, callback) {
        db.get('SELECT * FROM tasks WHERE id = ?', [id], callback);
    },

    createTask(task, callback) {
        db.run(
            `INSERT INTO tasks (id, title, description, priority, status, deadline, responsible, category, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                task.id,
                task.title,
                task.description,
                task.priority,
                task.status,
                task.deadline,
                task.responsible,
                task.category,
                new Date().toISOString(),
                new Date().toISOString()
            ],
            callback
        );
    },

    updateTask(id, task, callback) {
        db.run(
            `UPDATE tasks 
             SET title = ?, description = ?, priority = ?, status = ?, deadline = ?, responsible = ?, category = ?, updated_at = ?
             WHERE id = ?`,
            [
                task.title,
                task.description,
                task.priority,
                task.status,
                task.deadline,
                task.responsible,
                task.category,
                new Date().toISOString(),
                id
            ],
            callback
        );
    },

    deleteTask(id, callback) {
        db.run('DELETE FROM tasks WHERE id = ?', [id], callback);
    },

    closeDb() {
        db.close();
    }
};

module.exports = database;