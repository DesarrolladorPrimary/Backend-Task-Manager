import pool, { countUserAssignedTasksInDb, findUserByIdInDb, formatDateForSQL } from '../database.js';
import { createModelError } from '../errors.js';
import { VALID_USER_STATUSES } from './helpers.js';

export const updateStatusModel = async (id, status) => {
    const normalizedStatus = status?.trim().toLowerCase();

    if (!VALID_USER_STATUSES.includes(normalizedStatus)) {
        throw createModelError('Estado inválido. Debe ser: activo, inactivo, suspendido o eliminado');
    }

    const existingUser = await findUserByIdInDb(id);

    if (!existingUser) {
        throw createModelError('Usuario no encontrado', 404);
    }

    if (normalizedStatus === 'eliminado') {
        const assignedTasksCount = await countUserAssignedTasksInDb(id);

        if (assignedTasksCount > 0) {
            throw createModelError('No se puede marcar como eliminado porque el usuario tiene tareas asignadas', 409);
        }
    }

    await pool.query(
        'UPDATE users SET status = ?, updatedAt = ? WHERE id = ?',
        [normalizedStatus, formatDateForSQL(), id]
    );

    return findUserByIdInDb(id);
};
