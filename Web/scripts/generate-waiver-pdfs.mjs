import fs from 'node:fs';
import path from 'node:path';
import { jsPDF } from 'jspdf';

const ROOT = 'C:/Users/Asus/Desktop/XTrimFitGym-Web-clean';
const OUTPUT_DIR = `${ROOT}/public/waivers`;
const LOGO_PATH = `${ROOT}/public/logo.png`;

const BRAND_YELLOW = [249, 197, 19];
const BORDER_GRAY = [185, 185, 185];
const TEXT_GRAY = [70, 70, 70];
const BASE_TEXT = [25, 25, 25];

function toDataUriPng(imagePath) {
	const base64 = fs.readFileSync(imagePath).toString('base64');
	return `data:image/png;base64,${base64}`;
}

function createDoc() {
	return new jsPDF({
		orientation: 'portrait',
		unit: 'pt',
		format: 'legal',
		compress: true,
	});
}

function drawLabeledCell(doc, x, y, w, h, label, value) {
	doc.setDrawColor(...BORDER_GRAY);
	doc.rect(x, y, w, h);
	doc.setFont('helvetica', 'bold');
	doc.setFontSize(8.5);
	doc.setTextColor(45, 45, 45);
	doc.text(`${label}:`, x + 6, y + 12.5);
	doc.setFont('helvetica', 'normal');
	doc.text(value, x + 50, y + 12.5);
}

function drawSectionHeader(doc, x, y, w, text) {
	doc.setFillColor(...BRAND_YELLOW);
	doc.setDrawColor(130, 130, 130);
	doc.rect(x, y, w, 16, 'FD');
	doc.setTextColor(20, 20, 20);
	doc.setFont('helvetica', 'bold');
	doc.setFontSize(11.5);
	doc.text(text, x + 8, y + 11.5);
}

function drawParagraph(doc, text, x, y, width, lineHeight = 12) {
	const lines = doc.splitTextToSize(text, width);
	doc.text(lines, x, y);
	return y + lines.length * lineHeight;
}

function drawClause(doc, label, body, x, y, width) {
	doc.setTextColor(...BASE_TEXT);
	doc.setFont('helvetica', 'bold');
	doc.setFontSize(9.8);
	doc.text(label, x, y);
	doc.setFont('helvetica', 'normal');
	doc.setFontSize(9.6);
	const wrapped = doc.splitTextToSize(body, width);
	doc.text(wrapped, x, y + 10.5);
	return y + 10.5 + wrapped.length * 11;
}

function drawSignatureLine(doc, x, y, w, label) {
	doc.setDrawColor(80, 80, 80);
	doc.line(x, y, x + w, y);
	doc.setFont('helvetica', 'normal');
	doc.setFontSize(8.8);
	doc.setTextColor(...TEXT_GRAY);
	doc.text(label, x, y + 12);
}

function writePdfWithFallback(outputPdf, bytes) {
	try {
		fs.mkdirSync(path.dirname(outputPdf), { recursive: true });
		fs.writeFileSync(outputPdf, Buffer.from(bytes));
		return outputPdf;
	} catch (error) {
		if (error && typeof error === 'object' && 'code' in error && error.code === 'EBUSY') {
			const parsed = path.parse(outputPdf);
			const fallback = path.join(parsed.dir, `${parsed.name}-revised${parsed.ext}`);
			fs.writeFileSync(fallback, Buffer.from(bytes));
			return fallback;
		}
		throw error;
	}
}

