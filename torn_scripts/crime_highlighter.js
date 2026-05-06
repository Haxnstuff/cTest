// ==UserScript==
// @name         Torn Safe Crime Highlighter
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Highlights the most optimal crimes for nerve spent in Crimes 2.0 based on general community data
// @author       Jules
// @match        https://www.torn.com/crimes.php*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // A simple dictionary mapping crime names/types to their "safety/profit" rating (1-5)
    // 5 = High CE (Crime Experience), low jail risk. 1 = High jail risk, low reward.
    const crimeRatings = {
        "Search for Cash": { rating: 5, note: "Safest, low nerve" },
        "Bootlegging": { rating: 4, note: "Good early profit" },
        "Shoplifting": { rating: 4, note: "Safe, decent items" },
        "Pickpocketing": { rating: 3, note: "Risk increases with target" },
        "Graffiti": { rating: 5, note: "High CE gain" },
        // Fallback for others
        "default": { rating: 2, note: "Standard risk" }
    };

    function highlightCrimes() {
        // Find crime cards (Crimes 2.0 DOM structure)
        const crimeCards = document.querySelectorAll('.crime-root:not(.crime-processed), .crime-box:not(.crime-processed)');

        crimeCards.forEach(card => {
            card.classList.add('crime-processed');

            const titleEl = card.querySelector('.title, .crime-name');
            if (!titleEl) return;

            const crimeName = titleEl.innerText.trim();
            const ratingData = crimeRatings[crimeName] || crimeRatings["default"];

            // Add a visual indicator
            const indicator = document.createElement('div');
            indicator.style.position = 'absolute';
            indicator.style.top = '5px';
            indicator.style.right = '5px';
            indicator.style.padding = '3px 6px';
            indicator.style.borderRadius = '4px';
            indicator.style.fontSize = '10px';
            indicator.style.fontWeight = 'bold';
            indicator.style.color = '#fff';
            indicator.style.zIndex = '10';

            if (ratingData.rating >= 4) {
                indicator.style.backgroundColor = '#4caf50'; // Green
                indicator.innerText = `⭐ Highly Recommended (${ratingData.note})`;
            } else if (ratingData.rating === 3) {
                indicator.style.backgroundColor = '#ff9800'; // Orange
                indicator.innerText = `⚠️ Moderate Risk`;
            } else {
                indicator.style.backgroundColor = '#f44336'; // Red
                indicator.innerText = `⛔ High Risk`;
            }

            // Ensure card has relative positioning so absolute child fits
            card.style.position = 'relative';
            card.appendChild(indicator);

            // Highlight border for 5-star
            if (ratingData.rating === 5) {
                card.style.boxShadow = '0 0 10px #4caf50';
            }
        });
    }

    const observer = new MutationObserver(() => {
        highlightCrimes();
    });

    observer.observe(document.body, { childList: true, subtree: true });

})();
