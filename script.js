let currentData = {};
let currentLang = "en";
try {
  currentLang = localStorage.getItem("shopLang") || "en";
} catch (e) {
  console.warn("Local Storage access denied");
}

let currentTheme = "system";
try {
  currentTheme = localStorage.getItem("shopTheme") || "system";
} catch (e) {}

document.addEventListener("DOMContentLoaded", () => {
  initTheme();

  const langSelect = document.getElementById("langSelect");
  if (langSelect) langSelect.value = currentLang;

  loadLanguage(currentLang);

  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", handleSearch);
  }
});

async function loadLanguage(langCode) {
  try {
    const cacheBuster = new Date().getTime();
    const response = await fetch(`lang/${langCode}.json?v=${cacheBuster}`);

    if (!response.ok) {
      throw new Error(`File not found: lang/${langCode}.json`);
    }

    currentData = await response.json();
    currentLang = langCode;
    try {
      localStorage.setItem("shopLang", langCode);
    } catch (e) {}

    renderAllContent();
  } catch (error) {
    console.error("Error loading language:", error);
    showErrorOnScreen(`System Error: ${error.message}. Please refresh.`);
  }
}

function showErrorOnScreen(msg) {
  const app = document.getElementById("app");
  app.innerHTML = `
        <div style="background:#ffebee; color:#c62828; padding:20px; text-align:center; border-radius:10px; margin:20px;">
            <h3>⚠️ User Alert</h3>
            <p>${msg}</p>
        </div>
    `;
}
function renderAllContent() {
  const headerContent = document.getElementById("header-content");
  if (headerContent) {
    headerContent.innerHTML = `
            <h1><i class="fa-solid fa-store"></i> ${currentData.shopName}</h1>
            <p>${currentData.shopTagline}</p>
        `;
  }

  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.placeholder = currentData.searchPlaceholder;
    searchInput.value = "";
  }

  renderMap();
  renderTabs();
  renderProducts();
  renderFooter();
}

function renderMap() {
  const mapSection = document.getElementById("map-section");
  if (!mapSection) return;

  mapSection.innerHTML = `
        <a href="${config.locationLink}" target="_blank" class="map-pill">
            <div class="map-icon-box"><i class="fa-solid fa-map-location-dot"></i></div>
            <div class="map-info">
                <span class="map-label">${currentData.locationLabel}</span>
                <span class="map-action">${currentData.locationAction}</span>
            </div>
            <div class="map-arrow"><i class="fa-solid fa-chevron-right"></i></div>
        </a>
    `;
}

function renderTabs() {
  const tabsContainer = document.getElementById("tabsContainer");
  if (!tabsContainer) return;
  tabsContainer.innerHTML = "";

  const allTab = document.createElement("button");
  allTab.className = "tab-btn active";
  allTab.innerText = currentData.tabsAll;
  allTab.onclick = () => filterCategory("All", allTab);
  tabsContainer.appendChild(allTab);

  if (currentData.categories) {
    currentData.categories.forEach((cat) => {
      const btn = document.createElement("button");
      btn.className = "tab-btn";
      btn.innerText = cat.title;
      btn.onclick = () => filterCategory(cat.title, btn);
      tabsContainer.appendChild(btn);
    });
  }
}

function renderProducts() {
  const app = document.getElementById("app");
  if (!app) return;
  app.innerHTML = "";

  if (!currentData.categories) return;

  currentData.categories.forEach((cat) => {
    const card = document.createElement("div");
    card.className = "category-card";
    card.dataset.category = cat.title;

    const imgSrc = cat.image
      ? cat.image
      : "https://placehold.co/600x200?text=" + cat.title;
    card.innerHTML = `<div class="cat-header"><img src="${imgSrc}"><div class="cat-title">${cat.title}</div></div>`;

    const ul = document.createElement("ul");
    ul.className = "product-list";

    cat.items.forEach((item, i) => {
      const li = document.createElement("li");
      li.className = "product-item";

      if (i >= config.itemsToShowInitially) {
        li.classList.add("item-hidden");
      }

      li.innerHTML = `<i class="fa-solid fa-caret-right product-icon"></i> ${item}`;
      ul.appendChild(li);
    });

    card.appendChild(ul);

    if (cat.items.length > config.itemsToShowInitially) {
      const btn = document.createElement("button");
      btn.className = "show-more-btn";
      btn.innerText = currentData.showMore;

      btn.onclick = () => {
        const isExpanding = btn.innerText === currentData.showMore;
        if (isExpanding) {
          ul.querySelectorAll(".product-item").forEach((li) =>
            li.classList.remove("item-hidden")
          );
          btn.innerText = currentData.showLess;
        } else {
          ul.querySelectorAll(".product-item").forEach((li, i) => {
            if (i >= config.itemsToShowInitially)
              li.classList.add("item-hidden");
          });
          btn.innerText = currentData.showMore;
        }
      };
      card.appendChild(btn);
    }
    app.appendChild(card);
  });
}

