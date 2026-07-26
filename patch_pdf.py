import re

with open('src/components/AdminPaymentManagement.tsx', 'r') as f:
    content = f.read()

# Import jspdf and jspdf-autotable
imports_add = """import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
"""
content = content.replace('import { Contingent, Athlete, SystemSettings } from "../types";\n', 'import { Contingent, Athlete, SystemSettings } from "../types";\n' + imports_add)

# Replace triggerPrint logic
old_print = """  const triggerPrint = () => {
    window.print();
  };"""
new_print = """  const triggerPrint = () => {
    const doc = new jsPDF('landscape');
    
    // Header
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("LAPORAN KEUANGAN & PEMBAYARAN KONTINGEN", doc.internal.pageSize.width / 2, 15, { align: 'center' });
    
    doc.setFontSize(11);
    doc.text(`Turnamen Silat: ${settings.eventTitle || "SILAT REGIONAL TOURNAMENT"}`, doc.internal.pageSize.width / 2, 22, { align: 'center' });
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const dateStr = new Date().toLocaleDateString("id-ID", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + " - " + new Date().toLocaleTimeString("id-ID");
    doc.text(`Dicetak pada: ${dateStr}`, doc.internal.pageSize.width / 2, 28, { align: 'center' });

    // Table data
    const tableData = calculatedData.map((row, i) => [
      i + 1,
      row.contingent.contingentName.toUpperCase(),
      `${row.contingent.pjName} (${row.contingent.nowa})`,
      row.athleteCount.toString(),
      row.categoriesList.join(", ") || "-",
      formatRupiah(row.finalBill),
      row.contingent.paymentStatus
    ]);

    // Totals
    const totalAthletes = calculatedData.reduce((sum, item) => sum + item.athleteCount, 0);
    const totalBill = calculatedData.reduce((sum, item) => sum + item.finalBill, 0);
    const totalPaid = calculatedData.filter(i => i.contingent.paymentStatus === "Lunas").length;

    tableData.push([
      "",
      "TOTAL KESELURUHAN:",
      "",
      `${totalAthletes} Atlet`,
      "",
      formatRupiah(totalBill),
      `Lunas: ${totalPaid} Kontingen`
    ]);

    autoTable(doc, {
      startY: 35,
      head: [['No', 'Nama Kontingen', 'Penanggung Jawab', 'Jumlah Atlet', 'Kategori Terdaftar', 'Tagihan Akhir', 'Status Bayar']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
      bodyStyles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        3: { cellWidth: 25, halign: 'center', fontStyle: 'bold' },
        5: { cellWidth: 35, halign: 'right', fontStyle: 'bold' },
        6: { cellWidth: 35, halign: 'center', fontStyle: 'bold' },
      },
      didParseCell: function (data) {
        if (data.row.index === tableData.length - 1) {
          data.cell.styles.fillColor = [241, 245, 249];
          data.cell.styles.fontStyle = 'bold';
        }
      }
    });

    const finalY = (doc as any).lastAutoTable.finalY || 50;

    // Signatures
    doc.setFontSize(10);
    doc.text("Mengetahui,", 50, finalY + 20, { align: 'center' });
    doc.text("Ketua Panitia Pelaksana", 50, finalY + 25, { align: 'center' });
    doc.line(20, finalY + 45, 80, finalY + 45);
    doc.setFontSize(8);
    doc.text("TANDA TANGAN & NAMA TERANG", 50, finalY + 50, { align: 'center' });

    doc.setFontSize(10);
    doc.text("Bendahara Turnamen / Admin Keuangan", doc.internal.pageSize.width - 60, finalY + 25, { align: 'center' });
    doc.line(doc.internal.pageSize.width - 100, finalY + 45, doc.internal.pageSize.width - 20, finalY + 45);
    doc.setFontSize(8);
    doc.text("TANDA TANGAN & NAMA TERANG", doc.internal.pageSize.width - 60, finalY + 50, { align: 'center' });

    doc.save(`Laporan_Keuangan_Kontingen_${new Date().getTime()}.pdf`);
  };"""
content = content.replace(old_print, new_print)

with open('src/components/AdminPaymentManagement.tsx', 'w') as f:
    f.write(content)

