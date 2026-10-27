require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const app = express();

app.use(express.json());
app.use('/auth', require('./routes/authRoute'));
app.use('/api/products', require('./routes/productRoute'));
app.use('/api/orders', require('./routes/orderRoute'));

require('./models/customer');
require('./models/product');
require('./models/order');

app.get('/', async (req, res) => {
    try {
        res.send({ message: 'Welcome to Practical Exam!' });
    } catch (error) {
        res.send({ error: error.message });
    }
});


app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

app.use((error, req, res, next) => {
    if (error.type === 'entity.parse.failed') {
        return res.status(400).json({ message: 'Invalid JSON request body' });
    }
    if (error.code === 11000) {
        return res.status(409).json({ message: 'A record with this unique value already exists' });
    }
    if (error.name === 'ValidationError' || error.name === 'CastError') {
        return res.status(400).json({ message: 'Invalid request data' });
    }
    return res.status(500).json({ message: 'Internal server error' });
});

const start = async () => {
    await connectDB();
    const PORT = process.env.PORT || 9999;
    return app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

if (require.main === module) {
    start().catch(() => {
        console.error('Startup failed. Check database connectivity and configuration.');
        process.exitCode = 1;
    });
}

module.exports = { app, start };
