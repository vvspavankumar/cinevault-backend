// ================= BACKEND URL =================
const BASE_URL = "https://cinevault-backend-production-5ca5.up.railway.app";

// ================= ELEMENTS =================
const movieGrid = document.getElementById("movie-grid");
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const sectionTitle = document.getElementById("section-title");
const loader = document.getElementById("loader");

let currentPage = 1;
let currentSearchTerm = "";
let isLoading = false;
let hasMoreResults = true;
let allMovies = [];

// ================= INITIAL LOAD =================
document.addEventListener("DOMContentLoaded", () => {

    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");
    const navRight = document.getElementById("nav-right");

    if (movieGrid) {
        fetchMovies("movie");
        if (sectionTitle)
            sectionTitle.textContent = "🔥 Trending Now";
    }

    if (token && navRight) {
        navRight.innerHTML = `
            <span style="margin-right:15px; font-weight:600;">
                Welcome, ${username}
            </span>
            <button onclick="logoutUser()" class="logout-btn">
                Logout
            </button>
        `;
    }
});

// ================= FETCH MOVIES =================
async function fetchMovies(query) {

    if (!movieGrid) return;

    currentPage = 1;
    currentSearchTerm = query;
    hasMoreResults = true;
    movieGrid.innerHTML = "";
    if (loader) loader.style.display = "block";

    try {
        const response = await fetch(
            `${BASE_URL}/api/movies?search=${query}&page=${currentPage}`
        );

        const data = await response.json();

        if (data.Response === "True" && data.Search) {
            allMovies = data.Search;
            appendMovies(data.Search);
        } else {
            movieGrid.innerHTML = "<p>No movies found.</p>";
        }

    } catch {
        movieGrid.innerHTML = "<p>Server error.</p>";
    }

    if (loader) loader.style.display = "none";
}

// ================= APPEND MOVIES =================
function appendMovies(movies) {

    movieGrid.innerHTML = "";

    movies.forEach(movie => {
        if (movie.Poster === "N/A") return;

        const movieCard = document.createElement("div");
        movieCard.classList.add("movie-card");

        movieCard.innerHTML = `
            <img src="${movie.Poster}" alt="${movie.Title}">
            <h4>${movie.Title}</h4>
        `;

        movieCard.addEventListener("click", () => {
            showMovieDetails(movie.imdbID);
        });

        movieGrid.appendChild(movieCard);
    });
}

// ================= MOVIE DETAILS =================
function showMovieDetails(imdbId) {

    fetch(`${BASE_URL}/api/movie/${imdbId}`)
        .then(res => res.json())
        .then(movie => {

            fetch(`${BASE_URL}/api/reviews/${imdbId}`)
                .then(res => res.json())
                .then(reviews => {

                    const reviewsHTML = reviews.length > 0 ?
                        reviews.map(r => `
                            <div>
                                <strong>${r.rating}/5 ⭐</strong>
                                <p>${r.comment}</p>
                            </div>
                        `).join("")
                        :
                        "<p>No reviews yet</p>";

                    document.getElementById("review-content").innerHTML = `
                        <h2>${movie.Title}</h2>
                        <p>${movie.Plot}</p>
                        <h3>Reviews</h3>
                        ${reviewsHTML}
                        <button onclick="addReview('${imdbId}')">
                            Add Review
                        </button>
                    `;

                    document.getElementById("review-panel").classList.add("active");
                });
        });
}

// ================= ADD REVIEW =================
async function addReview(movieId) {

    const token = localStorage.getItem("token");

    if (!token) {
        alert("Please login to add review.");
        return;
    }

    const rating = prompt("Enter rating (1-5):");
    const comment = prompt("Enter comment:");

    await fetch(`${BASE_URL}/api/review`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ movieId, rating, comment })
    });

    alert("Review added!");
    showMovieDetails(movieId);
}

// ================= REGISTER =================
async function registerUser() {

    const username = document.getElementById("username")?.value.trim();
    const password = document.getElementById("password")?.value.trim();

    if (!username || !password) {
        alert("Please enter username and password");
        return;
    }

    try {
        const res = await fetch(`${BASE_URL}/api/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();

        if (res.ok) {
            alert("Registration successful! Please login.");
            window.location.href = "login.html";
        } else {
            alert(data.message || "Registration failed");
        }

    } catch {
        alert("Server error.");
    }
}

// ================= LOGIN =================
async function loginUser() {

    const username = document.getElementById("username")?.value.trim();
    const password = document.getElementById("password")?.value.trim();

    if (!username || !password) {
        alert("Please enter username and password");
        return;
    }

    try {
        const res = await fetch(`${BASE_URL}/api/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();

        if (res.ok && data.token) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("username", username);
            window.location.href = "/";
        } else {
            alert(data.message || "Login failed");
        }

    } catch {
        alert("Server error.");
    }
}

// ================= LOGOUT =================
function logoutUser() {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    window.location.href = "/";
}