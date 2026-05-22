/*
 * Quelora — quelora-demo-api
 * Copyright (C) 2026 Germán Zelaya — https://quelora.org
 * SPDX-License-Identifier: AGPL-3.0-only
 *
 * This file is part of Quelora. See the LICENSE file for terms.
 */

/**
 * @fileoverview Client-side controller for the article view.
 * Handles DOM hydration, data fetching for the main article and sidebar,
 * and precise flexbox layout alignments with full accessibility, SEO support,
 * and data attributes for isolated widget hydration.
 */

const articleMainContainer = document.getElementById('articleMainContainer');
const sidebarContainer = document.getElementById('sidebarContainer');
const loaderOverlay = document.getElementById('loader-overlay');
const themeToggle = document.getElementById('themeToggle');
const themeIconSun = document.getElementById('themeIconSun');
const themeIconMoon = document.getElementById('themeIconMoon');

/**
 * Toggles the loading overlay visibility.
 * @param {boolean} show - Determines whether to show or hide the loader.
 */
function showLoader(show) {
    if (show) {
        loaderOverlay.classList.remove('hidden');
    } else {
        setTimeout(() => loaderOverlay.classList.add('hidden'), 300);
    }
}

/**
 * Parses the URL search parameters to retrieve the article ID.
 * @returns {string|null} The entity ID of the article or null if not present.
 */
function getArticleIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

/**
 * Fetches a single article's data from the backend by its entity ID.
 * @param {string} id - The entity ID of the post.
 * @returns {Promise<Object>} The article data payload.
 * @throws {Error} If the network request fails or the post is not found.
 */
async function fetchArticleById(id) {
    const response = await fetch(`/api/posts/${id}`);
    if (!response.ok) {
        throw new Error('Failed to fetch article data. It may not exist.');
    }
    return await response.json();
}

/**
 * Fetches a random set of articles for the "Most Read" sidebar.
 * @param {number} [limit=5] - The maximum number of random articles to retrieve.
 * @returns {Promise<Array<Object>>} An array of article data payloads.
 */
async function fetchRandomArticles(limit = 5) {
    try {
        const response = await fetch(`/api/posts/random?limit=${limit}`);
        if (!response.ok) return [];
        return await response.json();
    } catch (error) {
        console.error('Sidebar fetch error:', error);
        return [];
    }
}

/**
 * Generates a mock article body by repeating the description multiple times.
 * This is a temporary demo workaround for missing body content.
 * @param {string} description - The short description to repeat.
 * @param {number} iterations - The number of times to repeat the description.
 * @returns {string} The HTML string representing the article body.
 */
function generateMockBody(description, iterations) {
    let bodyHtml = '';
    const safeDesc = description || 'No description available for this content.';
    for (let i = 0; i < iterations; i++) {
        bodyHtml += `<p>${safeDesc}</p>`;
    }
    return bodyHtml;
}

/**
 * Renders the main article content into the DOM.
 * Injects routing metadata into the widget containers for isolated hydration.
 * @param {Object} item - The article data object.
 */
function renderArticle(item) {
    if (!item || !articleMainContainer) return;

    const author = item.metadata?.author || "Unknown";
    const date = item.created_at ? new Date(item.created_at.$date || item.created_at).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' }) : "Unknown Date";
    
    let imageSrc = item.image || '';
    const isVideo = imageSrc.includes("youtube.com") || imageSrc.includes("youtu.be");
    if (isVideo) {
        let videoId = null;
        try {
            if (imageSrc.includes("youtube.com")) {
                const urlParams = new URL(imageSrc).searchParams;
                videoId = urlParams.get("v");
            } else if (imageSrc.includes("youtu.be")) {
                videoId = imageSrc.split("/").pop();
            }
            if (videoId) {
                const queryIndex = videoId.indexOf('?');
                if (queryIndex !== -1) {
                    videoId = videoId.substring(0, queryIndex);
                }
                imageSrc = `https://img.youtube.com/vi/${videoId.trim()}/maxresdefault.jpg`;
            }
        } catch (e) {
            console.error('Error parsing YouTube URL for article hero:', e);
        }
    }

    const mockBodyHtml = generateMockBody(item.description, 10);
    const topMetaStyle = "display: flex; justify-content: flex-end; align-items: center; gap: 12px; color: var(--on-surface-secondary);";
    const bottomMetaStyle = "display: flex; justify-content: space-between; align-items: center; width: 100%; gap: 12px; padding-top: 16px; margin-top: 16px; border-top: 1px solid var(--border-color); color: var(--on-surface-secondary);";
    
    const articleUrl = `article.html?id=${item.entity}`;
    const commentsUrl = `${articleUrl}#comments`;

    articleMainContainer.innerHTML = `
        ${imageSrc ? `<img src="${imageSrc}" alt="${item.title}" class="article-hero">` : ''}
        <div class="article-content-wrapper news-card" data-entity="${item.entity}">
            <h1 class="article-title">${item.title}</h1>
            
            <div class="article-meta" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0; padding-bottom: 16px; border-bottom: 1px solid var(--border-color); flex-wrap: wrap; gap: 12px;">
                <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                    <span>By <strong>${author}</strong></span>
                    <span>•</span>
                    <span>${date}</span>
                    ${item.metadata?.subreddit ? `<span>•</span><span>r/${item.metadata.subreddit}</span>` : ''}
                </div>
                <div class="news-meta" data-url="${articleUrl}" data-comments-url="${commentsUrl}" style="${topMetaStyle}"></div>
            </div>
            
            <div class="article-body" style="margin-top: 24px;">
                ${mockBodyHtml}
            </div>
            
            <div class="news-meta" data-url="${articleUrl}" data-comments-url="${commentsUrl}" style="${bottomMetaStyle}"></div>
        </div>
    `;
}

