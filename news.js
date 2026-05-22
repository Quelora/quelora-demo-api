/*
 * Quelora — quelora-demo-api
 * Copyright (C) 2026 Germán Zelaya — https://quelora.org
 * SPDX-License-Identifier: AGPL-3.0-only
 *
 * This file is part of Quelora. See the LICENSE file for terms.
 */

/**
 * @fileoverview Main controller for the news feed.
 * Handles fetching paginated data, rendering the hero carousel,
 * the in-live section, and the infinite scroll news grid.
 * Includes routing logic to navigate to the detailed article view.
 */

const heroScrollContainer = document.getElementById("heroScrollContainer");
const newsContainer = document.getElementById("newsContainer");
const statusContainer = document.getElementById("statusContainer");
const loaderOverlay = document.getElementById("loader-overlay");
const prevControl = document.getElementById("prevControl");
const nextControl = document.getElementById("nextControl");
const heroCarousel = document.getElementById("heroCarousel");
const inliveSection = document.getElementById("inliveSection");

let page = 0;
let isLoading = false;
let hasMore = true;
const limit = 16;
const HERO_COUNT = 5;
const SLIDE_INTERVAL = 3000;
const SCROLL_THRESHOLD = 800;
let slideIndex = 0;
let slideInterval;
let heroData = [];
let isPausedByUser = false;

/**
 * Toggles the visibility of the full-screen loader.
 * @param {boolean} show - Whether to display the loader.
 */
function showLoader(show) {
    if (show) {
        loaderOverlay.classList.remove('hidden');
    } else {
        setTimeout(() => loaderOverlay.classList.add('hidden'), 300);
    }
}

/**
 * Updates the status container message (e.g., for infinite scroll state).
 * @param {string} message - The message to display.
 */
function updateStatus(message) {
    statusContainer.innerHTML = `<div class="status-message">${message}</div>`;
}

/**
 * Fetches a paginated list of news articles from the server.
 * @param {number} page - The current page index.
 * @param {number} limit - The number of items to fetch per page.
 * @returns {Promise<Array<Object>>} The array of news items.
 * @throws {Error} If the network request fails.
 */
async function fetchNews(page, limit) {
    const res = await fetch(`/api/posts?page=${page}&limit=${limit}`);
    if (!res.ok) throw new Error("Failed to fetch news");
    return await res.json();
}

/**
 * Fetches the currently live posts from the server.
 * @returns {Promise<Array<Object>>} The array of live post items.
 */
async function fetchInlivePosts() {
    try {
        const res = await fetch(`/api/posts/inlive`);
        if (!res.ok) throw new Error("Failed to fetch inlive posts");
        return await res.json();
    } catch (e) {
        console.error(e);
        return [];
    }
}

/**
 * Creates a DOM element representing a news card.
 * @param {Object} item - The news data object.
 * @param {string} [extraClasses=''] - Additional CSS classes for styling.
 * @param {boolean} [isHero=false] - Whether the card is styled for the hero carousel.
 * @returns {HTMLElement|null} The constructed card element, or null if data is invalid.
 */
function createCardElement(item, extraClasses = '', isHero = false) {
    if (!item || !item.title || !item.image || !item.entity) {
        return null;
    }

    const card = document.createElement("div");
    card.className = `news-card ${extraClasses}`;
    
    const entityId = item.entity?.$oid || item.entity;
    card.dataset.id = entityId;
    card.dataset.entity = entityId;
    card.style.cursor = "pointer";

    let watermarkText = item.metadata?.subreddit || "SOURCE";
    const isVideo = item.image && (item.image.includes("youtube.com") || item.image.includes("youtu.be"));
    let imageSrc = item.image;

    if (isVideo) {
        watermarkText = item.metadata?.subreddit || "YOUTUBE";
        let videoId = null;
        try {
            if (item.image.includes("youtube.com")) {
                const urlParams = new URL(item.image).searchParams;
                videoId = urlParams.get("v");
            } else if (item.image.includes("youtu.be")) {
                videoId = item.image.split("/").pop();
            }
            if (videoId) {
                const queryIndex = videoId.indexOf('?');
                if (queryIndex !== -1) {
                    videoId = videoId.substring(0, queryIndex);
                }
                videoId = videoId.trim();
                imageSrc = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
            }
        } catch (e) {
            console.error('Error parsing YouTube URL:', e);
        }
    }

    const buttonsHTML = `
        <div class="news-buttons">
            <a href="${item?.reference || '#'}" target="_blank" class="news-btn reddit-btn" ${item?.reference ? '' : 'style="pointer-events: none; opacity: 0.5;"'}>
                Reddit Post
            </a>
        </div>
    `;
    const articleUrl = `article.html?id=${item.entity}`;
    if (isHero) {
        card.innerHTML = `
            <div class="hero-image-bg" style="background-image: url('${imageSrc}');"></div>
            <div class="hero-overlay">
                <div class="watermark">${watermarkText}</div>
                <h2 class="title">${item.title}</h2>
            </div>
            <div class="news-buttons">
                <a href="${item?.reference || '#'}" target="_blank" class="news-btn reddit-btn" ${item?.reference ? '' : 'style="pointer-events: none; opacity: 0.5;"'}>
                    Reddit Post
                </a>
                <div class="news-meta" data-url="${articleUrl}" ></div>
            </div>`;
    } else {
        const isLive = item.config?.liveMode?.isLiveActive === true;
        const liveBadgeHTML = isLive ? '<div class="live-badge"><span></span>LIVE</div>' : '';

        const mediaHTML = `<img src="${imageSrc}" alt="${item.title}" class="news-image">`;
        const dateString = item.created_at ? new Date(item.created_at.$date || item.created_at).toLocaleDateString("en-US") : "Unknown Date";
        
        card.innerHTML = `
            <div class="card-image-wrapper"> 
                ${mediaHTML}
                ${liveBadgeHTML}
                <div class="watermark">${watermarkText}</div>
                ${buttonsHTML} 
            </div>
            <div class="card-content-area">
                <div class="card-info">
                    <h3 class="news-title">${item.title}</h3>
                    <p>${item.description || item.metadata?.subreddit || ""}</p>
                    <div class="news-meta" data-url="${articleUrl}">
                        <span>${item.metadata?.author || "Unknown"}</span>
                        <span>${dateString}</span>
                    </div>
                </div>
            </div>`;
    }

    card.addEventListener('click', (e) => {
        if (!e.target.closest('.reddit-btn')) {
            window.location.href = `article.html?id=${entityId}`;
        }
    });

    return card;
}

