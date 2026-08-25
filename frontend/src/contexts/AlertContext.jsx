import React, { createContext, useContext, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, MessageSquare, Bell } from 'lucide-react';

const AlertContext = createContext();

export const useAlert = () => {
  return useContext(AlertContext);
};

export const AlertProvider = ({ children }) => {
  const [alertInfo, setAlertInfo] = useState({ 
    isOpen: false, 
    title: '', 
    message: '', 
    type: 'info', 
    isConfirm: false, 
    onConfirm: null 
  });

  const showAlert = (title, message, type = 'info') => {
    setAlertInfo({ isOpen: true, title, message, type, isConfirm: false, onConfirm: null });
  };

  const showConfirm = (title, message, onConfirm) => {
    setAlertInfo({ isOpen: true, title, message, type: 'warning', isConfirm: true, onConfirm });
  };

  const closeAlert = () => {
    setAlertInfo(prev => ({ ...prev, isOpen: false }));
  };

  const handleConfirm = () => {
    closeAlert();
    if (alertInfo.onConfirm) alertInfo.onConfirm();
  };

  return (
    <AlertContext.Provider value={{ showAlert, showConfirm }}>
      {children}

      <AnimatePresence>
        {alertInfo.isOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-6 w-full max-w-sm text-center shadow-2xl relative overflow-hidden"
            >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 
                ${alertInfo.type === 'success' ? 'bg-emerald-100 text-emerald-600' : 
                  alertInfo.type === 'error' ? 'bg-red-100 text-red-600' : 
                  alertInfo.type === 'warning' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                {alertInfo.type === 'success' ? <CheckCircle className="w-7 h-7" /> : 
                 alertInfo.type === 'error' ? <XCircle className="w-7 h-7" /> : 
                 alertInfo.type === 'warning' ? <MessageSquare className="w-7 h-7" /> : <Bell className="w-7 h-7" />}
              </div>
              <h3 className="font-bold text-xl text-slate-900 mb-2">{alertInfo.title}</h3>
              <p className="text-sm text-slate-600 mb-6">{alertInfo.message}</p>

              <div className="flex gap-3">
                {alertInfo.isConfirm && (
                  <button onClick={closeAlert} className="btn-secondary flex-1 py-3 text-sm">
                    Hủy
                  </button>
                )}
                <button 
                  onClick={handleConfirm} 
                  className={`btn-primary flex-1 py-3 text-sm ${alertInfo.type === 'warning' ? 'bg-blue-600 border-blue-600 hover:bg-blue-700' : ''}`}
                >
                  {alertInfo.isConfirm ? 'Xác nhận' : 'Đã hiểu'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AlertContext.Provider>
  );
};
