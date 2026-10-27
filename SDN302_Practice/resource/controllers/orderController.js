const Order = require('../models/order');
const Customer = require('../models/customer');
const Product = require('../models/product');

const handleError = (res, error, message) => {
    if ([400, 404, 409].includes(error.status)) {
        return res.status(error.status).json({ message: error.message });
    }
    if (error.name === 'ValidationError' || error.name === 'CastError') {
        return res.status(400).json({ message: 'Invalid order data' });
    }
    if (error.code === 11000) {
        return res.status(409).json({ message: 'Order already exists' });
    }
    return res.status(500).json({ message });
};

const isValidId = value => typeof value === 'string' && /^[a-fA-F0-9]{24}$/.test(value);
const has = (object, field) => Object.prototype.hasOwnProperty.call(object, field);
const fail = (status, message) => {
    const error = new Error(message);
    error.status = status;
    throw error;
};

// Build only permitted fields; client prices and totals are never persisted.
const prepareOrder = async (body, existing = null) => {
    const editable = ['customer_id', 'items', 'payment_method', 'status', 'order_date'];
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
        fail(400, 'Request body must be a JSON object');
    }
    if (Object.keys(body).some(key => ![...editable, 'total_amount'].includes(key)) ||
        !editable.some(field => has(body, field))) {
        fail(400, 'Provide valid order fields');
    }

    const data = {};
    for (const field of ['payment_method', 'status']) {
        if (!existing || has(body, field)) {
            if (typeof body[field] !== 'string' || !body[field].trim()) {
                fail(400, `${field} must be a non-empty string`);
            }
            data[field] = body[field].trim();
        }
    }

    if (!existing || has(body, 'order_date')) {
        if (!has(body, 'order_date')) {
            data.order_date = new Date();
        } else {
            if (typeof body.order_date !== 'string' || !body.order_date.trim()) {
                fail(400, 'order_date must be a valid date string');
            }
            // Date parsing normalizes impossible days such as February 30.
            // Check the calendar date separately before accepting the timestamp.
            if (!/^\d{4}-\d{2}-\d{2}(?:$|T)/.test(body.order_date)) {
                fail(400, 'order_date must use YYYY-MM-DD or an ISO date-time');
            }
            const calendarDate = body.order_date.slice(0, 10);
            const parsedDate = new Date(`${calendarDate}T00:00:00.000Z`);
            if (Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== calendarDate) {
                fail(400, 'Invalid order_date');
            }
            data.order_date = new Date(body.order_date);
            if (Number.isNaN(data.order_date.getTime())) fail(400, 'Invalid order_date');
        }
    }

    const customerId = has(body, 'customer_id') ? body.customer_id : existing && String(existing.customer_id);
    if (!isValidId(customerId)) fail(400, 'Invalid customer_id');
    if (!await Customer.exists({ _id: customerId })) fail(404, 'Customer not found');
    if (!existing || has(body, 'customer_id')) data.customer_id = customerId;

    const itemsChanged = !existing || has(body, 'items');
    const items = itemsChanged ? body.items : existing.items;
    if (!Array.isArray(items) || items.length === 0) fail(400, 'items must be a non-empty array');

    const seen = new Set();
    const validatedItems = [];
    for (const item of items) {
        if (!item || typeof item !== 'object' || Array.isArray(item)) fail(400, 'Invalid order item');
        if (itemsChanged && Object.keys(item).some(key =>
            !['product_id', 'quantity', 'price_at_order', 'total'].includes(key))) {
            fail(400, 'Invalid order item fields');
        }
        const productId = itemsChanged ? item.product_id : String(item.product_id);
        if (!isValidId(productId)) fail(400, 'Invalid product_id');
        if (!Number.isSafeInteger(item.quantity) || item.quantity < 1) {
            fail(400, 'quantity must be a positive integer');
        }
        const key = productId.toLowerCase();
        if (seen.has(key)) fail(400, 'Duplicate products are not allowed');
        seen.add(key);
        validatedItems.push({ product_id: productId, quantity: item.quantity });
    }

    let totalAmount = 0;
    const calculatedItems = [];
    for (const item of validatedItems) {
        const product = await Product.findById(item.product_id);
        if (!product) fail(404, 'Product not found');
        if (!itemsChanged) continue; // Preserve historical prices on metadata-only updates.
        if (!Number.isFinite(product.stock) || item.quantity > product.stock) {
            fail(409, 'Requested quantity exceeds available stock');
        }
        if (!Number.isFinite(product.price) || product.price < 0) {
            fail(409, 'Product has an invalid stored price');
        }
        const total = item.quantity * product.price;
        totalAmount += total;
        if (!Number.isFinite(totalAmount)) fail(400, 'Order total exceeds the supported range');
        calculatedItems.push({ ...item, price_at_order: product.price, total });
    }
    if (itemsChanged) {
        data.items = calculatedItems;
        data.total_amount = totalAmount;
    }
    // Stock is checked when items change; it is not deducted or restored.
    return data;
};

// GET all orders
const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('customer_id')
            .populate('items.product_id');
        return res.status(200).json(orders);
    } catch (error) {
        return handleError(res, error, 'Error retrieving orders');
    }
};

// GET order by ID
const getOrderById = async (req, res) => {
    try {
        if (!isValidId(req.params.id)) {
            return res.status(400).json({ message: 'Invalid order ID' });
        }
        const order = await Order.findById(req.params.id)
            .populate('customer_id')
            .populate('items.product_id');
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        return res.status(200).json(order);
    } catch (error) {
        return handleError(res, error, 'Error retrieving order');
    }
};

// POST create an order using validated references and server-calculated totals
const createOrder = async (req, res) => {
    try {
        const data = await prepareOrder(req.body);
        const order = await Order.create(data);
        return res.status(201).json(order);
    } catch (error) {
        return handleError(res, error, 'Error creating order');
    }
};

// PUT update an order; preserve historical prices unless items are supplied
const updateOrderById = async (req, res) => {
    try {
        if (!isValidId(req.params.id)) {
            return res.status(400).json({ message: 'Invalid order ID' });
        }
        const existing = await Order.findById(req.params.id);
        if (!existing) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const data = await prepareOrder(req.body, existing);
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { $set: data },
            { new: true, runValidators: true }
        );
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        return res.status(200).json(order);
    } catch (error) {
        return handleError(res, error, 'Error updating order');
    }
};

// DELETE order by ID
const deleteOrderById = async (req, res) => {
    try {
        if (!isValidId(req.params.id)) {
            return res.status(400).json({ message: 'Invalid order ID' });
        }
        const order = await Order.findByIdAndDelete(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        return res.status(200).json({ message: 'Order deleted successfully' });
    } catch (error) {
        return handleError(res, error, 'Error deleting order');
    }
};

module.exports = {
    getAllOrders,
    getOrderById,
    createOrder,
    updateOrderById,
    deleteOrderById
};
