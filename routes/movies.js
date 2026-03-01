const express = require("express");
const axios = require("axios");
const db = require("../db");
const auth = require("../middleware/auth");
require("dotenv").config();

const router = express.Router();

// 🔥 Search Movies (With Pagination)
router.get("/movies", async (req, res) => {
    const { search, page = 1 } = req.query;

    if (!search) {
        return res.status(400).json({ message: "Search query required" });
    }

    try {
        const response = await axios.get("https://www.omdbapi.com/", {
            params: {
                s: search,
                page,
                apikey: process.env.OMDB_API_KEY
            }
        });

        res.json(response.data);

    } catch (error) {
        res.status(500).json({ message: "Error fetching movies" });
    }
});

// 🔥 Get Movie Details
router.get("/movie/:id", async (req, res) => {
    try {
        const response = await axios.get("https://www.omdbapi.com/", {
            params: {
                i: req.params.id,
                plot: "full",
                apikey: process.env.OMDB_API_KEY
            }
        });

        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: "Error fetching movie details" });
    }
});

// 🔥 Get Reviews
router.get("/reviews/:movieId", (req, res) => {
    db.query(
        "SELECT * FROM reviews WHERE movie_id = ?",
        [req.params.movieId],
        (err, results) => {
            if (err) return res.status(500).json(err);
            res.json(results);
        }
    );
});

// 🔥 Add Review (Protected)
router.post("/review", auth, (req, res) => {
    const { movieId, rating, comment } = req.body;

    db.query(
        "INSERT INTO reviews (movie_id, rating, comment, user_id) VALUES (?, ?, ?, ?)",
        [movieId, rating, comment, req.user.id],
        (err) => {
            if (err) return res.status(500).json(err);
            res.json({ message: "Review added successfully" });
        }
    );
});

// 🔥 Delete Review (Protected)
router.delete("/review/:id", auth, (req, res) => {
    db.query(
        "DELETE FROM reviews WHERE id = ? AND user_id = ?",
        [req.params.id, req.user.id],
        (err) => {
            if (err) return res.status(500).json(err);
            res.json({ message: "Review deleted" });
        }
    );
});

// 🔥 Add Favorite (Protected)
router.post("/favorite", auth, (req, res) => {
    const { movieId } = req.body;

    db.query(
        "INSERT INTO favorites (user_id, movie_id) VALUES (?, ?)",
        [req.user.id, movieId],
        (err) => {
            if (err) return res.status(500).json(err);
            res.json({ message: "Added to favorites" });
        }
    );
});

// 🔥 Get Favorites (Protected)
router.get("/favorites", auth, async (req, res) => {
    db.query(
        "SELECT movie_id FROM favorites WHERE user_id = ?",
        [req.user.id],
        async (err, results) => {
            if (err) return res.status(500).json(err);

            try {
                const movies = await Promise.all(
                    results.map(fav =>
                        axios.get("https://www.omdbapi.com/", {
                            params: {
                                i: fav.movie_id,
                                apikey: process.env.OMDB_API_KEY
                            }
                        })
                    )
                );

                res.json(movies.map(m => m.data));
            } catch (error) {
                res.status(500).json({ message: "Error fetching favorite details" });
            }
        }
    );
});

module.exports = router;