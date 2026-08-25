const express = require('express');
const router = express.Router();
const {
  createAppointment, MyAppointments, getAllAppointments,
  updateAppointmentStatus, updateAppointment, deleteAppointment,
  cancelAppointment, confirmCashPayment, getRevenueStats,
  removeServiceFromAppointment, selectPaymentMethod
} = require('../controllers/appointmentController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.post('/',                          protect,       createAppointment);
router.get('/my-appointments',            protect,       MyAppointments);
router.get('/',                           protect, admin, getAllAppointments);
router.get('/revenue',                    protect, admin, getRevenueStats);
router.put('/:id/status',                 protect, admin, updateAppointmentStatus);
router.patch('/:id/cancel',              protect,       cancelAppointment);
router.patch('/:id/select-payment-method', protect,     selectPaymentMethod);
router.patch('/:id/cash-confirm',        protect, admin, confirmCashPayment);
router.patch('/:id/services/remove',     protect,       removeServiceFromAppointment);
router.put('/:id',                        protect,       updateAppointment);
router.delete('/:id',                     protect, admin, deleteAppointment);

module.exports = router;
