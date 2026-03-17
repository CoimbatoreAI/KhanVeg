const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        name: String,
        quantity: Number,
        price: Number,
        unit: String,
        image: String
    }],
    totalPrice: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'],
        default: 'Pending'
    },
    orderType: {
        type: String,
        enum: ['Dining', 'Takeaway', 'Delivery'],
        default: 'Delivery'
    },

    deliveryPartner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    shippingAddress: {
        type: String,
        required: false // Optional for Dining
    },
    customerPhone: String,
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Paid', 'Failed'],
        default: 'Pending'
    },
    paymentMethod: {
        type: String,
        // Match frontend: 'Cash on Delivery', 'Online Payment'
        // Also add 'Counter Payment' for dining maybe?
        default: 'Cash on Delivery'
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    },
    courierLocation: {
        lat: Number,
        lng: Number
    },
    verificationCode: {
        type: String,
        required: false
    }
}, { timestamps: true });

orderSchema.pre('save', function () {
    this.lastUpdated = Date.now();
});

module.exports = mongoose.model('Order', orderSchema);
