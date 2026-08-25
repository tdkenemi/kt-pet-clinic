import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import axios from 'axios';
import App from './App.jsx';
import '@fontsource/geist-sans';
import './index.css';
import { LanguageProvider } from './contexts/LanguageContext.jsx';
import { AlertProvider } from './contexts/AlertContext.jsx';
import { ThemeProvider } from './contexts/ThemeContext.jsx';
import { BookingProvider } from './contexts/BookingContext.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';

// Pages
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Booking from './pages/Booking.jsx';
import MyAppointments from './pages/MyAppointments.jsx';
import Reviews from './pages/Reviews.jsx';
import Blog from './pages/Blog.jsx';
import MyProfile from './pages/MyProfile.jsx';
import MyPets from './pages/MyPets.jsx';
import AdminLayout from './pages/admin/AdminLayout.jsx';
import Dashboard from './pages/admin/Dashboard.jsx';
import AdminAppointments from './pages/admin/AdminAppointments.jsx';
import Customers from './pages/admin/Customers.jsx';
import Pets from './pages/admin/Pets.jsx';
import Staffs from './pages/admin/Staffs.jsx';
import AdminRoster from './pages/admin/AdminRoster.jsx';
import AdminBlogs from './pages/admin/AdminBlogs.jsx';
import Services from './pages/admin/Services.jsx';
import Revenue from './pages/admin/Revenue.jsx';
import MedicalRecords from './pages/admin/MedicalRecords.jsx';
import Settings from './pages/admin/Settings.jsx';
import PaymentHistory from './pages/admin/PaymentHistory.jsx';
import PaymentReturn from './pages/PaymentReturn.jsx';
import AboutUs from './pages/AboutUs.jsx';

axios.defaults.baseURL = import.meta.env.VITE_API_URL || '';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "638672395650-69rl0cqvtfkcjrlfo26mposo3shb553v.apps.googleusercontent.com";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <LanguageProvider>
        <ThemeProvider>
          <AlertProvider>
            <BookingProvider>
              <BrowserRouter>
                <ErrorBoundary>
                  <Routes>
                    <Route path="/" element={<App />}>
                      <Route index element={<Home />} />
                      <Route path="about" element={<AboutUs />} />
                      <Route path="reviews" element={<Reviews />} />
                      <Route path="blog" element={<Blog />} />
                      <Route path="login" element={<Login />} />
                      <Route path="booking" element={<Booking />} />
                      <Route path="my-appointments" element={<MyAppointments />} />
                      <Route path="payment-return" element={<PaymentReturn />} />
                      <Route path="profile" element={<MyProfile />} />
                      {/* /my-pets quản lý thú cưng của user */}
                      <Route path="my-pets" element={<MyPets />} />
                    </Route>
                    
                    <Route path="/admin" element={<AdminLayout />}>
                      <Route index element={<Dashboard />} />
                      <Route path="appointments" element={<AdminAppointments />} />
                      <Route path="customers" element={<Customers />} />
                      <Route path="pets" element={<Pets />} />
                      <Route path="staffs" element={<Staffs />} />
                      <Route path="roster" element={<AdminRoster />} />
                      <Route path="blogs" element={<AdminBlogs />} />
                      <Route path="services" element={<Services />} />
                      <Route path="revenue" element={<Revenue />} />
                      <Route path="transactions" element={<PaymentHistory />} />
                      <Route path="medical-records" element={<MedicalRecords />} />
                      <Route path="settings" element={<Settings />} />
                    </Route>
                  </Routes>
                </ErrorBoundary>
              </BrowserRouter>
            </BookingProvider>
          </AlertProvider>
        </ThemeProvider>
      </LanguageProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>,
)