function drawHeader(doc, subTitle) {
	const pageWidth = doc.internal.pageSize.getWidth();
	const margin = 24;
	const frameX = 12;
	const frameY = 12;
	const frameW = pageWidth - 24;
	const frameH = doc.internal.pageSize.getHeight() - 24;

	doc.setDrawColor(210, 210, 210);
	doc.rect(frameX, frameY, frameW, frameH);
	doc.rect(frameX + 10, frameY + 10, frameW - 20, frameH - 20);

	const logo = toDataUriPng(LOGO_PATH);
	const logoW = 56;
	const logoH = 27;
	doc.addImage(logo, 'PNG', margin, 28, logoW, logoH, undefined, 'FAST');
	doc.setFont('helvetica', 'normal');
	doc.setFontSize(7.8);
	doc.setTextColor(...TEXT_GRAY);
	doc.text('GYM logo', margin, 60);

	doc.setFont('helvetica', 'bold');
	doc.setTextColor(20, 20, 20);
	doc.setFontSize(26);
	doc.text('X-TRIM FIT GYM', margin + logoW + 10, 48);
	doc.setFontSize(12);
	doc.text(subTitle, margin + logoW + 10, 66);

	const badgeW = 128;
	const badgeH = 24;
	const badgeX = pageWidth - margin - badgeW;
	const badgeY = 34;
	doc.setDrawColor(BORDER_GRAY[0], BORDER_GRAY[1], BORDER_GRAY[2]);
	doc.rect(badgeX, badgeY, badgeW, badgeH);
	doc.setFontSize(9.2);
	doc.text('OFFICIAL WAIVER FORM', badgeX + 8, badgeY + 15.5);

	return {
		margin,
		pageWidth,
		nextY: 80,
		contentWidth: pageWidth - margin * 2,
	};
}

function drawMetaRow(doc, y, contentWidth, margin, cells) {
	const gap = 6;
	const cellW = (contentWidth - gap * 2) / 3;
	const h = 16;
	drawLabeledCell(doc, margin, y, cellW, h, cells[0].label, cells[0].value);
	drawLabeledCell(doc, margin + cellW + gap, y, cellW, h, cells[1].label, cells[1].value);
	drawLabeledCell(
		doc,
		margin + (cellW + gap) * 2,
		y,
		cellW,
		h,
		cells[2].label,
		cells[2].value,
	);
	return y + h + 7;
}

function renderAdultWaiver(outputPdf) {
	const doc = createDoc();
	const { margin, contentWidth, nextY: headerY } = drawHeader(
		doc,
		'Membership Terms, Facility Rules and Liability Waiver - Adult (18+)'
	);

	let y = drawMetaRow(doc, headerY, contentWidth, margin, [
		{ label: 'Document', value: 'Member Liability Waiver' },
		{ label: 'Version', value: 'Adult 18+ Printable' },
		{ label: 'Effective', value: 'Current Gym Policy' },
	]);

	doc.setDrawColor(120, 120, 120);
	doc.line(margin, y - 3, margin + contentWidth, y - 3);
	drawSectionHeader(doc, margin, y, contentWidth, 'TERMS OF USE AND FACILITY RULES');
	y += 24;

	const colGap = 14;
	const colW = (contentWidth - colGap) / 2;
	let leftY = y;
	let rightY = y;
	const leftClauses = [
		[
			'Agreement.',
			'By signing below, you agree to these terms, posted rules, class schedules, and staff instructions. Membership is a privilege; unsafe or disrespectful conduct may result in suspension or termination without refund where permitted by law.',
		],
		[
			'Hours and access.',
			'Access is limited to published hours, your membership type, and any booking or check-in requirements. We may close for maintenance, holidays, weather, or emergencies.',
		],
		[
			'Health representation.',
			'You represent that you are physically able to participate and have consulted a physician if advised. You will disclose material health changes that affect safe participation.',
		],
		[
			'Assumption of risk.',
			'Fitness activities involve inherent risks including equipment use, slips and trips, contact with others, overexertion, and property hazards. You voluntarily assume all risks not caused by our sole gross negligence or willful misconduct, to the fullest extent allowed by law.',
		],
		[
			'Release and waiver.',
			'To the maximum extent permitted by law, you release, waive, discharge, and covenant not to sue X-TRIM FIT GYM, its owners, operators, instructors, employees, contractors, volunteers, and successors from claims, demands, losses, or damages (including attorney fees) arising from your participation or use of the premises/services, except claims that cannot be waived by law.',
		],
	];
	const rightClauses = [
		[
			'Indemnity.',
			'You agree to indemnify and hold harmless the released parties from claims brought by or through you (including your estate/heirs) related to your conduct or participation, except where prohibited by law.',
		],
		[
			'Personal property.',
			'You are responsible for your belongings. We are not liable for theft, loss, or damage to personal property brought on site.',
		],
		[
			'Media.',
			'Reasonable incidental photography/video may occur in group settings. Tell staff if you require accommodation; we will use reasonable efforts consistent with operations.',
		],
		[
			'Minors.',
			'This form is for adults 18+. Participants under 18 must use the minor/parent printable version.',
		],
		[
			'Governing law and severability.',
			'If any provision is unenforceable, the remainder stays in effect. Disputes are governed by the laws of the Philippines (or jurisdiction printed on your membership contract), unless a signed membership states otherwise.',
		],
	];
	for (const [label, body] of leftClauses) {
		leftY = drawClause(doc, label, body, margin, leftY, colW);
		leftY += 6;
	}
	for (const [label, body] of rightClauses) {
		rightY = drawClause(doc, label, body, margin + colW + colGap, rightY, colW);
		rightY += 6;
	}

	y = Math.max(leftY, rightY) + 14;
	drawSectionHeader(doc, margin, y, contentWidth, 'ACKNOWLEDGMENT AND SIGNATURE (ADULT)');
	y += 24;

	doc.setFont('helvetica', 'bold');
	doc.setFontSize(11);
	y = drawParagraph(
		doc,
		'I HAVE READ (OR HAD READ TO ME) THIS DOCUMENT. I UNDERSTAND IT IS A LEGALLY BINDING AGREEMENT AND A RELEASE OF LIABILITY. I SIGN FREELY AND VOLUNTARILY.',
		margin,
		y,
		contentWidth,
		11
	);
	y += 6;
	doc.setFont('helvetica', 'normal');
	doc.setFontSize(10.5);
	doc.text('[ ] I confirm I am 18 years of age or older.', margin, y);
	y += 18;
	doc.text('[ ] I agree to the terms above and to follow facility rules and staff instructions.', margin, y);
	y += 16;

	const split = margin + contentWidth * 0.5;
	drawSignatureLine(doc, margin, y + 16, split - margin - 8, 'Signature');
	drawSignatureLine(doc, split + 8, y + 16, margin + contentWidth - (split + 8), 'Date');

	y += 54;
	drawSignatureLine(doc, margin, y + 16, split - margin - 8, 'Printed name (full legal name)');
	drawSignatureLine(
		doc,
		split + 8,
		y + 16,
		margin + contentWidth - (split + 8),
		'Contact phone (optional)'
	);
	const bytes = doc.output('arraybuffer');
	return writePdfWithFallback(outputPdf, bytes);
}

