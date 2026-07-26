import React from "react";
import { Athlete, Contingent, SystemSettings } from "../types";

export default function CetakLaporanPDF({ athletes, contingents, settings }: { athletes: Athlete[], contingents: Contingent[], settings: SystemSettings }) {
  const tgl = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="hidden print:block absolute inset-0 bg-white z-[9999] p-8 text-black page-break-inside-avoid print-laporan">
      <div className="text-center mb-8 border-b-2 border-black pb-4">
        <h1 className="text-2xl font-black uppercase tracking-widest">{settings.eventTitle}</h1>
        <h2 className="text-lg font-bold mt-1">Laporan Rekapitulasi Pendaftaran</h2>
        <p className="text-sm font-medium mt-1">Tanggal Cetak: {tgl}</p>
      </div>

      <div className="mb-6 space-y-4">
        <h3 className="text-lg font-bold border-b border-gray-300 pb-2">Status Kontingen & Pembayaran</h3>
        <table className="w-full text-sm border-collapse border border-gray-400">
          <thead>
            <tr className="bg-gray-100 text-center">
              <th className="border border-gray-400 p-2">No</th>
              <th className="border border-gray-400 p-2">Kontingen</th>
              <th className="border border-gray-400 p-2">Penanggung Jawab</th>
              <th className="border border-gray-400 p-2">Status Pembayaran</th>
              <th className="border border-gray-400 p-2">Total Atlet</th>
            </tr>
          </thead>
          <tbody>
            {contingents.filter(c => c.role === "kontingen").map((c, idx) => {
              const count = athletes.filter(a => a.kontingen === c.contingentName).length;
              return (
                <tr key={c.id}>
                  <td className="border border-gray-400 p-2 text-center">{idx + 1}</td>
                  <td className="border border-gray-400 p-2 font-bold">{c.contingentName}</td>
                  <td className="border border-gray-400 p-2">{c.pjName} ({c.nowa})</td>
                  <td className="border border-gray-400 p-2 text-center">{c.paymentStatus}</td>
                  <td className="border border-gray-400 p-2 text-center">{count}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="space-y-4" style={{ pageBreakBefore: 'always' }}>
        <h3 className="text-lg font-bold border-b border-gray-300 pb-2">Daftar Seluruh Atlet Terdaftar</h3>
        <table className="w-full text-xs border-collapse border border-gray-400">
          <thead>
            <tr className="bg-gray-100 text-center">
              <th className="border border-gray-400 p-1.5">No</th>
              <th className="border border-gray-400 p-1.5">Nama Atlet</th>
              <th className="border border-gray-400 p-1.5">Kontingen</th>
              <th className="border border-gray-400 p-1.5">L/P</th>
              <th className="border border-gray-400 p-1.5">Kategori & Kelas</th>
              <th className="border border-gray-400 p-1.5">Status ACC</th>
            </tr>
          </thead>
          <tbody>
            {athletes.map((a, idx) => (
              <tr key={a.id}>
                <td className="border border-gray-400 p-1.5 text-center">{idx + 1}</td>
                <td className="border border-gray-400 p-1.5 font-bold uppercase">{a.name}</td>
                <td className="border border-gray-400 p-1.5">{a.kontingen}</td>
                <td className="border border-gray-400 p-1.5 text-center">{a.jk === "Putra" ? "L" : "P"}</td>
                <td className="border border-gray-400 p-1.5">{a.kategori} - {a.kelas}</td>
                <td className="border border-gray-400 p-1.5 text-center">{a.isAcc ? "ACC" : "Belum"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <style>{`
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print-laporan { display: block !important; }
        }
      `}</style>
    </div>
  );
}
