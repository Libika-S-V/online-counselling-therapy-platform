const express = require('express');
const router = express.Router();
const {
  getNotifications, markAsRead, deleteNotification, broadcastNotification
} = require('../controllers/notificationController');
const verifyToken = require('../middleware/verifyToken');
const isAdmin = require('../middleware/isAdmin');

router.get('/', verifyToken, getNotifications);
router.put('/:notificationId/read', verifyToken, markAsRead);
router.delete('/:notificationId', verifyToken, deleteNotification);
router.post('/broadcast', verifyToken, isAdmin, broadcastNotification);

module.exports = router;
