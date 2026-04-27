const PER_PAGE = 12;

/* ── DOM refs ── */
const heroInput     = document.getElementById("hero-search-input");
const navInput      = document.getElementById("nav-search-input");
const searchResults = document.getElementById("search-results");
const resultCount   = document.getElementById("result-count");
const queryLabel    = document.getElementById("query-label");
const sortSelect    = document.getElementById("sort-select");
const modal         = document.getElementById("modal");
const toast         = document.getElementById("toast");
const pagination    = document.getElementById("pagination");

let currentQuery = "nature";
let currentPage  = 1;
let totalPages   = 1;
let isLoading    = false;

/* ══════════════════════════
   TOAST
══════════════════════════ */
function showToast(msg, duration = 2200) {
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove("show"), duration);
}

/* ══════════════════════════
   SKELETON LOADERS
══════════════════════════ */
const SKEL_HEIGHTS = [220,300,180,340,260,200,310,190,280,230,200,290];
function showSkeletons() {
  searchResults.innerHTML = SKEL_HEIGHTS.map(h =>
    `<div class="skel" style="height:${h}px"></div>`
  ).join("");
  pagination.innerHTML = "";
}

/* ══════════════════════════
   FETCH IMAGES
══════════════════════════ */
async function searchImages() {
  if (isLoading) return;
  isLoading = true;

  const orderBy = sortSelect.value;
  // ✅ calls your server, key never exposed to browser
  const url = `/api/search?query=${encodeURIComponent(currentQuery)}&page=${currentPage}&order_by=${orderBy}`;

  try {
    const res     = await fetch(url);
    const data    = await res.json();
    const results = data.results || [];

    searchResults.innerHTML = "";
    resultCount.textContent = (data.total || 0).toLocaleString();
    queryLabel.textContent  = currentQuery;
    totalPages = Math.min(data.total_pages || 1, 50);

    if (results.length === 0) {
      searchResults.innerHTML = `<div class="empty-state"><i class="fa-regular fa-image"></i>No results for "${currentQuery}"</div>`;
      pagination.innerHTML = "";
      isLoading = false;
      return;
    }

    results.forEach((photo, i) => {
      const card = buildCard(photo, i);
      searchResults.appendChild(card);
    });

    buildPagination();
    searchResults.scrollIntoView({ behavior: "smooth", block: "start" });

  } catch (err) {
    console.error("Fetch error:", err);
    showToast("⚠  Network error — check API key");
    searchResults.innerHTML = `<div class="empty-state"><i class="fa-solid fa-triangle-exclamation"></i>Could not load images.</div>`;
  }

  isLoading = false;
}

/* ══════════════════════════
   BUILD IMAGE CARD
══════════════════════════ */
function buildCard(photo, i) {
  const card = document.createElement("div");
  card.className = "img-card";
  card.style.animationDelay = `${i * 45}ms`;

  const title       = photo.description || photo.alt_description || currentQuery;
  const name        = photo.user?.name || "Unsplash Contributor";
  const username    = photo.user?.username || "";
  const w           = photo.width  || "";
  const h           = photo.height || "";
  const dlUrl       = photo.links?.download || photo.urls?.full;
  const unsplashUrl = photo.links?.html || "#";

  card.innerHTML = `
    <img src="${photo.urls.small}" alt="${title}" loading="lazy">
    <div class="img-overlay"></div>
    <div class="img-actions">
      <div class="act act-fav" title="Favourite"><i class="fa-regular fa-heart"></i></div>
      <div class="act act-copy" title="Copy link" data-link="${unsplashUrl}"><i class="fa-regular fa-copy"></i></div>
      <a class="act" href="${dlUrl}" download="thapa-image.jpg" title="Download" target="_blank"><i class="fa-solid fa-arrow-down"></i></a>
    </div>
    <div class="img-meta">
      <div class="img-meta-name">${name}</div>
      <div class="img-meta-dim">${w} × ${h}</div>
    </div>`;

  card.querySelector("img").addEventListener("click", () => openModal(photo));
  card.querySelector(".act-fav").addEventListener("click", e => {
    e.stopPropagation();
    e.currentTarget.querySelector("i").className = "fa-solid fa-heart";
    e.currentTarget.style.color = "#e05555";
    showToast("❤  Added to favourites");
  });
  card.querySelector(".act-copy").addEventListener("click", e => {
    e.stopPropagation();
    navigator.clipboard?.writeText(e.currentTarget.dataset.link).catch(() => {});
    showToast("⎘  Link copied to clipboard");
  });

  return card;
}

/* ══════════════════════════
   PAGINATION
══════════════════════════ */
function buildPagination() {
  pagination.innerHTML = "";
  if (totalPages <= 1) return;

  const MAX_VISIBLE = 7;
  const prevBtn = makePageArrow("‹", currentPage === 1, () => goToPage(currentPage - 1));
  pagination.appendChild(prevBtn);

  const pages = getPaginationRange(currentPage, totalPages, MAX_VISIBLE);
  let lastPage = null;
  pages.forEach(p => {
    if (p === "...") {
      const el = document.createElement("span");
      el.className = "page-ellipsis";
      el.textContent = "…";
      pagination.appendChild(el);
    } else {
      const btn = document.createElement("button");
      btn.className = "page-btn" + (p === currentPage ? " active" : "");
      btn.textContent = p;
      btn.addEventListener("click", () => goToPage(p));
      pagination.appendChild(btn);
      lastPage = p;
    }
  });

  const nextBtn = makePageArrow("›", currentPage === totalPages, () => goToPage(currentPage + 1));
  pagination.appendChild(nextBtn);
}

