// ==UserScript==
// @name         Torn Gym Stat Efficiency
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Calculates stat gains per energy spent in the gym based on current gym and perks
// @author       Jules
// @match        https://www.torn.com/gym.php*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function calculateEfficiency() {
        const energyInput = document.querySelector('.energy-input input');
        const statContainers = document.querySelectorAll('.stat-container');

        if (!energyInput || statContainers.length === 0) return;

        // Parse energy entered
        const eToSpend = parseInt(energyInput.value) || 10; // Default min 10

        statContainers.forEach(container => {
            if (container.classList.contains('processed-gym')) return;

            const gainEl = container.querySelector('.stat-gain');
            if (!gainEl) return;

            const gainText = gainEl.innerText.replace(/,/g, '');
            const projectedGain = parseFloat(gainText);

            if (!isNaN(projectedGain)) {
                container.classList.add('processed-gym');

                const efficiency = projectedGain / eToSpend;

                const effDiv = document.createElement('div');
                effDiv.style.fontSize = '12px';
                effDiv.style.color = '#ff9800'; // Orange
                effDiv.style.marginTop = '4px';
                effDiv.innerText = `Eff: ${efficiency.toFixed(2)} gain/E`;

                container.appendChild(effDiv);
            }
        });
    }

    // Attach to train buttons or input changes
    const observer = new MutationObserver(() => {
        calculateEfficiency();
    });

    observer.observe(document.body, { childList: true, subtree: true, attributes: true });

    // Also bind to input events on the energy field
    document.addEventListener('input', (e) => {
        if (e.target.closest('.energy-input')) {
            // reset processed classes
            document.querySelectorAll('.processed-gym').forEach(el => el.classList.remove('processed-gym'));
            setTimeout(calculateEfficiency, 200); // delay to let Torn JS calculate projected gain
        }
    });

})();
