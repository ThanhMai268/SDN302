const Product = require('../models/product');
const Order = require('../models/order');

const fields = ['name', 'price', 'category', 'stock'];

const handleError = (res, error, message) => {
    if (error.name === 'ValidationError' || error.name === 'CastError') {
        return res.status(400).json({ message: 'Invalid product data' });
    }
    if (error.code === 11000) {
        return res.status(409).json({ message: 'Product already exists' });
    }
    return res.status(500).json({ message });
};

const validateProduct = (body, isUpdate = false) => {
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
        return 'Request body must be a JSON object';
    }
    const keys = Object.keys(body);
    if (keys.length === 0 || keys.some(key => !fields.includes(key))) {
        return 'Provide only name, price, category and stock';
    }
    for (const field of fields) {
        if (!Object.prototype.hasOwnProperty.call(body, field)) {
            if (!isUpdate) return `${field} is required`;
            continue;
        }
        const value = body[field];
        if (field === 'name' || field === 'category') {
            if (typeof value !== 'string' || !value.trim()) {
                return `${field} must be a non-empty string`;
            }
        } else if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
            return `${field} must be a finite number greater than or equal to 0`;
        } else if (field === 'stock' && !Number.isInteger(value)) {
            return 'stock must be an integer';
        }
    }
    return null;
};

// GET all products
const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find();
        return res.status(200).json(products);
    } catch (error) {
        return handleError(res, error, 'Error retrieving products');
    }
};

// GET product by ID
const getProductById = async (req, res) => {
    try {
        if (!/^[a-fA-F0-9]{24}$/.test(req.params.id)) {
            return res.status(400).json({ message: 'Invalid product ID' });
        }
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        return res.status(200).json(product);
    } catch (error) {
        return handleError(res, error, 'Error retrieving product');
    }
};

// POST create a product
const createProduct = async (req, res) => {
    try {
        const message = validateProduct(req.body);
        if (message) {
            return res.status(400).json({ message });
        }
        const product = await Product.create(req.body);
        return res.status(201).json(product);
    } catch (error) {
        return handleError(res, error, 'Error creating product');
    }
};

// PUT update a product by ID
const updateProductById = async (req, res) => {
    try {
        if (!/^[a-fA-F0-9]{24}$/.test(req.params.id)) {
            return res.status(400).json({ message: 'Invalid product ID' });
        }
        const message = validateProduct(req.body, true);
        if (message) {
            return res.status(400).json({ message });
        }
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        );
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        return res.status(200).json(product);
    } catch (error) {
        return handleError(res, error, 'Error updating product');
    }
};

// DELETE a product only when no order references it
const deleteProductById = async (req, res) => {
    try {
        if (!/^[a-fA-F0-9]{24}$/.test(req.params.id)) {
            return res.status(400).json({ message: 'Invalid product ID' });
        }
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const referenced = await Order.exists({ 'items.product_id': product._id });
        if (referenced) {
            return res.status(409).json({ message: 'Product is referenced by an order and cannot be deleted' });
        }
        const deleted = await Product.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ message: 'Product not found' });
        }
        return res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        return handleError(res, error, 'Error deleting product');
    }
};

module.exports = {
    getAllProducts,
    getProductById,
    createProduct,
    updateProductById,
    deleteProductById
};
