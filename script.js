document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const sourceInput = document.getElementById('source-input');
    const sourceUnitSelect = document.getElementById('source-unit');
    const targetOutput = document.getElementById('target-output');
    const targetUnitSelect = document.getElementById('target-unit');
    const ingredientSelect = document.getElementById('ingredient-select');
    const densityMsg = document.getElementById('density-msg');
    const referenceList = document.getElementById('reference-list');
    const resetBtn = document.getElementById('reset-btn');

    // Specific Gravity Data (g/ml)
    const INGREDIENT_DATA = {
        'none': { density: 1.0, name: '' },
        'shoyu': { density: 1.2, name: '醤油' },
        'sake': { density: 1.0, name: '酒' },
        'mirin': { density: 1.2, name: 'みりん' },
        'sugar': { density: 0.6, name: '砂糖' },
        'flour': { density: 0.5, name: '小麦粉/片栗粉' },
        'butter': { density: 0.8, name: 'バター' },
        'rice': { density: 0.8, name: 'お米' }
    };

    // Unit definitions
    const units = {
        'ml': { type: 'volume', factor: 1, label: 'cc (ml)' },
        'cup': { type: 'volume', factor: 200, label: 'カップ' },
        'tbsp': { type: 'volume', factor: 15, label: '大さじ' },
        'tsp': { type: 'volume', factor: 5, label: '小さじ' },
        'g': { type: 'mass', factor: 1, label: 'g' },
        'us-cup': { type: 'volume', factor: 236.59, label: 'USカップ' },
        'uk-cup': { type: 'volume', factor: 284.13, label: 'UKカップ' }
    };

    // Default values for each unit
    const defaultValues = {
        'g': 100,
        'ml': 100,
        'cup': 1,
        'tbsp': 1,
        'tsp': 1,
        'us-cup': 1,
        'uk-cup': 1
    };

    // Calculate conversion
    function calculate() {
        if (!sourceInput || !sourceUnitSelect || !targetUnitSelect || !ingredientSelect) return;

        // Handle "Smart Default/Preview" Logic
        let val = parseFloat(sourceInput.value);
        let isDefaultPreview = false;

        const sourceUnit = sourceUnitSelect.value;
        const targetUnit = targetUnitSelect.value;
        const ingredientKey = ingredientSelect.value;
        const density = INGREDIENT_DATA[ingredientKey].density;
        const ingredientName = INGREDIENT_DATA[ingredientKey].name;

        // Update Density Message
        if (ingredientKey !== 'none' && ingredientName) {
            densityMsg.textContent = `✅ ${ingredientName}に合わせてピッタリ計算中！ (比重:${density})`;
            densityMsg.classList.remove('hidden');
        } else {
            densityMsg.classList.add('hidden');
        }

        // If input is empty, use the default value for the current source unit
        if (isNaN(val)) {
            val = defaultValues[sourceUnit] || 1;
            isDefaultPreview = true;
            sourceInput.placeholder = val;
        } else {
            sourceInput.placeholder = defaultValues[sourceUnit] || 1;
        }

        // Style the output based on whether it's a real result or a preview
        if (isDefaultPreview) {
            targetOutput.classList.add('placeholder-text');
        } else {
            targetOutput.classList.remove('placeholder-text');
        }

        // 1. Convert source to base unit: ml
        let inMl = 0;
        switch (sourceUnit) {
            case 'g': inMl = val / density; break; // g -> ml
            case 'ml': inMl = val; break;
            case 'cup': inMl = val * 200; break;
            case 'tbsp': inMl = val * 15; break;
            case 'tsp': inMl = val * 5; break;
            case 'us-cup': inMl = val * 236.59; break;
            case 'uk-cup': inMl = val * 284.13; break;
        }

        // 2. Convert base unit (ml) to target
        let result = 0;
        switch (targetUnit) {
            case 'g': result = inMl * density; break; // ml -> g
            case 'ml': result = inMl; break;
            case 'cup': result = inMl / 200; break;
            case 'tbsp': result = inMl / 15; break;
            case 'tsp': result = inMl / 5; break;
            case 'us-cup': result = inMl / 236.59; break;
            case 'uk-cup': result = inMl / 284.13; break;
        }

        // Formatting
        let displayResult = parseFloat(result.toFixed(2));
        targetOutput.value = displayResult;

        updateReferenceList(inMl, density, isDefaultPreview);
    }

    function updateReferenceList(inMl, density, isPreview) {
        // Clear current
        referenceList.innerHTML = '';

        const refs = [
            { unit: 'tbsp', label: '大さじ', ml: 15 },
            { unit: 'tsp', label: '小さじ', ml: 5 },
            { unit: 'cup', label: 'カップ', ml: 200 },
            { unit: 'ml', label: 'cc (ml)', ml: 1 },
            { unit: 'g', label: 'グラム', ml: 1 }
        ];

        // Create a DocumentFragment to minimize reflows
        const fragment = document.createDocumentFragment();

        refs.forEach(r => {
            // Don't show if it's the target unit (redundant)
            if (targetUnitSelect.value === r.unit) return;

            let val;
            if (r.unit === 'g') {
                val = inMl * density; // ml -> g
            } else {
                val = inMl / r.ml;
            }
            let valStr = parseFloat(val.toFixed(2));

            const span = document.createElement('span');
            span.className = 'ref-item';
            if (isPreview) span.classList.add('placeholder-text');
            span.textContent = `${r.label}: ${valStr}`;
            fragment.appendChild(span);
        });

        referenceList.appendChild(fragment);
    }

    function formatNumber(num) {
        // Round to up to 2 decimals, discard trailing zeros
        return Math.round(num * 100) / 100;
    }

    function resetAll() {
        sourceInput.value = '';
        // Reset placeholders/previews handled by calculate()
        // But we need to reset units too? Usually reset button clears values.
        // sourceUnitSelect.value = 'ml';
        // targetUnitSelect.value = 'cup';
        // We can keep current units or reset to defaults.
        // Let's just clear input.
        calculate();
    }

    // Event Listeners
    if (sourceInput) sourceInput.addEventListener('input', calculate);
    if (ingredientSelect) ingredientSelect.addEventListener('change', calculate);

    // Note: Unit selects (sourceUnitSelect, targetUnitSelect) are handled by custom select logic
    // which triggers the change event on the hidden original select.

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            resetAll();
        });
    }

    // Initialize
    if (sourceInput) calculate();

    // --- Custom Select Implementation (Updated for Interactivity) ---
    function setupCustomSelects() {
        const selects = document.querySelectorAll('.unit-select');

        selects.forEach(select => {
            // Check if wrapper already exists (re-run safety)
            if (select.nextElementSibling && select.nextElementSibling.classList.contains('custom-select-wrapper')) {
                return;
            }

            // Create Wrapper
            const wrapper = document.createElement('div');
            wrapper.className = 'custom-select-wrapper';
            wrapper.dataset.forId = select.id; // Mark which select this belongs to

            // Create Trigger
            const trigger = document.createElement('div');
            trigger.className = 'custom-select-trigger';
            trigger.textContent = select.options[select.selectedIndex].text;

            // Create Options Container
            const startUnit = select.value;
            const optionsContainer = document.createElement('div');
            optionsContainer.className = 'custom-options';
            optionsContainer.dataset.forId = select.id;

            // Build options from original select
            Array.from(select.options).forEach(option => {
                const optDiv = document.createElement('div');
                optDiv.className = 'custom-option';
                optDiv.textContent = option.text;
                optDiv.dataset.value = option.value;

                if (option.value === startUnit) {
                    optDiv.classList.add('selected');
                }

                optDiv.addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent bubbling to wrapper

                    // Update Original Select
                    select.value = option.value;

                    // Update UI
                    trigger.textContent = option.text;
                    wrapper.querySelectorAll('.custom-option').forEach(o => o.classList.remove('selected'));
                    optDiv.classList.add('selected');

                    // Close dropdown
                    optionsContainer.classList.remove('open');

                    // Trigger calculation
                    calculate();

                    // ** NEW: Handle Exclusive Logic **
                    if (select.id === 'source-unit') {
                        updateTargetAvailability(option.value);
                    }
                });

                optionsContainer.appendChild(optDiv);
            });

            // Toggle Dropdown
            wrapper.appendChild(trigger);
            wrapper.appendChild(optionsContainer);

            // Insert after the original select
            select.parentNode.insertBefore(wrapper, select.nextSibling);

            // Event listener for Wrapper
            wrapper.addEventListener('click', (e) => {
                e.stopPropagation(); // Stop bubble

                // Close other open dropdowns
                document.querySelectorAll('.custom-options.open').forEach(el => {
                    if (el !== optionsContainer) el.classList.remove('open');
                });

                optionsContainer.classList.toggle('open');
            });
        });

        if (sourceUnitSelect) updateTargetAvailability(sourceUnitSelect.value);

        // Initial calculation for placeholder
        if (sourceInput) calculate();

        // Close dropdowns when clicking outside
        document.addEventListener('click', () => {
            document.querySelectorAll('.custom-options.open').forEach(el => el.classList.remove('open'));
        });
    }

    // Function to hide Source unit from Target dropdown
    function updateTargetAvailability(sourceUnitVal) {
        const targetWrapper = document.querySelector('.custom-select-wrapper[data-for-id="target-unit"]');
        if (!targetWrapper) return; // Should not happen

        const targetOptions = targetWrapper.querySelectorAll('.custom-option');
        let currentTargetVal = targetUnitSelect.value;
        let collision = false;

        targetOptions.forEach(opt => {
            if (opt.dataset.value === sourceUnitVal) {
                opt.classList.add('hidden'); // Hide duplicate unit
                if (currentTargetVal === sourceUnitVal) {
                    collision = true;
                }
            } else {
                opt.classList.remove('hidden');
            }
        });

        // If the current target matches the new source, we must switch the target!
        if (collision) {
            // Find first visible option
            const firstVisible = Array.from(targetOptions).find(o => !o.classList.contains('hidden'));
            if (firstVisible) {
                const newVal = firstVisible.dataset.value;
                targetUnitSelect.value = newVal;
                // Update visual trigger
                const trigger = targetWrapper.querySelector('.custom-select-trigger');
                trigger.textContent = firstVisible.textContent;
                // Update selected class
                targetOptions.forEach(o => o.classList.remove('selected'));
                firstVisible.classList.add('selected');

                calculate(); // Recalc with new target
            }
        }
    }

    // Initialize Custom Selects
    setupCustomSelects();


    // --- Recipe Scaler Logic ---
    const originalServingsInput = document.getElementById('original-servings');
    const desiredServingsInput = document.getElementById('desired-servings');
    const recipeInput = document.getElementById('recipe-input');
    const recipeOutput = document.getElementById('recipe-output');
    const copyBtn = document.getElementById('copy-recipe-btn');
    const scalerNote = document.getElementById('scaler-note');

    let rAFPending = false;

    function scaleRecipe() {
        if (rAFPending) return;
        rAFPending = true;

        requestAnimationFrame(() => {
            const original = parseFloat(originalServingsInput.value);
            const desired = parseFloat(desiredServingsInput.value);
            const text = recipeInput.value;

            if (!original || !desired || original <= 0 || desired <= 0) {
                recipeOutput.value = "人数を正しく入力してね！";
                rAFPending = false;
                return;
            }

            const ratio = desired / original;
            let hasFraction = false;

            const lines = text.split('\n');
            const scaledLines = lines.map(line => {
                return line.replace(/(\d+(\.\d+)?)/g, (match) => {
                    const num = parseFloat(match);
                    if (!isNaN(num)) {
                        let scaled = num * ratio;
                        if (Math.abs(scaled - Math.round(scaled)) < 0.05) {
                            scaled = Math.round(scaled);
                        } else {
                            scaled = parseFloat(scaled.toFixed(1));
                            hasFraction = true;
                        }
                        return scaled;
                    }
                    return match;
                });
            });

            recipeOutput.value = scaledLines.join('\n');

            if (hasFraction) {
                scalerNote.classList.remove('hidden');
            } else {
                scalerNote.classList.add('hidden');
            }
            rAFPending = false;
        });
    }

    // Event Listeners for Scaler
    [originalServingsInput, desiredServingsInput, recipeInput].forEach(el => {
        if (el) el.addEventListener('input', scaleRecipe);
    });

    // Handle +/- Buttons
    document.querySelectorAll('.ctrl-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent focus issues
            const targetId = btn.dataset.target;
            const input = document.getElementById(targetId);
            let val = parseInt(input.value) || 0;

            if (btn.classList.contains('plus')) {
                val++;
            } else if (btn.classList.contains('minus')) {
                val = Math.max(1, val - 1); // Minimum 1
            }

            input.value = val;
            scaleRecipe(); // Trigger logic
        });
    });

    // Copy Button
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            recipeOutput.select();
            document.execCommand('copy'); // Legacy but works widely, or use navigator.clipboard
            const originalText = copyBtn.textContent;
            copyBtn.textContent = 'コピーしました！';
            setTimeout(() => {
                copyBtn.textContent = originalText;
            }, 2000);
        });
    }

    // --- Tube Converter Logic ---
    const tubeSourceInput = document.getElementById('tube-source-input');
    const tubeSpiceType = document.getElementById('tube-spice-type');
    const tubeResultText = document.getElementById('tube-result-text');
    const tubeVisualIndicator = document.getElementById('tube-visual-indicator');

    function calculateTube() {
        if (!tubeSourceInput) return; // Only run on tube-spices.html

        const val = parseFloat(tubeSourceInput.value);
        const type = tubeSpiceType.value;
        const unit = document.querySelector('input[name="tube-unit"]:checked').value;

        if (isNaN(val) || val <= 0) {
            tubeResultText.innerHTML = "数値を入力してね！";
            tubeVisualIndicator.style.width = "0%";
            return;
        }

        let piece = 0, cm = 0, g = 0;

        if (type === 'garlic') {
            // garlic: 1 piece = 5cm = 6g
            switch (unit) {
                case 'piece': piece = val; cm = val * 5; g = val * 6; break;
                case 'cm': piece = val / 5; cm = val; g = val * (6 / 5); break;
                case 'g': piece = val / 6; cm = val * (5 / 6); g = val; break;
            }
        } else {
            // ginger: 1cm = 1g (piece not defined for ginger calculation)
            switch (unit) {
                case 'piece': piece = val; cm = val * 4; g = val * 4; break; // Assume 1 piece = 4cm for ginger
                case 'cm': piece = val / 4; cm = val; g = val; break;
                case 'g': piece = val / 4; cm = val; g = val; break;
            }
        }

        const p = formatNumber(piece);
        const c = formatNumber(cm);
        const gr = formatNumber(g);

        if (type === 'garlic') {
            tubeResultText.innerHTML = `🧄 <strong>${p}片</strong> は<br>チューブなら <strong>約${c}cm</strong> (約${gr}g)`;
        } else {
            tubeResultText.innerHTML = `<strong>約${c}cm</strong> (約${gr}g)<br><span style="font-size: 0.8em; color: #666;">（およそ ${p}かけ分）</span>`;
        }

        // Set width for indicator (capped at 5cm for visualization)
        const indicatorWidth = Math.min((cm / 5) * 100, 100);
        tubeVisualIndicator.style.width = indicatorWidth + "%";
    }

    if (tubeSourceInput) {
        tubeSourceInput.addEventListener('input', calculateTube);
        tubeSpiceType.addEventListener('change', calculateTube);
        document.querySelectorAll('input[name="tube-unit"]').forEach(radio => {
            radio.addEventListener('change', calculateTube);
        });

        // Initial calculation
        calculateTube();
    }

    // Amazon Click Tracking
    document.querySelectorAll('.amazon-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
                'event': 'amazon_click',
                'button_location': document.title // Which page the button was on
            });
        });
    });
});
