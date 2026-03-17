const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { verifyToken, isAdmin, isDeliveryPartner } = require('../middleware/authMiddleware');

router.get('/track/:id', orderController.getOrderTracking);
router.post('/', verifyToken, orderController.createOrder);
router.get('/my-orders', verifyToken, orderController.getMyOrders);
router.get('/all', [verifyToken, isAdmin], orderController.getAllOrders);
router.post('/assign', [verifyToken, isAdmin], orderController.assignOrder);
router.get('/assigned', [verifyToken, isDeliveryPartner], orderController.getAssignedJobs);
router.patch('/status', [verifyToken, isDeliveryPartner], orderController.updateStatus);

module.exports = router;