/**
 * Renders the random articles into the sidebar container.
 * Injects routing metadata into the widget containers for isolated hydration.
 * @param {Array<Object>} items - Array of article data objects.
 */
function renderSidebar(items) {
    if (!sidebarContainer || !items || !items.length) {
        if (sidebarContainer) sidebarContainer.innerHTML = '<p>No suggestions available.</p>';
        return;
    }

    let sidebarHtml = '';
    const widgetFlexStyle = "display: flex; justify-content: flex-end; align-items: center; width: 100%; gap: 16px; padding-top: 12px; margin-top: auto; border-top: 1px solid var(--border-color); color: var(--on-surface-secondary); font-size: 13px;";

    items.forEach(item => {
        let imageSrc = item.image || '';
        const isVideo = imageSrc.includes("youtube.com") || imageSrc.includes("youtu.be");
        if (isVideo) {
            let videoId = null;
            try {
                if (imageSrc.includes("youtube.com")) {
                    const urlParams = new URL(imageSrc).searchParams;
                    videoId = urlParams.get("v");
                } else if (imageSrc.includes("youtu.be")) {
                    videoId = imageSrc.split("/").pop();
                }
                if (videoId) {
                    const queryIndex = videoId.indexOf('?');
                    if (queryIndex !== -1) {
                        videoId = videoId.substring(0, queryIndex);
                    }
                    imageSrc = `https://img.youtube.com/vi/${videoId.trim()}/hqdefault.jpg`;
                }
            } catch (e) {
                console.warn('Silent failure parsing YouTube URL in Sidebar:', e);
            }
        }

        const date = item.created_at ? new Date(item.created_at.$date || item.created_at).toLocaleDateString("en-US") : "";
        const entityId = item.entity?.$oid || item.entity || item._id;
        const articleUrl = `article.html?id=${entityId}`;
        const commentsUrl = `${articleUrl}#comments`;
        const safeTitle = item.title ? item.title.replace(/"/g, '&quot;') : 'Article';

        sidebarHtml += `
            <div class="sidebar-card news-card" data-entity="${entityId}" role="link" tabindex="0" aria-label="Read article: ${safeTitle}" style="cursor: pointer;">
                ${imageSrc ? `<img src="${imageSrc}" alt="${safeTitle}" class="sidebar-card-image">` : ''}
                <div class="sidebar-card-content" style="display: flex; flex-direction: column; flex-grow: 1; padding: 16px;">
                    <h4 class="sidebar-card-title" style="margin: 0 0 8px 0;">
                        <a href="${articleUrl}" tabindex="-1" style="text-decoration: none; color: inherit; pointer-events: none;">${item.title}</a>
                    </h4>
                    <div class="sidebar-card-meta" style="margin-bottom: 12px; font-size: 12px; color: var(--on-surface-secondary);">${date}</div>
                    <div class="news-meta" data-url="${articleUrl}" data-comments-url="${commentsUrl}" style="${widgetFlexStyle}"></div>
                </div>
            </div>
        `;
    });

    sidebarContainer.innerHTML = sidebarHtml;

    sidebarContainer.addEventListener('click', (event) => {
        const cardTarget = event.target.closest('.sidebar-card');
        
        if (!cardTarget) return;

        if (event.target.closest('.news-meta')) {
            return;
        }

        const entityId = cardTarget.getAttribute('data-entity');
        if (entityId) {
            window.location.href = `article.html?id=${entityId}`;
        }
    });

    sidebarContainer.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            const cardTarget = event.target.closest('.sidebar-card');
            if (!cardTarget) return;

            const entityId = cardTarget.getAttribute('data-entity');
            if (entityId) {
                window.location.href = `article.html?id=${entityId}`;
            }
        }
    });
}

/**
 * Applies the specified theme to the document body and updates icons.
 * @param {string} theme - The theme to apply ('dark' or 'light').
 */
function setTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
        if (themeIconSun && themeIconMoon) {
            themeIconSun.style.display = 'none';
            themeIconMoon.style.display = 'block';
        }
        localStorage.setItem('theme', 'dark');
    } else {
        document.body.classList.remove('dark-theme');
        if (themeIconSun && themeIconMoon) {
            themeIconSun.style.display = 'block';
            themeIconMoon.style.display = 'none';
        }
        localStorage.setItem('theme', 'light');
    }
}

/**
 * Toggles the current theme between light and dark.
 */
function toggleTheme() {
    if (document.body.classList.contains('dark-theme')) {
        setTheme('light');
    } else {
        setTheme('dark');
    }
}

/**
 * Initializes the article view, handling data fetching, hydration, and theme setup.
 */
async function init() {
    showLoader(true);

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

    const articleId = getArticleIdFromUrl();

    if (!articleId) {
        window.location.href = 'index.html';
        return;
    }

    try {
        const [articleData, sidebarData] = await Promise.all([
            fetchArticleById(articleId),
            fetchRandomArticles(5)
        ]);

        renderArticle(articleData);
        renderSidebar(sidebarData);
    } catch (error) {
        console.error('Failed to initialize article view:', error);
        if (articleMainContainer) {
            articleMainContainer.innerHTML = `
                <div style="padding: 40px; text-align: center;">
                    <h2>Article not found</h2>
                    <p>The content you are looking for does not exist or has been removed.</p>
                    <a href="index.html" style="color: var(--primary-color); text-decoration: none; font-weight: bold;">Return to Home</a>
                </div>
            `;
        }
    } finally {
        showLoader(false);
    }
}

document.addEventListener('DOMContentLoaded', init);