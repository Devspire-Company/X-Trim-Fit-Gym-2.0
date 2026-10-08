import { appendLocalReportExportLog } from '@/lib/reportExportLogs';

export type ExportTableCsvUser = {
	id?: string | null;
	role?: string | null;
	firstName?: string | null;
	lastName?: string | null;
	email?: string | null;
} | null;

export type ExportTableCsvSection = {
	title: string;
	head: string[];
	rows: Array<Array<string | number | null | undefined>>;
};

export type ExportTableCsvArgs = {
	filePrefix: string;
	head?: string[];
	rows?: Array<Array<string | number | null | undefined>>;
	sections?: ExportTableCsvSection[];
	reportType?: string;
	filterSummary?: string;
	user?: ExportTableCsvUser;
};

/** RFC-style CSV cell escaping (aligned with Reports downloadables). */
export function escapeCsvCell(value: string | number | null | undefined): string {
	if (value === null || value === undefined) return '';
	const str = String(value);
	if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
		return `"${str.replace(/"/g, '""')}"`;
	}
	return str;
}

function rowToCsvLine(cells: Array<string | number | null | undefined>): string {
	return cells.map((c) => escapeCsvCell(c)).join(',');
}

/**
 * Download tabular data as UTF-8 CSV. Supports the same single-table and multi-section
 * shapes as {@link exportTablePdf} for consistency across modules.
 */
export function exportTableCsv({
	filePrefix,
	head,
	rows,
	sections,
	reportType,
	filterSummary,
	user,
}: ExportTableCsvArgs): string {
	const now = new Date();
	const safeDate = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
	const fileName = `${filePrefix}-${safeDate}.csv`;

	const effectiveSections: ExportTableCsvSection[] =
		sections && sections.length > 0
			? sections
			: head && rows
				? [{ title: '', head, rows }]
				: [];

	const lines: string[] = [];
	for (const section of effectiveSections) {
		if (section.title) {
			lines.push(`# ${section.title.replace(/\r?\n/g, ' ')}`);
		}
		lines.push(rowToCsvLine(section.head));
		for (const r of section.rows) {
			lines.push(rowToCsvLine(r));
		}
		lines.push('');
	}

	const body = lines.join('\r\n').replace(/\r\n$/, '');
	const csvContent = `\uFEFF${body}`;

	const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = fileName;
	a.click();
	URL.revokeObjectURL(url);

	if (reportType) {
		appendLocalReportExportLog({
			reportType,
			fileName,
			filterSummary,
			user,
		});
	}

	return fileName;
}
