/**
 * Shared utility functions for formatting, safe math, CSV import/export, and ID generation.
 * No external dependencies.
 */

/**
 * Extracts initials safely, skipping empty or punctuation-only segments.
 * Fixes "Du" and index-out-of-bounds bugs across the application.
 */
export function safeInitials(name?: string): string {
  if (!name || typeof name !== 'string') return 'AL';
  const parts = name.trim().split(/[\s,.-]+/).filter(Boolean);
  if (parts.length === 0) return 'AL';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Division that safely returns 0 when denominator is 0, NaN, or non-finite.
 */
export function safeDivide(a: number, b: number): number {
  if (!b || b === 0 || !isFinite(a / b) || isNaN(a / b)) return 0;
  return a / b;
}

/**
 * Generates and triggers browser download of a real CSV file via Blob.
 */
export function downloadCsv(
  filename: string,
  rows: (string | number | boolean | null | undefined)[][]
): void {
  const escapeCell = (cell: string | number | boolean | null | undefined): string => {
    if (cell === null || cell === undefined) return '';
    const str = String(cell);
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const csvContent = rows.map((row) => row.map(escapeCell).join(',')).join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * RFC-4180 compliant CSV text parser supporting quotes, commas, escaped quotes, and CRLF.
 */
export function parseCsv(text: string): string[][] {
  const result: string[][] = [];
  let row: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          current += '"';
          i++; // Skip escaped quote
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        row.push(current.trim());
        current = '';
      } else if (char === '\r') {
        if (nextChar === '\n') {
          i++;
        }
        row.push(current.trim());
        if (row.some((cell) => cell.length > 0)) {
          result.push(row);
        }
        row = [];
        current = '';
      } else if (char === '\n') {
        row.push(current.trim());
        if (row.some((cell) => cell.length > 0)) {
          result.push(row);
        }
        row = [];
        current = '';
      } else {
        current += char;
      }
    }
  }

  // Push trailing cell & row if any
  row.push(current.trim());
  if (row.some((cell) => cell.length > 0)) {
    result.push(row);
  }

  return result;
}

/**
 * Generates collision-free timestamp-based unique identifiers.
 */
export function uniqueId(prefix: string = 'ID'): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}
