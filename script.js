// script.js

const accessKey = "nvOU81wZrvbuBwDfbhxK4_Svcet4-jZKBBzRmjwdE3s";
const formEl = document.getElementById("search-form");
const inputEl = document.getElementById("search-input");
const searchResults = document.querySelector(".search-results");
const showMore = document.getElementById("show-more-button");

let page = 1;

function createDownloadButton(imageUrl) {
    const downloadButton = document.createElement("a");
    downloadButton.href = imageUrl;
    downloadButton.download = "image.jpg"; // Set the desired filename
    downloadButton.textContent = "Download"; // Button text

    return downloadButton;
}

async function searchImages() {
    const inputData = inputEl.value;
    const url = `https://api.unsplash.com/search/photos?page=${page}&query=${inputData}&client_id=${accessKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        const results = data.results;

        if (page === 1) {
            searchResults.innerHTML = "";
        }

        results.forEach((result) => {
            const imageWrapper = document.createElement("div");
            imageWrapper.classList.add("search-result");

            const image = document.createElement("img");
            image.src = result.urls.small;
            image.alt = result.alt_description;

            // Open the image in a new window when clicked
            image.addEventListener("click", () => {
                window.open(result.urls.regular, "_blank");
            });

            imageWrapper.appendChild(image);
            searchResults.appendChild(imageWrapper);
        });

        if (results.length > 0) {
            showMore.style.display = "block"; // Show "Show more" button if there are results
        } else {
            showMore.style.display = "none"; // Hide "Show more" button if no more results
        }
    } catch (error) {
        console.error("Error fetching images:", error);
    }
}

formEl.addEventListener("submit", (event) => {
    event.preventDefault();
    page = 1;
    searchImages();
});

inputEl.addEventListener("input", () => {
    if (inputEl.value.trim() === "") {
        searchResults.innerHTML = ""; // Clear search results when input is empty
        showMore.style.display = "none"; // Hide "Show more" button
    }
});

showMore.addEventListener("click", () => {
    page++; // Increment the page number
    searchImages();
});
