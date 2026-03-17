const Order = require('../models/Order');
const User = require('../models/User');
const sendEmail = require('../config/emailConfig');

exports.getOrderTracking = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('customer', 'name email phone')
            .populate('deliveryPartner', 'name phone');
        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.json(order);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createOrder = async (req, res, next) => {
    console.log('--- CREATE ORDER START ---');
    try {
        const { items, totalPrice, shippingAddress, customerPhone, paymentMethod } = req.body;
        // Generate a 4-digit verification code
        const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();

        const order = new Order({
            customer: req.userId,
            items,
            totalPrice,
            shippingAddress,
            customerPhone,
            paymentMethod,
            verificationCode
        });
        await order.save();

        // Fetch customer details for email
        const customer = await User.findById(req.userId);

        if (customer && customer.email) {
            const orderDetailsHTML = `
                <h2>Order Confirmation</h2>
                <p>Hello ${customer.name},</p>
                <p>Thank you for your order! Your order ID is <strong>${order._id}</strong>.</p>
                <h3>Order Summary:</h3>
                <ul>
                    ${items.map(item => `<li>${item.name} x ${item.quantity} - ₹${item.price * item.quantity}</li>`).join('')}
                </ul>
                <p><strong>Total Price: ₹${totalPrice}</strong></p>
                <p><strong>Shipping Address:</strong> ${shippingAddress}</p>
                <p><strong>Payment Method:</strong> ${paymentMethod}</p>
                <div style="background: #f0fdf4; padding: 20px; border-radius: 12px; border: 2px dashed #16a34a; margin-top: 20px;">
                    <p style="margin: 0; color: #16a34a; font-weight: 800; font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em;">Delivery Verification Code</p>
                    <h1 style="margin: 10px 0; font-size: 32px; letter-spacing: 0.5em; color: #064e3b;">${order.verificationCode}</h1>
                    <p style="margin: 0; color: #166534; font-size: 12px;">Share this code with our delivery partner only at the time of delivery.</p>
                </div>
                <p>We will notify you once your order is out for delivery.</p>
                <br>
                <p>Best regards,<br>Khan Vegetables Team</p>
            `;

            // Send email to customer
            await sendEmail(customer.email, 'Order Confirmation - Khan Vegetables', orderDetailsHTML);

            // Send email to owner
            const ownerEmailHTML = `
                <h2>New Order Received</h2>
                <p>A new order has been placed by ${customer.name} (${customer.email}).</p>
                <p><strong>Order ID:</strong> ${order._id}</p>
                <h3>Order Summary:</h3>
                <ul>
                    ${items.map(item => `<li>${item.name} x ${item.quantity} - ₹${item.price * item.quantity}</li>`).join('')}
                </ul>
                <p><strong>Total Price: ₹${totalPrice}</strong></p>
                <p><strong>Shipping Address:</strong> ${shippingAddress}</p>
                <p><strong>Phone:</strong> ${customerPhone}</p>
                <p><strong>Payment Method:</strong> ${paymentMethod}</p>
                <br>
                <p>Please process the order as soon as possible.</p>
            `;
            await sendEmail(process.env.EMAIL_USER, 'New Order Received - Khan Vegetables', ownerEmailHTML);
        }

        res.status(201).json({ message: 'Order placed successfully', order });
    } catch (err) {
        console.error('--- CREATE ORDER ERROR ---');
        console.error('Error Name:', err.name);
        console.error('Error Message:', err.message);
        console.error('Error Stack:', err.stack);
        console.error('---------------------------');
        res.status(500).json({ message: err.message });
    }
};

exports.getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ customer: req.userId }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Admin: Get all orders
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('customer', 'name email phone')
            .populate('deliveryPartner', 'name phone')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Admin: Assign order to delivery partner
exports.assignOrder = async (req, res) => {
    try {
        const { orderId, deliveryPartnerId } = req.body;
        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        order.deliveryPartner = deliveryPartnerId;
        order.status = 'Confirmed';
        await order.save();

        res.json({ message: 'Order assigned successfully', order });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Delivery Boy: Get assigned orders
exports.getAssignedJobs = async (req, res) => {
    try {
        const orders = await Order.find({ deliveryPartner: req.userId })
            .populate('customer', 'name email phone')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update order status (Both Admin and Delivery Boy)
exports.updateStatus = async (req, res) => {
    try {
        const { orderId, status, courierLocation, verificationCode } = req.body;
        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        // If status is being updated to Delivered, verify the code
        if (status === 'Delivered' && order.verificationCode) {
            if (!verificationCode) {
                return res.status(400).json({ message: 'Delivery verification code is required to complete this order.' });
            }
            if (verificationCode !== order.verificationCode) {
                return res.status(400).json({ message: 'Invalid verification code. Please ask the customer for the correct 4-digit code.' });
            }
        }

        if (status) order.status = status;
        if (courierLocation) order.courierLocation = courierLocation;

        await order.save();
        res.json({ message: 'Order status updated', order });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
