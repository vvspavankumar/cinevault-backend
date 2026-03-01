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

    // Handle navbar login display
   // Always load movies
fetchMovies("movie");
sectionTitle.textContent = "🔥 Trending Now";

// Only change navbar if logged in
if (token) {
    navRight.innerHTML = `
        <span style="margin-right:15px; font-weight:600;">
            Welcome, ${username}
        </span>
        <button onclick="logoutUser()" class="logout-btn">
            Logout
        </button>
    `;
}

    // Review panel close logic
    const closeBtn = document.getElementById("close-panel");
    const overlay = document.getElementById("overlay-blur");

    if (closeBtn && overlay) {
        closeBtn.addEventListener("click", closePanel);
        overlay.addEventListener("click", closePanel);
    }
});

function closePanel() {
    document.getElementById("review-panel").classList.remove("active");
    document.getElementById("overlay-blur").classList.remove("active");
}

// ================= SEARCH =================
searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const searchTerm = searchInput.value.trim();
    if (searchTerm) {
        fetchMovies(searchTerm);
        sectionTitle.textContent = `Search Results for: "${searchTerm}"`;
    }
});

// ================= FETCH MOVIES =================
async function fetchMovies(query) {
    currentPage = 1;
    currentSearchTerm = query;
    hasMoreResults = true;

    movieGrid.innerHTML = "";
    loader.style.display = "block";

    try {
        const response = await fetch(
    `/api/movies?search=${query}&page=${currentPage}`
);

        const data = await response.json();

        if (data.Response === "True" && data.Search) {
            allMovies = data.Search;
            appendMovies(data.Search);

            if (data.Search.length < 10) {
                hasMoreResults = false;
                showNoMoreMessage();
            }
        } else {
            movieGrid.innerHTML = "<p>No movies found.</p>";
            hasMoreResults = false;
        }
    } catch {
        movieGrid.innerHTML = "<p>Server error.</p>";
        hasMoreResults = false;
    }

    loader.style.display = "none";
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

// ================= CATEGORY FILTER =================
function filterCategory(category, event) {

    // Highlight active button
    document.querySelectorAll(".cat-btn")
        .forEach(btn => btn.classList.remove("active"));

    if (event) event.target.classList.add("active");

    // Call API search using category
    fetchMovies(category);

    sectionTitle.textContent = `Search Results for: "${category}"`;

    // Scroll to movies section smoothly
    window.scrollTo({
        top: document.querySelector(".container").offsetTop - 50,
        behavior: "smooth"
    });
}

// ================= INFINITE SCROLL =================
async function nextPage() {
    if (isLoading || !hasMoreResults) return;

    isLoading = true;
    currentPage++;
    loader.style.display = "block";

    try {
      const res = await fetch(
    `/api/movies?search=${currentSearchTerm}&page=${currentPage}`
);

        const data = await res.json();

        if (data.Response === "True" && data.Search) {
            appendMovies([...allMovies, ...data.Search]);
            allMovies = [...allMovies, ...data.Search];

            if (data.Search.length < 10) {
                hasMoreResults = false;
                showNoMoreMessage();
            }
        } else {
            hasMoreResults = false;
        }
    } catch {
        console.log("Error loading next page");
    }

    loader.style.display = "none";
    isLoading = false;
}

window.addEventListener("scroll", () => {
    if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 200
    ) {
        nextPage();
    }
});

function showNoMoreMessage() {
    const message = document.createElement("p");
    message.textContent = "🎬 No more movies to load";
    message.style.textAlign = "center";
    message.style.margin = "20px";
    message.style.opacity = "0.7";
    movieGrid.appendChild(message);
}

// ================= MOVIE DETAILS =================
function showMovieDetails(imdbId) {

    fetch(`/api/movie/${imdbId}`)
        .then(res => res.json())
        .then(movie => {

            fetch(`/api/reviews/${imdbId}`)
                .then(res => res.json())
                .then(reviews => {

                    const reviewsHTML = reviews.length > 0 ?
                        reviews.map(r => `
                            <div class="review-item">
                                <strong>${r.rating}/5 ⭐</strong>
                                <p>${r.comment}</p>
                            </div>
                        `).join("")
                        :
                        "<p>No reviews yet</p>";

                    document.getElementById("review-content").innerHTML = `
                        <div class="movie-top-section">
                            <img src="${movie.Poster}" class="movie-poster-large"/>
                            <div class="movie-info-side">
                                <h2>${movie.Title}</h2>
                                <div class="rating-box">⭐ ${movie.imdbRating}</div>
                            </div>
                        </div>
                        <div class="movie-plot">
                            <p>${movie.Plot}</p>
                        </div>
                        <h3>Reviews</h3>
                        ${reviewsHTML}
                        <button onclick="addReview('${imdbId}')" 
                                class="add-review-btn">
                            Add Review
                        </button>
                    `;

                    document.getElementById("review-panel").classList.add("active");
                    document.getElementById("overlay-blur").classList.add("active");
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

    await fetch("/api/review", {
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

// ================= AUTH =================
async function loginUser() {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !password) {
        alert("Please enter username and password");
        return;
    }

    try {
        const res = await fetch("/api/login", {
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

function logoutUser() {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    window.location.href = "/";
}
document.addEventListener("click", function (e) {
    if (e.target.id === "close-panel" || 
        e.target.id === "overlay-blur") {

        document.getElementById("review-panel")
            .classList.remove("active");

        document.getElementById("overlay-blur")
            .classList.remove("active");
    }
});