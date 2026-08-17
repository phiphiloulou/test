const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Health check
app.get("/", (req, res) => {
    res.json({
        status: "ok",
        message: "Express API is running"
    });
});

// GET web service
app.get("/api/hello", (req, res) => {
    const name = req.query.name || "World";

    res.json({
        message: `Hello ${name}!`
    });
});

// POST web service
app.post("/api/users", (req, res) => {
    const { name, email } = req.body;

    if (!name || !email) {
        return res.status(400).json({
            error: "name and email are required"
        });
    }

    res.status(201).json({
        id: Date.now(),
        name,
        email
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
