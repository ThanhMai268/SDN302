const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    price: {
        type: Number, required: true, min: 0,
        validate: { validator: Number.isFinite, message: 'Price must be finite' }
    },
    category: { type: String, required: true, trim: true },
    stock: {
        type: Number, required: true, min: 0,
        validate: { validator: Number.isInteger, message: 'Stock must be an integer' }
    }
}, { collection: 'Products', timestamps: true });

module.exports = mongoose.model('Product', productSchema);
