let currentData = {};
let currentLang = localStorage.getItem("shopLang") || "en";
let currentTheme = localStorage.getItem("shopTheme") || "system";

document.addEventListener("DOMContentLoaded", () => {
  initTheme();

  const langSelect = document.getElementById("langSelect");
  if (langSelect) langSelect.value = currentLang;

  loadLanguage(currentLang);

  document
    .getElementById("searchInput")
    .addEventListener("input", handleSearch);
});

async function loadLanguage(langCode) {
  try {
    const response = await fetch(`lang/${langCode}.json`);

    if (!response.ok) throw new Error("Language file not found");

    currentData = await response.json();
    currentLang = langCode;
    localStorage.setItem("shopLang", langCode);

    renderAllContent();
  } catch (error) {
    console.error("Error loading language:", error);
  }
}

function renderAllContent() {
  document.getElementById("header-content").innerHTML = `
        <h1><i class="fa-solid fa-store"></i> ${currentData.shopName}</h1>
        <p>${currentData.shopTagline}</p>
    `;

  document.getElementById("searchInput").placeholder =
    currentData.searchPlaceholder;
  document.getElementById("searchInput").value = "";

  renderMap();
  renderTabs();
  renderProducts();
  renderFooter();
}

function renderMap() {
  document.getElementById("map-section").innerHTML = `
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
  tabsContainer.innerHTML = "";

  const allTab = document.createElement("button");
  allTab.className = "tab-btn active";
  allTab.innerText = currentData.tabsAll;
  allTab.onclick = () => filterCategory("All", allTab);
  tabsContainer.appendChild(allTab);

  currentData.categories.forEach((cat) => {
    const btn = document.createElement("button");
    btn.className = "tab-btn";
    btn.innerText = cat.title;
    btn.onclick = () => filterCategory(cat.title, btn);
    tabsContainer.appendChild(btn);
  });
}

function renderProducts() {
  const app = document.getElementById("app");
  app.innerHTML = "";

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
  document.getElementById("searchInput").value = "";

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
  if (
    currentTheme === "dark" ||
    (currentTheme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches)
  ) {
    document.documentElement.setAttribute("data-theme", "dark");
    document.querySelector(".theme-toggle i").className = "fa-solid fa-sun";
  } else {
    document.documentElement.setAttribute("data-theme", "light");
    document.querySelector(".theme-toggle i").className = "fa-solid fa-moon";
  }
}

function toggleTheme() {
  const html = document.documentElement;
  const isDark = html.getAttribute("data-theme") === "dark";
  const newTheme = isDark ? "light" : "dark";

  html.setAttribute("data-theme", newTheme);
  localStorage.setItem("shopTheme", newTheme);
  document.querySelector(".theme-toggle i").className = isDark
    ? "fa-solid fa-moon"
    : "fa-solid fa-sun";
}
