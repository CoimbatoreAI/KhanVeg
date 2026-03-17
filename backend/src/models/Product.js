const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    unit: {
        type: String, // e.g., kg, unit, pack
        required: true
    },
    images: {
        type: [String], // Array of URLs
        required: true
    },
    shopType: {
        type: String,
        enum: ['vegetable', 'coffee'],
        required: true
    },
    category: {
        type: String, // e.g., leafy, root, beans
        required: false
    },
    inStock: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Product', productSchema);
