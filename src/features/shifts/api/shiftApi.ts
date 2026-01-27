import type { Shift } from '../types';

const API_BASE = '/api';

export const fetchShifts = async (): Promise<Shift[]> => {
    const response = await fetch(`${API_BASE}/shifts`);
    if (!response.ok) {
        throw new Error('Failed to fetch shifts');
    }
    return response.json();
};

export const updateShift = async (shiftId: number, shift: Partial<Shift>): Promise<Shift> => {
    const response = await fetch(`${API_BASE}/shifts/${shiftId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ shift }),
    });

    if (!response.ok) {
        throw new Error('Failed to update shift');
    }
    return response.json();
};

export const deleteShift = async (shiftId: number): Promise<void> => {
    const response = await fetch(`${API_BASE}/shifts/${shiftId}`, {
        method: 'DELETE',
    });

    if (!response.ok) {
        throw new Error('Failed to delete shift');
    }
};

export const createShift = async (shift: Omit<Shift, 'id'>): Promise<Shift> => {
    const response = await fetch(`${API_BASE}/shifts`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ shift }),
    });

    if (!response.ok) {
        throw new Error('Failed to create shift');
    }
    return response.json();
};

export const fetchShiftTypes = async (): Promise<any[]> => {
    const response = await fetch(`${API_BASE}/shift_types`);
    if (!response.ok) {
        throw new Error('Failed to fetch shift types');
    }
    return response.json();
};

export const fetchNames = async (): Promise<any[]> => {
    const response = await fetch(`${API_BASE}/names`);
    if (!response.ok) {
        throw new Error('Failed to fetch names');
    }
    return response.json();
};

export const createShiftType = async (shiftType: string): Promise<any> => {
    const response = await fetch(`${API_BASE}/shift_types`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ shift_type: { shift_type: shiftType } }),
    });

    if (!response.ok) {
        throw new Error('Failed to create shift type');
    }
    return response.json();
};

export const createName = async (name: string): Promise<any> => {
    const response = await fetch(`${API_BASE}/names`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: { name: name } }),
    });

    if (!response.ok) {
        throw new Error('Failed to create name');
    }
    return response.json();
};

export const deleteName = async (nameId: number): Promise<void> => {
    const response = await fetch(`${API_BASE}/names/${nameId}`, {
        method: 'DELETE',
    });

    if (!response.ok) {
        throw new Error('Failed to delete name');
    }
};

export const deleteShiftType = async (shiftTypeId: number): Promise<void> => {
    const response = await fetch(`${API_BASE}/shift_types/${shiftTypeId}`, {
        method: 'DELETE',
    });

    if (!response.ok) {
        throw new Error('Failed to delete shift type');
    }
};
