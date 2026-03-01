const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const movieRoutes = require("./routes/movies");
const authRoutes = require("./routes/auth");

const app = express();

// ✅ Always first
app.use(cors());
app.use(express.json());

// ✅ Serve static files
app.use(express.static(path.join(__dirname, "public")));

// ✅ API routes
app.use("/api", authRoutes);
app.use("/api", movieRoutes);

// ✅ Home route
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});