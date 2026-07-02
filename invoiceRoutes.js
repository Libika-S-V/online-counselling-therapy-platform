const express = require('express');
const router = express.Router();
const {
  getInvoiceByAppointment, downloadInvoicePDF, getMyInvoices
} = require('../controllers/invoiceController');
const verifyToken = require('../middleware/verifyToken');

router.get('/my', verifyToken, getMyInvoices);
router.get('/appointment/:appointmentId', verifyToken, getInvoiceByAppointment);
router.get('/:invoiceId/pdf', verifyToken, downloadInvoicePDF);

module.exports = router;
