import React from 'react';
import { Phone, MessageCircle } from 'lucide-react';

export function FloatingContactWidget() {
  return (
    <div className="fixed bottom-4 left-4 flex flex-col space-y-4 z-50">
      <a href="https://zalo.me/0909123456" target="_blank" rel="noreferrer" className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg transition-transform hover:scale-110 flex items-center justify-center w-12 h-12">
        <span className="font-bold text-lg">Z</span>
      </a>
      
      <a href="tel:0909123456" className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-full shadow-lg transition-transform hover:scale-110 flex items-center justify-center w-12 h-12 animate-shake">
        <Phone className="w-6 h-6" />
      </a>
    </div>
  );
}
