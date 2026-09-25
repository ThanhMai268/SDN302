const validateArticle = async (req, res, next) => {
    try {
        const { title, content, author, date } = req.body;

        if (!title || !content || !author || !date) {
            return res.status(400).json({ error: "Missing required article fields" });
        }

        next();
    } catch (error) {
        console.error(error);
        res.status(500).send('Error validating article');
    }
};

const validateDate = async (req, res, next) => {
    try {
        const date = req.body.date;
        if (date) {
            const pattern = /^\d{4}-\d{2}-\d{2}$/;
            if (!pattern.test(date)) {
                return res.status(400).json({ error: "Invalid date format. Must be YYYY-MM-DD" });
            }
        }
        next();
    } catch (error) {
        console.error(error);
        return res.status(500).send('Error validating date');
    }
}

const validateText = async (req, res, next) => {
    try {
        const { title, content, author } = req.body;
        if (content.length < 10) {
            return res.status(400).json({ error: "Content must be at least 10 characters long" });
        }
        if (title.length < 10) {
            return res.status(400).json({ error: "Title must be at least 10 characters long" });
        }
        if (author.length < 10) {
            return res.status(400).json({ error: "Author must be at least 10 characters long" });
        }
        next();
    } catch (error) {
        console.error(error);
        return res.status(500).send('Error validating text');
    }
}

module.exports = {
    validateArticle,
    validateDate,
    validateText
}