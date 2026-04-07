import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { DashboardMetrics } from './analyticsData';

export async function generatePDFReport(
  metrics: DashboardMetrics,
  societyName: string
): Promise<Blob> {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let yPosition = 20;

  // Helper function to add text
  const addText = (text: string, size: number = 12, isBold: boolean = false, color: [number, number, number] = [0, 0, 0]) => {
    pdf.setFontSize(size);
    pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
    pdf.setTextColor(color[0], color[1], color[2]);
    pdf.text(text, 20, yPosition);
    yPosition += size / 2 + 3;
  };

  // Helper function to add section
  const addSection = (title: string) => {
    yPosition += 5;
    pdf.setFillColor(230, 230, 250);
    pdf.rect(15, yPosition - 5, pageWidth - 30, 8, 'F');
    addText(title, 14, true, [75, 0, 130]);
    yPosition += 3;
  };

  // Helper function to add metric row
  const addMetricRow = (label: string, value: string) => {
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(64, 64, 64);
    pdf.text(label, 20, yPosition);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 102, 204);
    pdf.text(value, pageWidth - 30, yPosition, { align: 'right' });
    yPosition += 8;
  };

  // Helper to check if we need a new page
  const checkNewPage = (minSpace: number = 30) => {
    if (yPosition + minSpace > pageHeight - 10) {
      pdf.addPage();
      yPosition = 20;
      return true;
    }
    return false;
  };

  // Header
  pdf.setFillColor(75, 0, 130);
  pdf.rect(0, 0, pageWidth, 20, 'F');
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(255, 255, 255);
  pdf.text('Society Analytics Report', pageWidth / 2, 14, { align: 'center' });

  yPosition = 35;

  // Society Info
  addText(`Society: ${societyName}`, 12, true);
  addText(`Report Generated: ${new Date(metrics.lastUpdated).toLocaleDateString()}`, 10);
  addText(`Time: ${new Date(metrics.lastUpdated).toLocaleTimeString()}`, 10);

  // Complaints Section
  checkNewPage(50);
  addSection('📋 Complaint Management');
  addMetricRow('Total Complaints:', `${metrics.complaints.totalComplaints}`);
  addMetricRow('Open Complaints:', `${metrics.complaints.openComplaints}`);
  addMetricRow('Resolved Complaints:', `${metrics.complaints.resolvedComplaints}`);
  addMetricRow('Avg Resolution Time:', `${metrics.complaints.averageResolutionTime} days`);

  // Complaints by Category
  checkNewPage(40);
  addSection('Complaints by Category');
  metrics.complaints.complaintsByCategory.slice(0, 5).forEach(item => {
    addMetricRow(`${item.category}:`, `${item.count} complaints`);
  });

  // Payment Section
  checkNewPage(60);
  addSection('💳 Payment & Revenue');
  addMetricRow('Total Revenue:', `₹${metrics.payments.totalRevenue.toLocaleString()}`);
  addMetricRow('Pending Amount:', `₹${metrics.payments.pendingAmount.toLocaleString()}`);
  addMetricRow('Verified Payments:', `${metrics.payments.verifiedPayments}`);
  addMetricRow('Failed Payments:', `${metrics.payments.failedPayments}`);
  addMetricRow('Average Payment:', `₹${metrics.payments.averagePaymentAmount.toLocaleString()}`);
  addMetricRow('Collection Rate:', `${metrics.payments.collectionRate}%`);

  // Maintenance Section
  checkNewPage(40);
  addSection('🏢 Maintenance Fund');
  addMetricRow('Monthly Fee:', `₹${metrics.maintenance.monthlyMaintenanceFee.toLocaleString()}`);
  addMetricRow('Total Collected:', `₹${metrics.maintenance.totalCollected.toLocaleString()}`);
  addMetricRow('Pending Collection:', `₹${metrics.maintenance.pendingCollection.toLocaleString()}`);
  addMetricRow('Collection %:', `${metrics.maintenance.collectionPercentage}%`);
  addMetricRow('Defaulters:', `${metrics.maintenance.defaulters}`);

  // Residents Section
  checkNewPage(40);
  addSection('👥 Residents');
  addMetricRow('Total Residents:', `${metrics.residents.totalResidents}`);
  addMetricRow('Active Residents:', `${metrics.residents.activeResidents}`);
  addMetricRow('New This Month:', `${metrics.residents.newThisMonth}`);

  // Footer
  pdf.setFontSize(8);
  pdf.setTextColor(128, 128, 128);
  const footerY = pageHeight - 5;
  pdf.text(`Page ${pdf.internal.pages.length - 1} of ${pdf.internal.pages.length - 1}`, pageWidth / 2, footerY, { align: 'center' });

  return pdf.output('blob');
}

export async function downloadPDF(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