function makePageArrow(label, disabled, onClick) {
  const btn = document.createElement("button");
  btn.className = "page-arrow";
  btn.textContent = label;
  btn.disabled = disabled;
  if (!disabled) btn.addEventListener("click", onClick);
  return btn;
}

function getPaginationRange(current, total, maxVisible) {
  if (total <= maxVisible) return Array.from({length: total}, (_, i) => i + 1);

  const half  = Math.floor((maxVisible - 3) / 2);
  const pages = [];

  if (current <= half + 2) {
    for (let i = 1; i <= maxVisible - 2; i++) pages.push(i);
    pages.push("..."); pages.push(total);
  } else if (current >= total - half - 1) {
    pages.push(1); pages.push("...");
    for (let i = total - (maxVisible - 3); i <= total; i++) pages.push(i);
  } else {
    pages.push(1); pages.push("...");
    for (let i = current - half; i <= current + half; i++) pages.push(i);
    pages.push("..."); pages.push(total);
  }

  return pages;
}

function goToPage(page) {
  if (page < 1 || page > totalPages || page === currentPage) return;
  currentPage = page;
  showSkeletons();
  searchImages();
}

/* ══════════════════════════
   MODAL
══════════════════════════ */
function openModal(photo) {
  const title    = photo.description || photo.alt_description || "Untitled";
  const name     = photo.user?.name || "Unknown";
  const username = photo.user?.username || "";
  const w        = photo.width  || "—";
  const h        = photo.height || "—";
  const tags     = (photo.tags || []).slice(0, 6).map(t => t.title).filter(Boolean);

  document.getElementById("modal-img").src = photo.urls.regular || photo.urls.small;
  document.getElementById("modal-title").textContent = title.charAt(0).toUpperCase() + title.slice(1);
  document.getElementById("modal-by").innerHTML = `Photo by <strong>${name}</strong>${username ? ` @${username}` : ""}`;
  document.getElementById("modal-stats").innerHTML = `
    <div class="modal-stat"><span>Dimensions</span><span>${w} × ${h}</span></div>
    <div class="modal-stat"><span>Likes</span><span>${(photo.likes||0).toLocaleString()}</span></div>`;
  document.getElementById("modal-tags").innerHTML = (tags.length ? tags : ["free","editorial","high-res","unsplash"])
    .map(t => `<span class="modal-tag">${t}</span>`).join("");

  const dlUrl = photo.links?.download || photo.urls?.full;
  document.getElementById("modal-dl").onclick       = () => { window.open(dlUrl, "_blank"); showToast("↓  Download started"); };
  document.getElementById("modal-open-btn").onclick = () => { window.open(photo.links?.html || "#", "_blank"); };

  modal.classList.add("open");
}

/* ══════════════════════════
   SEARCH TRIGGER
══════════════════════════ */
function doSearch(q) {
  q = (q || "").trim();
  if (!q) return;
  currentQuery    = q;
  currentPage     = 1;
  heroInput.value = q;
  navInput.value  = q;
  showSkeletons();
  searchImages();
}

/* ══════════════════════════
   EVENT LISTENERS
══════════════════════════ */
document.getElementById("hero-search-btn").addEventListener("click", () => doSearch(heroInput.value));

heroInput.addEventListener("keydown", e => {
  if (e.key === "Enter")  doSearch(heroInput.value);
  if (e.key === "Escape") heroInput.blur();
});

navInput.addEventListener("keydown", e => {
  if (e.key === "Enter") doSearch(navInput.value);
});

document.querySelectorAll(".chip").forEach(chip => {
  chip.addEventListener("click", () => {
    document.querySelectorAll(".chip").forEach(c => c.classList.remove("active"));
    chip.classList.add("active");
    doSearch(chip.dataset.q);
  });
});

const RANDOM_TOPICS = [
  "milky way","rainy streets","minimalist interior","bioluminescent ocean",
  "mountain fog","cherry blossoms","brutalist buildings","desert dunes",
  "underwater world","autumn forest","neon signs","glacier ice"
];
document.getElementById("random-btn").addEventListener("click", () => {
  const q = RANDOM_TOPICS[Math.floor(Math.random() * RANDOM_TOPICS.length)];
  doSearch(q);
  showToast(`⚄  Random: ${q}`);
});

sortSelect.addEventListener("change", () => { currentPage = 1; searchImages(); });

modal.addEventListener("click", e => { if (e.target === modal) modal.classList.remove("open"); });
document.getElementById("modal-close").addEventListener("click", () => modal.classList.remove("open"));

document.getElementById("theme-toggle-btn").addEventListener("click", () => {
  document.body.classList.toggle("light");
  showToast(document.body.classList.contains("light") ? "☀  Light mode" : "◐  Dark mode");
});

let shortcutsVisible = false;
document.getElementById("shortcut-toggle-btn").addEventListener("click", () => {
  shortcutsVisible = !shortcutsVisible;
  document.getElementById("shortcuts-panel").classList.toggle("open", shortcutsVisible);
});

document.addEventListener("keydown", e => {
  const inInput = ["INPUT","TEXTAREA"].includes(document.activeElement.tagName);
  if (e.key === "/" && !inInput)  { e.preventDefault(); heroInput.focus(); }
  if (e.key === "Escape") {
    modal.classList.remove("open");
    document.getElementById("shortcuts-panel").classList.remove("open");
    shortcutsVisible = false;
  }
  if ((e.key === "r" || e.key === "R") && !inInput) document.getElementById("random-btn").click();
});

/* ══════════════════════════
   INIT
══════════════════════════ */
showSkeletons();
searchImages();