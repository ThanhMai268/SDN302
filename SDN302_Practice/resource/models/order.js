const mongoose = require('mongoose');

const amountField = () => ({
    type: Number, required: true, min: 0,
    validate: { validator: Number.isFinite, message: 'Amount must be finite' }
});

const orderItemSchema = new mongoose.Schema({
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: {
        type: Number, required: true, min: 1,
        validate: { validator: Number.isInteger, message: 'Quantity must be a positive integer' }
    },
    price_at_order: amountField(),
    total: amountField()
}, { _id: false });

const orderSchema = new mongoose.Schema({
    customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    items: {
        type: [orderItemSchema], required: true,
        validate: { validator: items => items.length > 0, message: 'Order must contain at least one item' }
    },
    total_amount: amountField(),
    payment_method: { type: String, required: true, trim: true },
    status: { type: String, required: true, trim: true },
    order_date: { type: Date, required: true, default: Date.now }
}, { collection: 'Orders', timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
