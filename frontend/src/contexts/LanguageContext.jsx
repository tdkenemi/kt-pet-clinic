import React, { createContext, useState, useContext } from 'react';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState('vi');
  const [currency, setCurrency] = useState('VND');

  const toggleLanguage = () => {
    if (lang === 'vi') {
      setLang('en');
      setCurrency('USD');
    } else {
      setLang('vi');
      setCurrency('VND');
    }
  };

  const t = (key) => {
    const translations = {
      vi: {
        home: 'Trang chủ',
        booking: 'Đặt lịch',
        my_appointments: 'Lịch của tôi',
        about: 'Giới thiệu',
        about_us: 'Giới thiệu',
        reviews: 'Đánh giá',
        blog: 'Blog',
        login: 'Đăng nhập',
        admin_portal: 'Quản Trị',
        logout: 'Đăng xuất',
        hero_title: 'Chăm sóc toàn diện cho thú cưng.',
        hero_subtitle: 'Đội ngũ bác sĩ tận tâm, cơ sở vật chất hiện đại, sẵn sàng hỗ trợ 24/7. Sức khỏe của thú cưng là ưu tiên hàng đầu.',
        book_now: 'Đặt lịch khám',
        learn_more: 'Tìm hiểu thêm',
        services_title: 'Mọi thứ thú cưng cần',
        services_subtitle: 'Dịch vụ chuyên nghiệp từ khám tổng quát đến phẫu thuật chuyên sâu.',
        ready_title: 'Sẵn sàng chăm sóc thú cưng?',
        ready_subtitle: 'Đặt lịch khám ngay hôm nay để nhận được sự tư vấn và chăm sóc tốt nhất.',
        back_to_public: 'Về Trang Chủ',
        dashboard: 'Tổng quan',
        appointments: 'Lịch hẹn',
        staff: 'Đội ngũ',
        customers: 'Khách hàng',
        pets: 'Thú cưng',
        medical_records: 'Bệnh án',
        settings: 'Cài đặt',
        search: 'Tìm kiếm...',
        notifications: 'Thông báo',
      },
      en: {
        home: 'Home',
        booking: 'Booking',
        my_appointments: 'My Appointments',
        about: 'About Us',
        about_us: 'About Us',
        reviews: 'Reviews',
        blog: 'Blog',
        login: 'Login',
        admin_portal: 'Admin',
        logout: 'Logout',
        hero_title: 'Comprehensive care for your pets.',
        hero_subtitle: 'Dedicated veterinary team, modern facilities, ready to assist 24/7. Your pet\'s health is our top priority.',
        book_now: 'Book Now',
        learn_more: 'Learn More',
        services_title: 'Everything your pet needs',
        services_subtitle: 'Professional services from general checkups to specialized surgeries.',
        ready_title: 'Ready to care for your pet?',
        ready_subtitle: 'Book an appointment today for the best care from our professional veterinary team.',
        back_to_public: 'Back to Site',
        dashboard: 'Dashboard',
        appointments: 'Appointments',
        staff: 'Medical Team',
        customers: 'Customers',
        pets: 'Pets',
        medical_records: 'Medical Records',
        settings: 'Settings',
        search: 'Search...',
        notifications: 'Notifications',
      }
    };
    return translations[lang][key] || key;
  };

  const formatCurrency = (amountVND) => {
    if (!amountVND && amountVND !== 0) return '—';
    if (currency === 'USD') {
      const amountUSD = amountVND / 24000;
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amountUSD);
    }
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amountVND);
  };

  return (
    <LanguageContext.Provider value={{ lang, currency, toggleLanguage, t, formatCurrency }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