function renderFooter() {
  const footer = document.getElementById("footer");
  if (!footer) return;
  footer.innerHTML = `
        <div class="footer-content">
            <div class="footer-main">
                <i class="fa-solid fa-store"></i>
                <h3>${currentData.footerTitle}</h3>
            </div>
            <p style="margin: 5px 0; font-size: 0.9rem; opacity: 0.8;">${
              currentData.footerMessage
            }</p>
            <div class="footer-sub">
                © ${new Date().getFullYear()} ${currentData.shopName}
            </div>
        </div>
    `;
}

function filterCategory(categoryName, clickedBtn) {
  document
    .querySelectorAll(".tab-btn")
    .forEach((btn) => btn.classList.remove("active"));
  clickedBtn.classList.add("active");
  const searchInput = document.getElementById("searchInput");
  if (searchInput) searchInput.value = "";

  document.querySelectorAll(".category-card").forEach((card) => {
    const cardCategory = card.dataset.category;
    const list = card.querySelector(".product-list");
    const items = list.querySelectorAll(".product-item");
    const showMoreBtn = card.querySelector(".show-more-btn");

    const isMatch =
      categoryName === "All" ||
      categoryName === currentData.tabsAll ||
      cardCategory === categoryName;

    if (isMatch) {
      card.classList.remove("hidden");

      if (categoryName === "All" || categoryName === currentData.tabsAll) {
        items.forEach((item, index) => {
          if (index >= config.itemsToShowInitially)
            item.classList.add("item-hidden");
          else item.classList.remove("item-hidden");
        });
        if (showMoreBtn) {
          showMoreBtn.style.display = "block";
          showMoreBtn.innerText = currentData.showMore;
        }
      } else {
        items.forEach((item) => item.classList.remove("item-hidden"));
        if (showMoreBtn) showMoreBtn.style.display = "none";
      }
    } else {
      card.classList.add("hidden");
    }
  });
}

function handleSearch(e) {
  const searchTerm = e.target.value.toLowerCase();

  document.querySelectorAll(".category-card").forEach((card) => {
    const items = card.querySelectorAll(".product-item");
    let hasVisibleItems = false;
    const showMoreBtn = card.querySelector(".show-more-btn");

    items.forEach((item) => {
      const text = item.innerText.toLowerCase();
      if (searchTerm.length > 0) item.classList.remove("item-hidden");

      if (text.includes(searchTerm)) {
        item.style.display = "flex";
        hasVisibleItems = true;
      } else {
        item.style.display = "none";
      }
    });

    if (hasVisibleItems) {
      card.classList.remove("hidden");
      if (showMoreBtn)
        showMoreBtn.style.display = searchTerm.length > 0 ? "none" : "block";
    } else {
      card.classList.add("hidden");
    }
  });
}

function initTheme() {
  try {
    if (
      currentTheme === "dark" ||
      (currentTheme === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      document.documentElement.setAttribute("data-theme", "dark");
      const toggle = document.querySelector(".theme-toggle i");
      if (toggle) toggle.className = "fa-solid fa-sun";
    } else {
      document.documentElement.setAttribute("data-theme", "light");
      const toggle = document.querySelector(".theme-toggle i");
      if (toggle) toggle.className = "fa-solid fa-moon";
    }
  } catch (e) {}
}

function toggleTheme() {
  const html = document.documentElement;
  const isDark = html.getAttribute("data-theme") === "dark";
  const newTheme = isDark ? "light" : "dark";

  html.setAttribute("data-theme", newTheme);
  try {
    localStorage.setItem("shopTheme", newTheme);
  } catch (e) {}

  const toggle = document.querySelector(".theme-toggle i");
  if (toggle)
    toggle.className = isDark ? "fa-solid fa-moon" : "fa-solid fa-sun";
}
