import pool, { countUserAssignedTasksInDb, findUserByIdInDb } from '../database.js';
import { createModelError } from '../errors.js';

export const deleteModel = async (id) => {
    const existingUser = await findUserByIdInDb(id);

    if (!existingUser) {
        throw createModelError('Usuario no encontrado', 404);
    }

    const assignedTasksCount = await countUserAssignedTasksInDb(id);

    if (assignedTasksCount > 0) {
        throw createModelError('No se puede eliminar el usuario porque tiene tareas asignadas', 409);
    }

    await pool.query('DELETE FROM users WHERE id = ?', [id]);

    return existingUser;
};
