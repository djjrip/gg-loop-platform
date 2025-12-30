/**
 * Ghost Bot API - Allows Cursor to delegate tasks to Ghost Bot
 * and track what Ghost Bot is doing
 */
import { Router } from 'express';
import { writeFile, readFile } from 'fs/promises';
import { join } from 'path';
const router = Router();
// File paths for communication
const TASKS_FILE = join(process.cwd(), 'ghost-bot-tasks.json');
const STATUS_FILE = join(process.cwd(), 'ghost-bot-status.json');
/**
 * Get pending tasks for Ghost Bot
 * Ghost Bot polls this endpoint to get tasks from Cursor
 */
router.get('/tasks', async (req, res) => {
    try {
        const tasks = await readFile(TASKS_FILE, 'utf-8').catch(() => '[]');
        const taskList = JSON.parse(tasks);
        res.json({
            success: true,
            tasks: taskList.filter((t) => !t.completed),
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        res.json({
            success: true,
            tasks: [],
            error: error.message
        });
    }
});
/**
 * Add a task for Ghost Bot to execute
 * Cursor calls this to delegate work to Ghost Bot
 */
router.post('/tasks', async (req, res) => {
    try {
        const { action, field, value, selector, url, description } = req.body;
        const task = {
            id: `task-${Date.now()}-${Math.random().toString(36).substring(7)}`,
            action,
            field,
            value,
            selector,
            url,
            description,
            createdAt: new Date().toISOString(),
            completed: false
        };
        // Load existing tasks
        const existing = await readFile(TASKS_FILE, 'utf-8').catch(() => '[]');
        const tasks = JSON.parse(existing);
        // Add new task
        tasks.push(task);
        // Save
        await writeFile(TASKS_FILE, JSON.stringify(tasks, null, 2));
        res.json({
            success: true,
            task,
            message: 'Task added for Ghost Bot'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
/**
 * Mark task as completed
 * Ghost Bot calls this when it finishes a task
 */
router.post('/tasks/:id/complete', async (req, res) => {
    try {
        const { id } = req.params;
        const { result, error } = req.body;
        const tasks = JSON.parse(await readFile(TASKS_FILE, 'utf-8').catch(() => '[]'));
        const task = tasks.find((t) => t.id === id);
        if (task) {
            task.completed = true;
            task.completedAt = new Date().toISOString();
            task.result = result;
            task.error = error;
            await writeFile(TASKS_FILE, JSON.stringify(tasks, null, 2));
        }
        res.json({ success: true, task });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
/**
 * Get Ghost Bot status
 * Cursor calls this to see what Ghost Bot is doing
 */
router.get('/status', async (req, res) => {
    try {
        const status = await readFile(STATUS_FILE, 'utf-8').catch(() => '{}');
        res.json({
            success: true,
            status: JSON.parse(status),
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        res.json({
            success: true,
            status: {},
            error: error.message
        });
    }
});
/**
 * Update Ghost Bot status
 * Ghost Bot calls this to report what it's doing
 */
router.post('/status', async (req, res) => {
    try {
        const status = {
            ...req.body,
            timestamp: new Date().toISOString()
        };
        await writeFile(STATUS_FILE, JSON.stringify(status, null, 2));
        res.json({
            success: true,
            message: 'Status updated'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
/**
 * Get all completed tasks (history)
 */
router.get('/history', async (req, res) => {
    try {
        const tasks = JSON.parse(await readFile(TASKS_FILE, 'utf-8').catch(() => '[]'));
        const completed = tasks.filter((t) => t.completed);
        res.json({
            success: true,
            tasks: completed,
            count: completed.length
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
export default router;