function renderMinorWaiver(outputPdf) {
	const doc = createDoc();
	const { margin, contentWidth, nextY: headerY } = drawHeader(
		doc,
		'Membership Terms, Facility Rules and Liability Waiver - Minor with Parent/Guardian'
	);

	let y = drawMetaRow(doc, headerY, contentWidth, margin, [
		{ label: 'Document', value: 'Minor Liability Waiver' },
		{ label: 'Version', value: 'Parent/Guardian Consent' },
		{ label: 'Effective', value: 'Current Gym Policy' },
	]);

	drawSectionHeader(doc, margin, y, contentWidth, 'TERMS OF USE AND FACILITY RULES');
	y += 24;

	const colGap = 14;
	const colW = (contentWidth - colGap) / 2;
	let leftY = y;
	let rightY = y;
	const leftClauses = [
		[
			'Agreement.',
			'The undersigned parent/guardian and the minor agree to these terms, posted rules, schedules, and staff instructions. Membership is a privilege; unsafe or disrespectful conduct may result in suspension or termination without refund, where permitted by law.',
		],
		[
			'Parent/guardian authority.',
			'The adult signing below certifies legal authority to enroll the minor and to bind the minor to this agreement.',
		],
		[
			'Hours and access.',
			'Access follows published hours, membership type, and check-in/booking rules. We may close for maintenance, holidays, weather, or emergencies.',
		],
		[
			'Health representation.',
			'The parent/guardian represents the minor is medically able to participate and has consulted a physician if appropriate. Material health changes affecting safe participation will be disclosed.',
		],
		[
			'Assumption of risk.',
			'Activities involve inherent risks including equipment use, slips/trips, contact, overexertion, and property hazards. Parent/guardian and minor voluntarily assume risks not caused by our sole gross negligence or willful misconduct, to the fullest extent allowed by law.',
		],
	];
	const rightClauses = [
		[
			'Release and waiver.',
			'To the maximum extent permitted by law, parent/guardian and minor release, waive, discharge, and covenant not to sue X-TRIM FIT GYM, its owners, operators, employees, contractors, volunteers, and successors from claims, demands, losses, or damages (including attorney fees) arising from participation or use of premises/services, except claims that cannot be waived.',
		],
		[
			'Indemnity.',
			'Parent/guardian agrees to indemnify and hold harmless the released parties from claims related to the minor conduct or participation, except where prohibited by law.',
		],
		[
			'Personal property.',
			'Belongings remain your responsibility; we are not liable for theft, loss, or damage on site.',
		],
		[
			'Media.',
			'Reasonable incidental photography/video may occur in group settings. Request accommodations from staff where feasible.',
		],
		[
			'Governing law and severability.',
			'If any provision is unenforceable, the remainder stays in effect. Disputes are governed by the laws of the Philippines (or jurisdiction on your membership contract), unless otherwise stated in writing.',
		],
	];
	for (const [label, body] of leftClauses) {
		leftY = drawClause(doc, label, body, margin, leftY, colW);
		leftY += 6;
	}
	for (const [label, body] of rightClauses) {
		rightY = drawClause(doc, label, body, margin + colW + colGap, rightY, colW);
		rightY += 6;
	}

	y = Math.max(leftY, rightY) + 14;
	drawSectionHeader(
		doc,
		margin,
		y,
		contentWidth,
		'ACKNOWLEDGMENT AND SIGNATURES (MINOR + PARENT/GUARDIAN)'
	);
	y += 24;

	doc.setFont('helvetica', 'bold');
	doc.setFontSize(11);
	y = drawParagraph(
		doc,
		'WE HAVE READ (OR HAD READ TO US) THIS DOCUMENT, UNDERSTAND IT IS LEGALLY BINDING, AND SIGN FREELY.',
		margin,
		y,
		contentWidth,
		11
	);
	y += 6;
	doc.setFont('helvetica', 'normal');
	doc.setFontSize(10.5);
	doc.text('[ ] Minor is under 18 years of age as of the date signed.', margin, y);
	y += 18;
	doc.text('[ ] Parent/guardian agrees to the terms and will ensure the minor follows rules and staff instructions.', margin, y);
	y += 14;

	const split = margin + contentWidth * 0.5;
	doc.setFont('helvetica', 'bold');
	doc.setFontSize(10.2);
	doc.text('Participant (minor)', margin, y);
	y += 12;

	drawSignatureLine(doc, margin, y + 16, split - margin - 8, 'Signature (minor)');
	drawSignatureLine(
		doc,
		split + 8,
		y + 16,
		margin + contentWidth - (split + 8),
		'Date of birth (minor)'
	);

	y += 52;
	drawSignatureLine(
		doc,
		margin,
		y + 16,
		split - margin - 8,
		'Printed name (minor - full legal name)'
	);
	drawSignatureLine(doc, split + 8, y + 16, margin + contentWidth - (split + 8), 'Date');

	y += 50;
	doc.setFont('helvetica', 'bold');
	doc.setTextColor(20, 20, 20);
	doc.text('Parent / legal guardian', margin, y);
	y += 12;

	drawSignatureLine(
		doc,
		margin,
		y + 16,
		split - margin - 8,
		'Signature (parent / legal guardian)'
	);
	drawSignatureLine(
		doc,
		split + 8,
		y + 16,
		margin + contentWidth - (split + 8),
		'Relationship to minor (e.g., mother, father, guardian)'
	);

	y += 52;
	drawSignatureLine(doc, margin, y + 16, split - margin - 8, 'Printed name (full legal name)');
	drawSignatureLine(doc, split + 8, y + 16, margin + contentWidth - (split + 8), 'Contact phone');
	const bytes = doc.output('arraybuffer');
	return writePdfWithFallback(outputPdf, bytes);
}

const adultOut = renderAdultWaiver(`${OUTPUT_DIR}/member-liability-waiver-adult.pdf`);
const minorOut = renderMinorWaiver(`${OUTPUT_DIR}/member-liability-waiver-minor.pdf`);

console.log('Waiver PDFs generated successfully (legal portrait, text layout).');
console.log(`Adult waiver: ${adultOut}`);
console.log(`Minor waiver: ${minorOut}`);
