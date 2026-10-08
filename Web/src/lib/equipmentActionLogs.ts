import { EquipmentStatus } from '@/graphql/generated/graphql';

export type EquipmentActionType =
	| 'CREATED'
	| 'UPDATED'
	| 'STATUS_CHANGED'
	| 'SET_UNDER_MAINTENANCE'
	| 'ARCHIVED'
	| 'RESTORED';

export type EquipmentActionLog = {
	id: string;
	equipmentId: string;
	equipmentName: string;
	actionType: EquipmentActionType;
	fromStatus?: EquipmentStatus | null;
	toStatus?: EquipmentStatus | null;
	reason?: string | null;
	actionBy: string;
	createdAt: string;
};

export const EQUIPMENT_ACTION_LOGS_KEY = 'xtrimfit-equipment-action-logs';

export function readEquipmentActionLogs(): EquipmentActionLog[] {
	try {
		const raw = localStorage.getItem(EQUIPMENT_ACTION_LOGS_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw) as EquipmentActionLog[];
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}

export function appendEquipmentActionLog(
	log: Omit<EquipmentActionLog, 'id' | 'createdAt'>
): EquipmentActionLog[] {
	const next: EquipmentActionLog = {
		id: `equipment-action-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
		createdAt: new Date().toISOString(),
		...log,
	};
	const current = readEquipmentActionLogs();
	const updated = [next, ...current].slice(0, 500);
	localStorage.setItem(EQUIPMENT_ACTION_LOGS_KEY, JSON.stringify(updated));
	return updated;
}
