export const REPORT_EXPORT_LOCAL_STORAGE_KEY = 'xtrimfit-report-export-logs';

type ExportUser = {
	id?: string | null;
	role?: string | null;
	firstName?: string | null;
	lastName?: string | null;
	email?: string | null;
};

export type LocalReportExportLog = {
	id: string;
	reportType: string;
	fileName: string;
	downloadedById: string;
	downloadedByRole: string;
	downloadedBy?: {
		firstName?: string;
		lastName?: string;
		email?: string;
	};
	filterSummary?: string;
	createdAt: string;
};

export function readLocalReportExportLogs(): LocalReportExportLog[] {
	try {
		const raw = localStorage.getItem(REPORT_EXPORT_LOCAL_STORAGE_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw) as LocalReportExportLog[];
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}

export function appendLocalReportExportLog(args: {
	reportType: string;
	fileName: string;
	user?: ExportUser | null;
	filterSummary?: string;
}): LocalReportExportLog[] {
	const next: LocalReportExportLog = {
		id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
		reportType: String(args.reportType || 'EXPORT'),
		fileName: args.fileName,
		downloadedById: args.user?.id || 'unknown',
		downloadedByRole: args.user?.role || 'admin',
		downloadedBy: {
			firstName: args.user?.firstName || undefined,
			lastName: args.user?.lastName || undefined,
			email: args.user?.email || undefined,
		},
		filterSummary: args.filterSummary,
		createdAt: new Date().toISOString(),
	};

	const prev = readLocalReportExportLogs();
	const updated = [next, ...prev].slice(0, 200);
	try {
		localStorage.setItem(REPORT_EXPORT_LOCAL_STORAGE_KEY, JSON.stringify(updated));
	} catch {
		// Non-blocking in case storage is unavailable.
	}
	return updated;
}
