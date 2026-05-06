// ==UserScript==
// @name         Torn Travel Run Optimizer
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Displays estimated profit margins for foreign items based on YATA API
// @author       Jules
// @match        https://www.torn.com/travelagency.php*
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function() {
    'use strict';

    // Using YATA API to fetch foreign stock and prices (doesn't require API key for basic public endpoints)
    const YATA_URL = 'https://yata.yt/api/v1/travel/export/';

    GM_xmlhttpRequest({
        method: "GET",
        url: YATA_URL,
        onload: function(response) {
            try {
                const data = JSON.parse(response.responseText);
                processTravelUI(data.destinations);
            } catch (e) {
                console.error("Error parsing YATA API", e);
            }
        }
    });

    function processTravelUI(destinations) {
        const observer = new MutationObserver((mutations) => {
            const countryElements = document.querySelectorAll('.travel-agency-list li:not(.travel-processed)');

            countryElements.forEach(el => {
                el.classList.add('travel-processed');

                const nameEl = el.querySelector('.country-name');
                if (!nameEl) return;
                const countryName = nameEl.innerText.trim();

                // Find matching country in YATA data
                const destData = Object.values(destinations).find(d => d.name === countryName);
                if (!destData) return;

                // Find most profitable item
                let bestItem = null;
                let maxProfit = 0;

                destData.items.forEach(item => {
                    if (item.stock > 0 && item.profit > maxProfit) {
                        maxProfit = item.profit;
                        bestItem = item;
                    }
                });

                if (bestItem) {
                    const infoDiv = document.createElement('div');
                    infoDiv.style.backgroundColor = 'rgba(0,0,0,0.7)';
                    infoDiv.style.color = '#fff';
                    infoDiv.style.padding = '5px';
                    infoDiv.style.borderRadius = '3px';
                    infoDiv.style.marginTop = '10px';
                    infoDiv.style.fontSize = '11px';

                    infoDiv.innerHTML = `
                        <strong>Best Buy:</strong> ${bestItem.name}<br>
                        <strong>Stock:</strong> ${bestItem.stock.toLocaleString()}<br>
                        <strong style="color:#4caf50;">Profit/Item: $${bestItem.profit.toLocaleString()}</strong>
                    `;

                    const wrap = el.querySelector('.wrap') || el;
                    wrap.appendChild(infoDiv);
                }
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }
})();