/**
 * Renders the hero carousel with the latest top news.
 * @param {Array<Object>} items - The array of news items for the hero section.
 */
function renderHeroCarousel(items) {
    const validItems = items.filter(item => {
        return item && item.title && item.image && item.entity;
    });

    if (validItems.length === 0) {
        heroCarousel.style.display = 'none';
        return;
    }

    const totalSlides = validItems.length;
    const itemsToRender = [validItems[totalSlides - 1], ...validItems, validItems[0]];

    heroScrollContainer.innerHTML = '';

    const slideWidth = heroCarousel.offsetWidth;

    itemsToRender.forEach((item) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'hero-card-container';
        wrapper.style.width = `${slideWidth}px`;

        const card = createCardElement(item, 'hero-card hero-card-main', true);

        if (card) {
            wrapper.appendChild(card);
            heroScrollContainer.appendChild(wrapper);
        }
    });

    heroData = validItems;
    slideIndex = 1;
    updateCarouselPosition(false);
    startAutoSlide();
}

/**
 * Updates the visual position of the carousel.
 * @param {boolean} [animated=true] - Whether the transition should be animated.
 */
function updateCarouselPosition(animated = true) {
    if (!heroScrollContainer || !heroCarousel) return;

    const slideWidth = heroCarousel.offsetWidth;

    Array.from(heroScrollContainer.children).forEach(slide => {
        if (slide.classList.contains('hero-card-container')) {
            slide.style.width = `${slideWidth}px`;
        }
    });

    heroScrollContainer.style.transition = animated ? 'transform 0.5s ease-in-out' : 'none';

    const offset = -slideIndex * slideWidth;
    heroScrollContainer.style.transform = `translateX(${offset}px)`;

    if (slideIndex === heroData.length + 1 || slideIndex === 0) {
        setTimeout(() => {
            heroScrollContainer.style.transition = 'none';
            if (slideIndex === heroData.length + 1) {
                slideIndex = 1;
            } else if (slideIndex === 0) {
                slideIndex = heroData.length;
            }
            const newOffset = -slideIndex * slideWidth;
            heroScrollContainer.style.transform = `translateX(${newOffset}px)`;
        }, animated ? 500 : 0);
    }
}

/**
 * Moves the carousel slide manually.
 * @param {number} direction - The direction to move (-1 for previous, 1 for next).
 */
function moveSlide(direction) {
    stopAutoSlide();
    isPausedByUser = true;
    slideIndex += direction;
    updateCarouselPosition();
}

/**
 * Starts the automatic sliding interval for the hero carousel.
 */
function startAutoSlide() {
    if (heroData.length > 0 && !isPausedByUser) {
        stopAutoSlide();
        slideInterval = setInterval(() => {
            slideIndex++;
            updateCarouselPosition();
        }, SLIDE_INTERVAL);
    }
}

/**
 * Stops the automatic sliding interval.
 */
function stopAutoSlide() {
    clearInterval(slideInterval);
}

/**
 * Handles clicks on the carousel, pausing the automatic sliding.
 */
function handleCarouselClick() {
    if (isPausedByUser) return;
    stopAutoSlide();
    isPausedByUser = true;
}

/**
 * Renders the section dedicated to live posts.
 * @param {Array<Object>} items - The array of live post items.
 */
