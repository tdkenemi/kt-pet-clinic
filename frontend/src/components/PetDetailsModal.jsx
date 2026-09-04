import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, PawPrint, Activity, Cpu, ZoomIn, Venus, Mars, HelpCircle, FileText, Edit2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const speciesEmoji = (s) => {
  const map = { 'Chó': '🐕', 'Mèo': '🐈', 'Thỏ': '🐇', 'Hamster': '🐹', 'Chim': '🐦' };
  return map[s] || '🐾';
};

export default function PetDetailsModal({ pet, isOpen, onClose }) {
  const [lightboxImg, setLightboxImg] = React.useState(null);
  
  const user = React.useMemo(() => {
    try { return JSON.parse(sessionStorage.getItem('user') || 'null'); }
    catch { return null; }
  }, []);
  const isAdmin = user?.role === 'admin';

  if (!isOpen || !pet) return null;

  return (
    <>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="relative bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] ring-1 ring-slate-200 dark:ring-white/10"
        >
          {/* Header Image */}
          <div className="relative h-48 overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 shrink-0">
            {pet.image ? (
              <>
                <img
                  src={pet.image}
                  alt={pet.name}
                  className="w-full h-full object-cover opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent" />
                <button
                  onClick={(e) => { e.stopPropagation(); setLightboxImg(pet.image); }}
                  className="absolute top-4 left-4 p-2 bg-black/40 hover:bg-black/60 rounded-xl text-white transition backdrop-blur-sm"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center opacity-30">
                <span className="text-8xl">{speciesEmoji(pet.species)}</span>
              </div>
            )}

            <div className="absolute top-4 right-4 flex items-center gap-2">
              {isAdmin && (
                <Link
                  to="/admin/pets"
                  onClick={onClose}
                  className="px-3 py-1.5 bg-brand-600/90 hover:bg-brand-500 rounded-xl text-white text-xs font-bold transition backdrop-blur-sm shadow-lg flex items-center gap-1"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Quản lý
                </Link>
              )}
              <button
                onClick={onClose}
                className="p-2 bg-black/40 hover:bg-black/60 rounded-xl text-white transition backdrop-blur-sm"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Pet Info Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 flex justify-between items-end">
              <div>
                <h2 className="text-2xl font-black text-white flex items-center gap-2">
                  {pet.name}
                </h2>
                <p className="text-slate-300 text-sm font-medium mt-1">
                  {pet.species}{pet.breed ? ` · ${pet.breed}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {pet.gender === 'male' && <span className="bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs px-2.5 py-1 rounded-xl font-bold flex items-center gap-1"><Mars className="w-3.5 h-3.5" /> Đực</span>}
                {pet.gender === 'female' && <span className="bg-pink-500/20 border border-pink-400/30 text-pink-200 text-xs px-2.5 py-1 rounded-xl font-bold flex items-center gap-1"><Venus className="w-3.5 h-3.5" /> Cái</span>}
              </div>
            </div>
          </div>

          <div className="p-6 overflow-y-auto custom-scrollbar space-y-6 bg-slate-50 dark:bg-[#0f1115]">
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl ring-1 ring-slate-200 dark:ring-white/5 flex flex-col">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Tuổi</span>
                <span className="text-sm font-bold text-slate-800 dark:text-white">{pet.age ? `${pet.age} năm` : 'Chưa cập nhật'}</span>
              </div>
              <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl ring-1 ring-slate-200 dark:ring-white/5 flex flex-col">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Cân nặng</span>
                <span className="text-sm font-bold text-slate-800 dark:text-white">{pet.weightKg ? `${pet.weightKg} kg` : 'Chưa cập nhật'}</span>
              </div>
              {pet.color && (
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl ring-1 ring-slate-200 dark:ring-white/5 flex flex-col">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Màu lông</span>
                  <span className="text-sm font-bold text-slate-800 dark:text-white">{pet.color}</span>
                </div>
              )}
              {pet.microchipId && (
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl ring-1 ring-slate-200 dark:ring-white/5 flex flex-col">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1"><Cpu className="w-3 h-3" /> Microchip</span>
                  <span className="text-sm font-bold text-slate-800 dark:text-white break-all">{pet.microchipId}</span>
                </div>
              )}
            </div>

            {/* Gallery */}
            {pet.gallery && pet.gallery.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
                  <PawPrint className="w-3.5 h-3.5" /> Album Ảnh
                </h4>
                <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                  {pet.gallery.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setLightboxImg(img)}
                      className="w-16 h-16 shrink-0 rounded-2xl overflow-hidden ring-1 ring-slate-200 dark:ring-white/10 hover:ring-brand-500 transition-all"
                    >
                      <img src={img} alt="Gallery" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Medical History */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> Bệnh án & Lưu ý
              </h4>
              <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl ring-1 ring-slate-200 dark:ring-white/5">
                {pet.medicalHistory && pet.medicalHistory.length > 0 ? (
                  <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                    {pet.medicalHistory.map((item, i) => (
                      <li key={i} className="flex gap-2">
                        <Activity className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm font-medium text-slate-400 italic">Chưa có ghi chú bệnh án.</p>
                )}
              </div>
            </div>
            
            {/* Owner Info if available */}
            {pet.ownerId && pet.ownerId.fullName && (
               <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-2xl ring-1 ring-blue-100 dark:ring-blue-500/20">
                 <p className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1">Thông tin chủ nuôi</p>
                 <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{pet.ownerId.fullName}</p>
                 <p className="text-xs text-slate-500 mt-0.5">{pet.ownerId.phone || pet.ownerId.email}</p>
               </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Lightbox for images inside modal */}
      <AnimatePresence>
        {lightboxImg && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setLightboxImg(null)}
              className="absolute inset-0 bg-black/90 cursor-zoom-out"
            />
            <motion.img
              initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}
              src={lightboxImg}
              alt="Zoom"
              className="relative z-[71] max-w-full max-h-full rounded-2xl object-contain"
              onClick={e => e.stopPropagation()}
            />
            <button
              onClick={() => setLightboxImg(null)}
              className="absolute top-4 right-4 z-[71] p-3 bg-white/10 hover:bg-white/20 rounded-xl text-white backdrop-blur-sm"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
