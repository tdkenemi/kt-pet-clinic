import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon bị mất do Vite build
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom marker icon dùng màu thương hiệu
const customIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

/**
 * MapEmbed — Component bản đồ OpenStreetMap tương tác
 * Props:
 *   lat, lng       — Tọa độ trung tâm (mặc định: Q1, TP.HCM)
 *   zoom           — Mức zoom mặc định (default: 16)
 *   height         — Chiều cao div bản đồ (default: '400px')
 *   address        — Địa chỉ hiển thị trong popup
 *   showDirections — Hiện nút "Chỉ đường" (default: true)
 */
export default function MapEmbed({
  lat = 10.7769,
  lng = 106.7009,
  zoom = 16,
  height = '400px',
  address = 'KT Pet Clinic — 123 Đường Y Tế, Phường Thú Cưng, Quận 1, TP.HCM',
  showDirections = true,
}) {
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-sm" style={{ height }}>
      <MapContainer
        center={[lat, lng]}
        zoom={zoom}
        style={{ width: '100%', height: '100%' }}
        zoomControl={true}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, lng]} icon={customIcon}>
          <Popup>
            <div className="text-sm font-medium" style={{ minWidth: '180px' }}>
              <p className="font-bold text-base text-slate-900 mb-1">🐾 KT Pet Clinic</p>
              <p className="text-slate-600 text-xs leading-relaxed">{address}</p>
              {showDirections && (
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 text-blue-600 font-semibold text-xs hover:underline"
                >
                  📍 Chỉ đường →
                </a>
              )}
            </div>
          </Popup>
        </Marker>
      </MapContainer>

      {/* Nút chỉ đường overlay */}
      {showDirections && (
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-4 right-4 z-[1000] flex items-center gap-2 bg-white shadow-lg text-slate-800 text-sm font-bold px-4 py-2.5 rounded-xl hover:bg-slate-50 transition border border-slate-200"
        >
          📍 Chỉ đường
        </a>
      )}
    </div>
  );
}
