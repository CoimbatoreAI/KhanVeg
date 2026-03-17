const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

router.post('/register', (req, res, next) => { req.body.role = 'customer'; next(); }, authController.register);
router.post('/login', authController.login);
router.get('/profile', verifyToken, authController.getProfile);
router.put('/profile', verifyToken, authController.updateProfile);
router.get('/delivery-boys', verifyToken, isAdmin, authController.getDeliveryBoys);
router.post('/staff', verifyToken, isAdmin, authController.createStaff);
router.delete('/staff/:staffId', verifyToken, isAdmin, authController.deleteStaff);
router.post('/adminLogin', authController.adminLogin);

module.exports = router;
