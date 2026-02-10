import * as XLSX from 'xlsx';

export function exportToExcel<T extends Record<string, unknown>>(
  data: T[],
  filename: string,
  sheetName: string = 'Sheet1'
) {
  if (data.length === 0) {
    alert('No data to export');
    return;
  }

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Auto-size columns
  const maxWidths: number[] = [];
  const headers = Object.keys(data[0]);
  headers.forEach((header, i) => {
    maxWidths[i] = header.length;
    data.forEach((row) => {
      const val = row[header];
      const len = val !== null && val !== undefined ? String(val).length : 0;
      if (len > maxWidths[i]) maxWidths[i] = len;
    });
  });
  worksheet['!cols'] = maxWidths.map((w) => ({ wch: Math.min(w + 2, 50) }));

  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

export function formatCurrency(amount: number | null | undefined, currency: string = 'USD'): string {
  if (amount === null || amount === undefined) return '-';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency === 'INR' ? 'INR' : 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function calculateOverdueDays(dueDate: string | null): number {
  if (!dueDate) return 0;
  const due = new Date(dueDate);
  const now = new Date();
  const diff = Math.floor((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
}

export function getStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    // Order statuses
    confirmed: 'bg-blue-100 text-blue-800',
    in_production: 'bg-yellow-100 text-yellow-800',
    ready_to_ship: 'bg-orange-100 text-orange-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    completed: 'bg-green-200 text-green-900',
    cancelled: 'bg-red-100 text-red-800',
    // Payment statuses
    pending: 'bg-yellow-100 text-yellow-800',
    partial: 'bg-orange-100 text-orange-800',
    received: 'bg-green-100 text-green-800',
    overdue: 'bg-red-100 text-red-800',
    write_off: 'bg-gray-100 text-gray-800',
    // Shipment statuses
    booked: 'bg-blue-100 text-blue-800',
    loaded: 'bg-indigo-100 text-indigo-800',
    in_transit: 'bg-purple-100 text-purple-800',
    arrived: 'bg-teal-100 text-teal-800',
    // Customer statuses
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    blocked: 'bg-red-100 text-red-800',
    // Inquiry statuses
    quoted: 'bg-blue-100 text-blue-800',
    converted: 'bg-green-100 text-green-800',
    lost: 'bg-red-100 text-red-800',
    // Default
    default: 'bg-gray-100 text-gray-800',
  };
  return colorMap[status] || colorMap.default;
}

export function getOverdueColor(days: number): string {
  if (days === 0) return 'text-green-600';
  if (days <= 30) return 'text-yellow-600';
  if (days <= 60) return 'text-orange-600';
  return 'text-red-600 font-bold';
}

export function getLCExpiryAlert(expiryDate: string | null): { color: string; message: string } | null {
  if (!expiryDate) return null;
  const expiry = new Date(expiryDate);
  const now = new Date();
  const daysUntilExpiry = Math.floor((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (daysUntilExpiry < 0) {
    return { color: 'text-red-600 bg-red-50', message: `LC EXPIRED ${Math.abs(daysUntilExpiry)} days ago` };
  }
  if (daysUntilExpiry <= 7) {
    return { color: 'text-red-600 bg-red-50', message: `LC expires in ${daysUntilExpiry} days!` };
  }
  if (daysUntilExpiry <= 15) {
    return { color: 'text-orange-600 bg-orange-50', message: `LC expires in ${daysUntilExpiry} days` };
  }
  if (daysUntilExpiry <= 30) {
    return { color: 'text-yellow-600 bg-yellow-50', message: `LC expires in ${daysUntilExpiry} days` };
  }
  return null;
}
