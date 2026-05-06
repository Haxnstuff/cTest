// ==UserScript==
// @name         Torn Bazaar Profit Calculator
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Calculates potential profit of items in bazaars vs market value, highlighting underpriced items.
// @author       Jules
// @match        https://www.torn.com/bazaar.php*
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function() {
    'use strict';

    // Note: Requires a Torn API Key to fetch current market averages
    const apiKey = localStorage.getItem('torn_api_key') || prompt("Please enter your Torn API Key for the Bazaar Calculator:");
    if (!apiKey) return;
    localStorage.setItem('torn_api_key', apiKey);

    const ITEM_API_URL = `https://api.torn.com/torn/?selections=items&key=${apiKey}`;

    // Fetch item market prices
    GM_xmlhttpRequest({
        method: "GET",
        url: ITEM_API_URL,
        onload: function(response) {
            try {
                const data = JSON.parse(response.responseText);
                if (data.error) {
                    console.error("Torn API Error:", data.error.error);
                    return;
                }
                const items = data.items;
                processBazaar(items);
            } catch (e) {
                console.error("Error parsing Torn API response", e);
            }
        }
    });

    function processBazaar(items) {
        // Observe DOM for bazaar item list changes
        const observer = new MutationObserver((mutations) => {
            const itemElements = document.querySelectorAll('.item-cont:not(.processed-bazaar)');
            itemElements.forEach(el => {
                el.classList.add('processed-bazaar');

                const nameEl = el.querySelector('.item-name');
                const priceEl = el.querySelector('.price');

                if (nameEl && priceEl) {
                    const itemName = nameEl.innerText.trim();
                    const listPrice = parseInt(priceEl.innerText.replace(/[^0-9]/g, ''));

                    // Find item in API data
                    let marketValue = 0;
                    for (const id in items) {
                        if (items[id].name === itemName) {
                            marketValue = items[id].market_value;
                            break;
                        }
                    }

                    if (marketValue > 0) {
                        const profit = marketValue - listPrice;
                        const profitMargin = ((profit / listPrice) * 100).toFixed(2);

                        const profitDiv = document.createElement('div');
                        profitDiv.style.marginTop = '5px';
                        profitDiv.style.fontWeight = 'bold';

                        if (profit > 0) {
                            profitDiv.style.color = '#4caf50'; // Green
                            profitDiv.innerText = `Profit: $${profit.toLocaleString()} (+${profitMargin}%)`;
                            // Highlight the whole row if profit is highly lucrative
                            if (profitMargin > 10) el.style.border = '2px solid #4caf50';
                        } else {
                            profitDiv.style.color = '#f44336'; // Red
                            profitDiv.innerText = `Loss: $${Math.abs(profit).toLocaleString()}`;
                        }

                        priceEl.parentNode.appendChild(profitDiv);
                    }
                }
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }
})();
