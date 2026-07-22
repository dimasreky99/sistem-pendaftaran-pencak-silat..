import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
}

export default function LoadingOverlay({ isLoading, message = "Memproses Data..." }: LoadingOverlayProps) {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 10 }}
            className="bg-white rounded-2xl shadow-2xl p-6 flex flex-col items-center max-w-sm w-full border border-slate-100"
          >
            <div className="w-12 h-12 rounded-full border-4 border-slate-100 border-t-red-600 animate-spin mb-4" />
            <h3 className="text-slate-800 font-extrabold text-sm uppercase tracking-wide text-center">
              Harap Tunggu
            </h3>
            <p className="text-slate-500 text-xs font-semibold mt-1 text-center">
              {message}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