function renderInlivePosts(items) {
    if (!inliveSection || !items || items.length === 0) {
        if (inliveSection) inliveSection.classList.add('hidden');
        return;
    }

    const cardWrapper = document.createElement('div');
    cardWrapper.className = 'inlive-card-wrapper';

    items.forEach((item) => {
        const card = createCardElement(item, 'inlive-card', false);
        if (card) {
            cardWrapper.appendChild(card);
        }
    });

    inliveSection.appendChild(cardWrapper);
    inliveSection.classList.remove('hidden');
}

/**
 * Appends news items to the main grid.
 * @param {Array<Object>} newsItems - The array of news items to render.
 */
function renderNewsGrid(newsItems) {
    newsItems.forEach((item) => {
        const card = createCardElement(item, '', false);
        if (card) {
            newsContainer.appendChild(card);
        }
    });
}

/**
 * Loads the next page of news items and triggers rendering.
 * @param {boolean} [isInitialLoad=false] - Whether this is the first load sequence.
 */
async function loadMoreNews(isInitialLoad = false) {
    if (isLoading || !hasMore) {
        return;
    }

    isLoading = true;
    if (!isInitialLoad) {
        updateStatus('Loading more stories...');
    }

    try {
        const fetchedNews = await fetchNews(page, limit);

        if (fetchedNews.length === 0) {
            hasMore = false;
            if (!isInitialLoad) {
                updateStatus('You have reached the end. No more stories for now!');
            }
            return;
        }

        const validNews = fetchedNews.filter(item => {
            return item && item.title && item.image && item.entity;
        });

        if (validNews.length === 0 && page === 0) {
            heroCarousel.style.display = 'none';
        }

        if (validNews.length === 0 && !isInitialLoad) {
            hasMore = false;
            updateStatus('No more valid stories found.');
            return;
        }

        let heroItems = [];
        let gridItems = validNews;

        if (isInitialLoad) {
            heroItems = validNews.slice(0, HERO_COUNT);
            gridItems = validNews.slice(HERO_COUNT);
            renderHeroCarousel(heroItems);
        }

        renderNewsGrid(gridItems);

        if (fetchedNews.length < limit) {
            hasMore = false;
            updateStatus('You have reached the end. No more stories for now!');
        } else {
            statusContainer.innerHTML = '';
        }

        page++;
    } catch (e) {
        console.error("Error loading news:", e);
        updateStatus('Error loading content. Please try again later.');
    } finally {
        isLoading = false;
        if (isInitialLoad) showLoader(false);
    }
}

/**
 * Debounces a function execution to limit firing frequency.
 * @param {Function} func - The function to debounce.
 * @param {number} wait - The delay in milliseconds.
 * @returns {Function} The debounced function.
 */
function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// Window resize handling for the carousel
window.addEventListener('resize', debounce(() => {
    updateCarouselPosition(false);
}, 250));

// Carousel controls
if (prevControl && nextControl) {
    prevControl.addEventListener('click', () => moveSlide(-1));
    nextControl.addEventListener('click', () => moveSlide(1));
}

if (heroCarousel) {
    heroCarousel.addEventListener('mouseenter', stopAutoSlide);
    heroCarousel.addEventListener('mouseleave', startAutoSlide);
    heroCarousel.addEventListener('click', handleCarouselClick);
}

// Infinite scroll implementation
window.addEventListener("scroll", debounce(() => {
    const documentHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
    const scrollPosition = window.scrollY + window.innerHeight;
    const distanceToBottom = documentHeight - scrollPosition;

    if (distanceToBottom <= SCROLL_THRESHOLD) {
        loadMoreNews();
    }
}, 100));

const themeToggle = document.getElementById('themeToggle');
const themeIconSun = document.getElementById('themeIconSun');
const themeIconMoon = document.getElementById('themeIconMoon');

/**
 * Applies the specified theme to the application.
 * @param {string} theme - The theme identifier ('dark' or 'light').
 */
function setTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
        themeIconSun.style.display = 'none';
        themeIconMoon.style.display = 'block';
        localStorage.setItem('theme', 'dark');
    } else {
        document.body.classList.remove('dark-theme');
        themeIconSun.style.display = 'block';
        themeIconMoon.style.display = 'none';
        localStorage.setItem('theme', 'light');
    }
}

/**
 * Toggles the application theme.
 */
function toggleTheme() {
    if (document.body.classList.contains('dark-theme')) {
        setTheme('light');
    } else {
        setTheme('dark');
    }
}

const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    setTheme(savedTheme);
} else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(prefersDark ? 'dark' : 'light');
}

if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
}

// Application initialization
(async () => {
    showLoader(true);

    try {
        const inlivePosts = await fetchInlivePosts();
        renderInlivePosts(inlivePosts);
    } catch (e) {
        console.error("Failed to load inlive posts:", e);
        if (inliveSection) inliveSection.classList.add('hidden');
    }

    await loadMoreNews(true);
})();