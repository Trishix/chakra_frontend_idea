import type { ReportSnapshot } from './types';

// The bundled standard PDF font is ASCII. Mark unsupported glyphs explicitly
// so an exported report never silently turns reviewer text into blank space.
function ascii(value: string): string {
  return value
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\u2026/g, '...')
    .replace(/\u2022/g, '-')
    .replace(/\u20b9/g, 'INR ')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x20-\x7E\n]/g, '[non-ASCII]');
}

function displayDate(value: string): string {
  if (!value.trim()) return 'Not recorded';
  const parsed = new Date(value);
  if (!Number.isFinite(parsed.getTime())) return 'Not recorded (invalid date)';
  return parsed.toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC',
  });
}

/** Export only the saved snapshot; never update its records or review state. */
export async function downloadReport(report: ReportSnapshot): Promise<void> {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = width - margin * 2;
  const bottom = height - 24;
  let y = 37;

  doc.setProperties({
    title: ascii(report.title),
    subject: 'Demonstration investigation report. Fictional records.',
    author: 'Chakra / dot_gitignore',
    creator: 'Chakra local frontend',
  });

  function header(): void {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(23, 65, 66);
    doc.text('Chakra', margin, 19);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(80, 90, 97);
    doc.text('TEAM dot_gitignore', width - margin, 18, { align: 'right' });
    doc.text('Demonstration data. Fictional records.', margin, 25);
    doc.setDrawColor(202, 213, 215);
    doc.line(margin, 29, width - margin, 29);
  }

  function ensureSpace(amount: number): void {
    if (y + amount <= bottom) return;
    doc.addPage();
    header();
    y = 37;
  }

  function paragraph(value: string, size = 10, bold = false): void {
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setFontSize(size);
    const lines = doc.splitTextToSize(ascii(value), contentWidth) as string[];
    const lineHeight = size * 0.3528 * 1.5;
    for (const line of lines) {
      ensureSpace(lineHeight);
      // A page header changes the font and color; restore the body style.
      doc.setFont('helvetica', bold ? 'bold' : 'normal');
      doc.setFontSize(size);
      doc.setTextColor(40, 49, 57);
      doc.text(line, margin, y);
      y += lineHeight;
    }
    y += 2;
  }

  function section(title: string): void {
    ensureSpace(24);
    y += 4;
    paragraph(title, 12, true);
  }

  const permittedSources = report.sources.filter((source) => !source.restricted);
  const sourceNumbers = new Map(permittedSources.map((source, index) => [source.id, index + 1]));

  header();
  paragraph(report.title || 'Investigation report', 20, true);
  paragraph(`Case reference: ${report.caseReference || 'Not recorded'}`, 10, true);
  paragraph(`Report reference: ${report.id}`);
  paragraph(`Created: ${displayDate(report.createdAt)} (UTC)`);
  paragraph('Saved review snapshot. This document is a fictional demonstration, not an official finding.', 9);

  section('Review notes');
  paragraph(report.notes.trim() || 'No report-level review notes recorded.');

  section(`Selected leads (${report.leads.length})`);
  if (report.leads.length === 0) paragraph('No leads were included in this snapshot.');
  report.leads.forEach((lead, index) => {
    ensureSpace(30);
    paragraph(`${index + 1}. ${lead.title}`, 11, true);
    paragraph(`Status: ${lead.status} | Evidence classification: ${lead.kind}`, 9);
    paragraph(`Recorded: ${displayDate(lead.date)} | Reviewed: ${lead.reviewedAt ? displayDate(lead.reviewedAt) : 'Not recorded'}`, 9);
    paragraph(lead.summary);
    paragraph(`Basis: ${lead.reason || 'No basis recorded.'}`);
    paragraph(`Reviewer notes: ${lead.notes?.trim() || 'No reviewer notes recorded.'}`);
    const references = lead.sourceIds
      .map((id) => sourceNumbers.get(id))
      .filter((number): number is number => number !== undefined);
    paragraph(`Source references: ${references.length ? references.map((number) => `[${number}]`).join(', ') : 'No accessible source in this snapshot.'}`, 9);
    if (references.length < lead.sourceIds.length) {
      paragraph('Some linked sources are unavailable in this export. Their content is not included.', 9);
    }
    y += 3;
  });

  section(`Source register (${permittedSources.length})`);
  if (permittedSources.length === 0) paragraph('No accessible sources were saved with this report.');
  permittedSources.forEach((source, index) => {
    ensureSpace(28);
    paragraph(`[${index + 1}] ${source.title}`, 11, true);
    paragraph(`Type: ${source.type} | Document date: ${displayDate(source.date)}`, 9);
    const pages = Number.isFinite(source.pages) && source.pages >= 1 ? Math.floor(source.pages) : 0;
    paragraph(`Document page reference: ${pages ? (pages === 1 ? 'p. 1' : `pp. 1-${pages}`) : 'Not recorded'}`, 9);
    paragraph('The excerpt has no verified page-level mapping; the reference covers the source document.', 9);
    paragraph(`Excerpt: ${source.excerpt || 'No excerpt recorded.'}`);
    y += 3;
  });

  section('Uncertainty and limitations');
  paragraph('All people, cases, records and relationships in this demonstration are fictional. A relationship or lead is a review aid, not proof of wrongdoing. Conflicts, inferred links and unverified claims require independent corroboration. A reviewed status records a user action; it does not establish that a claim is true.');
  paragraph('This export reflects the saved snapshot only. Later changes to leads or notes are not incorporated. Source excerpts may omit context; document page ranges are not exact citations. Restricted sources and session-only attachments are excluded. Review any unavailable sources through an appropriate authorized process before relying on a claim.');
  paragraph('Chakra is a local frontend prototype by team dot_gitignore. It provides no authentication, backend, production security guarantee or NIC endorsement.', 9);

  const pageCount = doc.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
    doc.setDrawColor(202, 213, 215);
    doc.line(margin, height - 19, width - margin, height - 19);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(80, 90, 97);
    doc.text('Demonstration data. Fictional records.', margin, height - 13);
    doc.text(`Page ${page} of ${pageCount}`, width - margin, height - 13, { align: 'right' });
  }
  const safeId = report.id.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 100) || 'snapshot';
  doc.save(`chakra-report-${safeId}.pdf`);
}
