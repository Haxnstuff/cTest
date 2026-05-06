// ==UserScript==
// @name         Torn Faction Chain Watcher
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Sticky UI widget for faction chain timers based on Torn API
// @author       Jules
// @match        https://www.torn.com/*
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function() {
    'use strict';

    const apiKey = localStorage.getItem('torn_api_key');
    if (!apiKey) return; // Silent fail if no key, other scripts will prompt

    // Create the floating widget
    const widget = document.createElement('div');
    widget.style.position = 'fixed';
    widget.style.bottom = '20px';
    widget.style.left = '20px';
    widget.style.backgroundColor = 'rgba(0,0,0,0.85)';
    widget.style.color = '#fff';
    widget.style.padding = '10px 15px';
    widget.style.borderRadius = '5px';
    widget.style.border = '1px solid #444';
    widget.style.zIndex = '9999';
    widget.style.fontFamily = 'Arial, sans-serif';
    widget.style.fontSize = '14px';
    widget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.3)';
    widget.innerHTML = '<strong>Chain Status:</strong> Loading...';
    document.body.appendChild(widget);

    function updateChainStatus() {
        const FACTION_API_URL = `https://api.torn.com/faction/?selections=chain&key=${apiKey}`;

        GM_xmlhttpRequest({
            method: "GET",
            url: FACTION_API_URL,
            onload: function(response) {
                try {
                    const data = JSON.parse(response.responseText);
                    if (data.error) {
                        widget.innerHTML = `<strong>Chain API Error:</strong> ${data.error.error}`;
                        return;
                    }

                    const chain = data.chain;
                    if (chain && chain.current > 0) {
                        const maxHits = chain.max;
                        const currentHits = chain.current;
                        const timeout = chain.timeout; // in seconds

                        let color = '#4caf50'; // Green > 3 mins
                        if (timeout < 60) color = '#f44336'; // Red < 1 min
                        else if (timeout < 180) color = '#ff9800'; // Orange < 3 mins

                        const mins = Math.floor(timeout / 60);
                        const secs = timeout % 60;
                        const timeStr = `${mins}:${secs.toString().padStart(2, '0')}`;

                        widget.innerHTML = `
                            <strong>Chain:</strong> ${currentHits} / ${maxHits}<br>
                            <strong>Timer:</strong> <span style="color:${color}; font-weight:bold;">${timeStr}</span>
                        `;
                    } else {
                        widget.innerHTML = '<strong>Chain Status:</strong> Inactive';
                    }
                } catch (e) {
                    console.error("Error parsing Faction API", e);
                }
            }
        });
    }

    // Update immediately, then poll every 10 seconds
    updateChainStatus();
    setInterval(updateChainStatus, 10000);

})();
