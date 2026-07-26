import React, { useState } from "react";
import { AlertTriangle } from "lucide-react";

interface DoubleConfirmModalProps {
  title: string;
  message: string;
  confirmWord: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DoubleConfirmModal({ title, message, confirmWord, onConfirm, onCancel }: DoubleConfirmModalProps) {
  const [input, setInput] = useState("");

  const isMatched = input === confirmWord;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center p-4 z-50 text-left">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-rose-100 shadow-2xl space-y-4 animate-scaleUp text-left">
        <div className="flex items-center gap-3 text-rose-600">
          <AlertTriangle size={28} />
          <h4 className="font-black text-slate-900 text-base uppercase tracking-tight">{title}</h4>
        </div>
        <p className="text-xs text-slate-600 font-semibold leading-relaxed whitespace-pre-line">
          {message}
        </p>
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 mt-2">
          <label className="text-[10px] text-rose-800 font-bold uppercase tracking-wider block mb-1">
            Ketik <span className="font-black text-rose-600">{confirmWord}</span> untuk melanjutkan:
          </label>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-rose-200 rounded-lg text-xs font-bold text-rose-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 text-center uppercase"
            placeholder={confirmWord}
          />
        </div>
        <div className="flex gap-2.5 pt-2">
          <button
            type="button"
            onClick={() => {
              if (isMatched) onConfirm();
            }}
            disabled={!isMatched}
            className={`flex-1 text-white text-xs font-black py-3 rounded-xl uppercase tracking-wider transition-colors cursor-pointer ${
              isMatched ? "bg-rose-600 hover:bg-rose-500" : "bg-slate-300 cursor-not-allowed"
            }`}
          >
            Hapus Permanen
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black py-3 rounded-xl uppercase tracking-wider transition-colors cursor-pointer"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
}
