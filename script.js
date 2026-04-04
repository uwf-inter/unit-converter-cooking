window.initApp = function() {
    // Specific Gravity Data (g/ml) - Move to global scope
    window.INGREDIENT_DATA = {
        'none': { density: 1.0, name: '', icon: '💧' },
        'shoyu': { density: 1.2, name: '醤油', icon: '🧂' },
        'sake': { density: 1.0, name: '酒', icon: '🍶' },
        'mirin': { density: 1.2, name: 'みりん', icon: '🍶' },
        'sugar': { density: 0.6, name: '砂糖', icon: '🧂' },
        'flour': { density: 0.5, name: '小麦粉/片栗粉', icon: '🥣' },
        'butter': { density: 0.8, name: 'バター', icon: '🧈' },
        'rice': { density: 0.8, name: 'お米', icon: '🍚' },
        'ap-flour': { density: 0.52, name: '中力粉 (All-purpose)', icon: '🥣' },
        'brown-sugar': { density: 0.83, name: 'ブラウンシュガー (Packed)', icon: '🧂' }
    };

    // Quick Conversion Board Elements
    const quickInput = document.getElementById('quick-input');
    const quickUnit = document.getElementById('quick-unit');
    const ingredientChips = document.querySelectorAll('.ingredient-chip');
    const ingredientToggle = document.getElementById('ingredient-toggle');
    const ingredientPanel = document.getElementById('ingredient-panel');
    const currentStatus = document.getElementById('current-status');
    const seoDl = document.getElementById('seo-dl');
    const dynamicStructuredData = document.getElementById('dynamic-structured-data');
    
    // Current ingredient state
    let currentIngredient = 'none';
    
    // Toggle ingredient panel
    if (ingredientToggle && ingredientPanel) {
        // Initialize panel state
        ingredientPanel.hidden = true;
        ingredientToggle.setAttribute('aria-expanded', 'false');
        
        ingredientToggle.addEventListener('click', () => {
            const isExpanded = ingredientToggle.getAttribute('aria-expanded') === 'true';
            const toggleIcon = ingredientToggle.querySelector('.toggle-icon');
            
            console.log('Toggle clicked, isExpanded:', isExpanded); // Debug log
            
            if (isExpanded) {
                ingredientPanel.hidden = true;
                ingredientToggle.setAttribute('aria-expanded', 'false');
                if (toggleIcon) toggleIcon.textContent = '▼';
            } else {
                ingredientPanel.hidden = false;
                ingredientToggle.setAttribute('aria-expanded', 'true');
                if (toggleIcon) toggleIcon.textContent = '▲';
                
                // Add animation class
                ingredientPanel.style.animation = 'slideDown 0.3s ease';
            }
        });
    }
    
    // Update status display
    function updateStatusDisplay() {
        if (!currentStatus) return;
        
        const ingredientData = window.INGREDIENT_DATA[currentIngredient];
        if (!ingredientData) return;
        
        const ingredientName = ingredientData.name;
        const density = ingredientData.density;
        const icon = ingredientData.icon;
        
        if (currentIngredient === 'none') {
            currentStatus.querySelector('.status-text').textContent = '💧 水（比重1.0）を基準に計算中';
        } else {
            currentStatus.querySelector('.status-text').textContent = `${icon} ${ingredientName}（比重${density}）で計算中`;
        }
    }
    
    // Quick Conversion Function
    function calculateQuickConversion() {
        if (!quickInput || !quickUnit) return;
        
        const value = parseFloat(quickInput.value) || 0;
        const sourceUnit = quickUnit.value;
        const ingredientData = window.INGREDIENT_DATA[currentIngredient];
        
        if (!ingredientData) return;
        
        const density = ingredientData.density;
        const ingredientName = ingredientData.name;
        
        if (value === 0) {
            clearQuickResults();
            return;
        }
        
        // 1. Convert to base ml
        let baseMl = 0;
        switch (sourceUnit) {
            case 'g': baseMl = value / density; break;
            case 'oz': baseMl = (value * 28.35) / density; break;
            case 'ml': baseMl = value; break;
            case 'cup': baseMl = value * 200; break;
            case 'tbsp': baseMl = value * 15; break;
            case 'tsp': baseMl = value * 5; break;
            case 'us-cup': baseMl = value * 236.59; break;
            case 'uk-cup': baseMl = value * 284.13; break;
            default: baseMl = value;
        }
        
        // 2. Calculate all conversions
        const conversions = {
            volume: {
                ml: baseMl,
                cup: baseMl / 200,
                us_cup: baseMl / 236.59,
                uk_cup: baseMl / 284.13,
                tbsp: baseMl / 15,
                tsp: baseMl / 5
            },
            mass: {
                g: baseMl * density,
                oz: (baseMl * density) / 28.35,
                lb: (baseMl * density) / 453.59
            }
        };
        
        // 3. Update UI
        updateQuickResults(conversions, value, sourceUnit, ingredientName);
        
        // 4. Update SEO
        updateSEOStructure(conversions, value, sourceUnit, ingredientName);
    }
    
    // Update Quick Results UI
    function updateQuickResults(conversions, inputValue, inputUnit, ingredientName) {
        // Volume Card
        const volMl = document.getElementById('vol-ml');
        const volCup = document.getElementById('vol-cup');
        if (volMl) volMl.textContent = formatNumber(conversions.volume.ml);
        if (volCup) volCup.textContent = formatNumber(conversions.volume.cup);
        
        // Mass Card
        const massG = document.getElementById('mass-g');
        const massOz = document.getElementById('mass-oz');
        if (massG) massG.textContent = formatNumber(conversions.mass.g);
        if (massOz) massOz.textContent = formatNumber(conversions.mass.oz);
        
        // Tools Card
        const toolsTbsp = document.getElementById('tools-tbsp');
        const toolsTsp = document.getElementById('tools-tsp');
        if (toolsTbsp) toolsTbsp.textContent = formatNumber(conversions.volume.tbsp);
        if (toolsTsp) toolsTsp.textContent = formatNumber(conversions.volume.tsp);
        
        // International Card
        const intUsCup = document.getElementById('int-us-cup');
        const intUkCup = document.getElementById('int-uk-cup');
        if (intUsCup) intUsCup.textContent = formatNumber(conversions.volume.us_cup);
        if (intUkCup) intUkCup.textContent = formatNumber(conversions.volume.uk_cup);
    }
    
    // Clear Quick Results
    function clearQuickResults() {
        const resultElements = document.querySelectorAll('.result-card .value');
        resultElements.forEach(el => el.textContent = '-');
        
        if (seoDl) seoDl.innerHTML = '';
        if (dynamicStructuredData) {
            dynamicStructuredData.textContent = JSON.stringify({
                "@context": "https://schema.org",
                "@type": "FAQPage",
                "mainEntity": []
            });
        }
    }
    
    // Update SEO Structure
    function updateSEOStructure(conversions, inputValue, inputUnit, ingredientName) {
        if (!seoDl || !dynamicStructuredData) return;
        
        const unitLabels = {
            'tbsp': '大さじ',
            'tsp': '小さじ',
            'cup': 'カップ',
            'ml': 'ml',
            'g': 'g',
            'us-cup': 'USカップ',
            'uk-cup': 'UKカップ',
            'oz': 'oz'
        };
        
        const inputLabel = unitLabels[inputUnit] || inputUnit;
        const ingredientSuffix = ingredientName ? `（${ingredientName}）` : '';
        
        // Create DL structure
        let dlHtml = '';
        const faqData = [];
        
        // Add main conversion pairs
        const mainConversions = [
            { unit: 'ml', value: conversions.volume.ml },
            { unit: 'g', value: conversions.mass.g },
            { unit: 'cup', value: conversions.volume.cup },
            { unit: 'tbsp', value: conversions.volume.tbsp },
            { unit: 'tsp', value: conversions.volume.tsp },
            { unit: 'us-cup', value: conversions.volume.us_cup },
            { unit: 'uk-cup', value: conversions.volume.uk_cup },
            { unit: 'oz', value: conversions.mass.oz }
        ];
        
        mainConversions.forEach(conv => {
            if (conv.value > 0) {
                const label = unitLabels[conv.unit];
                dlHtml += `<dt>${inputLabel}${inputValue}${ingredientSuffix}</dt>`;
                dlHtml += `<dd>${formatNumber(conv.value)}${label}</dd>`;
                
                faqData.push({
                    "@type": "Question",
                    "name": `${inputLabel}${inputValue}${ingredientSuffix}は何${label}？`,
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": `${inputLabel}${inputValue}${ingredientSuffix}は${formatNumber(conv.value)}${label}です`
                    }
                });
            }
        });
        
        seoDl.innerHTML = dlHtml;
        
        // Update JSON-LD
        dynamicStructuredData.textContent = JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqData
        });
    }
    
    // Ingredient chip handlers
    if (ingredientChips.length > 0) {
        console.log('Found ingredient chips:', ingredientChips.length); // Debug log
        
        ingredientChips.forEach(chip => {
            chip.addEventListener('click', () => {
                const ingredient = chip.dataset.ingredient;
                console.log('Chip clicked:', ingredient); // Debug log
                
                currentIngredient = ingredient;
                
                // Update active state
                ingredientChips.forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                
                // Update status display
                updateStatusDisplay();
                
                // Recalculate with new ingredient
                calculateQuickConversion();
            });
        });
    } else {
        console.log('No ingredient chips found'); // Debug log
    }
    
    // Input event listeners
    if (quickInput) {
        quickInput.addEventListener('input', calculateQuickConversion);
        quickInput.addEventListener('keyup', calculateQuickConversion);
    }
    
    if (quickUnit) {
        quickUnit.addEventListener('change', calculateQuickConversion);
    }
    
    // Format number helper
    function formatNumber(num) {
        if (isNaN(num)) return '-';
        
        // Round to appropriate precision
        if (num < 0.01) return num.toFixed(3);
        if (num < 1) return num.toFixed(2);
        if (num < 10) return num.toFixed(1);
        return Math.round(num);
    }

    // Initialize status display and default calculation
    updateStatusDisplay();
    
    // Debug: Check if elements exist
    console.log('Quick elements found:', {
        quickInput: !!quickInput,
        quickUnit: !!quickUnit,
        ingredientToggle: !!ingredientToggle,
        ingredientPanel: !!ingredientPanel,
        ingredientChips: ingredientChips.length
    });
    
    if (quickInput) {
        // Set default value to trigger initial calculation
        quickInput.value = '1';
        calculateQuickConversion();
    }

    // DOM Elements (Legacy - keeping for compatibility)
    const sourceInput = document.getElementById('source-input');
    const sourceUnitSelect = document.getElementById('source-unit');
    const targetOutput = document.getElementById('target-output');
    const targetUnitSelect = document.getElementById('target-unit');
    const ingredientSelect = document.getElementById('ingredient-select');
    const densityMsg = document.getElementById('density-msg');
    const referenceList = document.getElementById('reference-list');
    const resetBtn = document.getElementById('reset-btn');

    // Unit definitions
    const units = {
        'ml': { type: 'volume', factor: 1, label: 'cc (ml)' },
        'cup': { type: 'volume', factor: 200, label: 'カップ' },
        'tbsp': { type: 'volume', factor: 15, label: '大さじ' },
        'tsp': { type: 'volume', factor: 5, label: '小さじ' },
        'g': { type: 'mass', factor: 1, label: 'g' },
        'us-cup': { type: 'volume', factor: 236.59, label: 'USカップ' },
        'uk-cup': { type: 'volume', factor: 284.13, label: 'UKカップ' },
        'us-fl-oz': { type: 'volume', factor: 29.57, label: 'US液量オンス (fl oz)' },
        'oz': { type: 'mass', factor: 28.35, label: 'オンス (oz)' },
        'lb': { type: 'mass', factor: 453.59, label: 'ポンド (lb)' },
        'celsius': { type: 'temp', label: '摂氏 (°C)' },
        'fahrenheit': { type: 'temp', label: '華氏 (°F)' }
    };

    // Default values for each unit
    const defaultValues = {
        'g': 100,
        'ml': 100,
        'cup': 1,
        'tbsp': 1,
        'tsp': 1,
        'us-cup': 1,
        'uk-cup': 1,
        'oz': 1,
        'lb': 1,
        'us-fl-oz': 1,
        'celsius': 180,
        'fahrenheit': 350
    };

    // --- Legacy Functions (keeping for compatibility) ---
    // Calculate conversion
    function calculate() {
        if (!sourceInput || !sourceUnitSelect || !targetUnitSelect || !ingredientSelect) return;

        // Handle "Smart Default/Preview" Logic
        let val = parseFloat(sourceInput.value);
        let isDefaultPreview = false;

        const sourceUnit = sourceUnitSelect.value;
        const targetUnit = targetUnitSelect.value;
        const ingredientKey = ingredientSelect.value;
        const density = window.INGREDIENT_DATA[ingredientKey].density;
        const ingredientName = window.INGREDIENT_DATA[ingredientKey].name;

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

        // Detect Unit Types
        const sourceUnitType = units[sourceUnit].type;
        const targetUnitType = units[targetUnit].type;

        // Handle Temperature (Special Non-linear Case)
        if (sourceUnitType === 'temp' || targetUnitType === 'temp') {
            if (sourceUnitType !== targetUnitType) {
                targetOutput.value = "温度同士で選んでね";
                return;
            }
            let res = 0;
            if (sourceUnit === 'celsius' && targetUnit === 'fahrenheit') {
                res = (val * 9 / 5) + 32;
            } else if (sourceUnit === 'fahrenheit' && targetUnit === 'celsius') {
                res = (val - 32) * 5 / 9;
            } else {
                res = val;
            }
            targetOutput.value = formatNumber(res);
            referenceList.innerHTML = ''; // Hide suggestions for temp
            return;
        }

        // 1. Convert source to base unit: ml (volume) or g (mass)
        let baseVal = 0;
        let baseType = sourceUnitType;

        switch (sourceUnit) {
            case 'g': baseVal = val; break;
            case 'oz': baseVal = val * 28.35; break;
            case 'lb': baseVal = val * 453.59; break;
            case 'ml': baseVal = val; break;
            case 'cup': baseVal = val * 200; break;
            case 'tbsp': baseVal = val * 15; break;
            case 'tsp': baseVal = val * 5; break;
            case 'us-cup': baseVal = val * 236.59; break;
            case 'uk-cup': baseVal = val * 284.13; break;
            case 'us-fl-oz': baseVal = val * 29.57; break;
        }

        // 2. Handle Volume/Mass Mixed Conversion via density
        let finalMl = 0;
        if (sourceUnitType === 'mass') {
            finalMl = baseVal / density;
        } else {
            finalMl = baseVal;
        }

        // 3. Convert from finalMl to target
        let result = 0;
        if (targetUnitType === 'mass') {
            let targetG = finalMl * density;
            switch (targetUnit) {
                case 'g': result = targetG; break;
                case 'oz': result = targetG / 28.35; break;
                case 'lb': result = targetG / 453.59; break;
            }
        } else {
            switch (targetUnit) {
                case 'ml': result = finalMl; break;
                case 'cup': result = finalMl / 200; break;
                case 'tbsp': result = finalMl / 15; break;
                case 'tsp': result = finalMl / 5; break;
                case 'us-cup': result = finalMl / 236.59; break;
                case 'uk-cup': result = finalMl / 284.13; break;
                case 'us-fl-oz': result = finalMl / 29.57; break;
            }
        }

        // Formatting
        let displayResult = formatNumber(result);
        targetOutput.value = displayResult;

        updateReferenceList(finalMl, density, isDefaultPreview);
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

                    // Trigger calculations
                    if (typeof calculate === 'function') calculate();
                    if (typeof calculateCap === 'function' && select.id === 'sub-unit') calculateCap();

                    // Dispatch change event for other listeners
                    select.dispatchEvent(new Event('change'));

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

    // --- Baking Calculator Logic ---
    const bakingRatioResult = document.getElementById('baking-ratio-result');
    const shapeBtns = document.querySelectorAll('.shape-btn');
    const roundInputs = document.getElementById('round-inputs');
    const squareInputs = document.getElementById('square-inputs');

    let currentShape = 'round';
    let currentRatio = 1.0;

    function calculateBakingRatio() {
        if (!bakingRatioResult) return;

        let recipeArea = 1;
        let myArea = 1;

        if (currentShape === 'round') {
            const rd = parseFloat(document.getElementById('recipe-diameter').value) || 1;
            const md = parseFloat(document.getElementById('my-diameter').value) || 1;
            recipeArea = Math.pow(rd / 2, 2) * Math.PI;
            myArea = Math.pow(md / 2, 2) * Math.PI;
        } else {
            const rw = parseFloat(document.getElementById('recipe-width').value) || 1;
            const rh = parseFloat(document.getElementById('recipe-height').value) || 1;
            const mw = parseFloat(document.getElementById('my-width').value) || 1;
            const mh = parseFloat(document.getElementById('my-height').value) || 1;
            recipeArea = rw * rh;
            myArea = mw * mh;
        }

        currentRatio = myArea / recipeArea;
        bakingRatioResult.textContent = formatNumber(currentRatio) + '倍';

        updateSimulator();
    }

    function updateSimulator() {
        const simulatorRows = document.querySelectorAll('.simulator-row');
        simulatorRows.forEach(row => {
            const input = row.querySelector('.sim-input');
            const unitSelect = row.querySelector('.sim-unit-select');
            const resultNode = row.querySelector('.sim-result');
            const resultUnit = row.querySelector('.sim-unit');
            const val = parseFloat(input.value);

            if (unitSelect && resultUnit) {
                resultUnit.textContent = unitSelect.value;
            }

            if (isNaN(val)) {
                resultNode.textContent = '-';
            } else {
                resultNode.textContent = formatNumber(val * currentRatio);
            }
        });
    }

    const addRowBtn = document.getElementById('add-sim-row');
    const simulatorRowsContainer = document.getElementById('simulator-rows');

    if (addRowBtn && simulatorRowsContainer) {
        addRowBtn.addEventListener('click', () => {
            const newRow = document.createElement('div');
            newRow.className = 'simulator-row';
            newRow.innerHTML = `
                <input type="number" class="sim-input" placeholder="100" inputmode="decimal">
                <select class="sim-unit-select">
                    <option value="g" selected>g</option>
                    <option value="ml">ml</option>
                    <option value="個">個</option>
                    <option value="枚">枚</option>
                    <option value="本">本</option>
                    <option value="大さじ">大さじ</option>
                    <option value="小さじ">小さじ</option>
                </select>
                <span class="sim-arrow">→</span>
                <span class="sim-result">-</span>
                <span class="sim-unit">g</span>
            `;
            simulatorRowsContainer.appendChild(newRow);

            // Attach listeners to new row
            const input = newRow.querySelector('.sim-input');
            const select = newRow.querySelector('.sim-unit-select');
            input.addEventListener('input', updateSimulator);
            select.addEventListener('change', updateSimulator);
        });

        // Initialize existing inputs/selects
        document.querySelectorAll('.sim-input, .sim-unit-select').forEach(el => {
            el.addEventListener(el.tagName === 'SELECT' ? 'change' : 'input', updateSimulator);
        });
    }

    if (bakingRatioResult) {
        shapeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                shapeBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentShape = btn.dataset.shape;

                if (currentShape === 'round') {
                    roundInputs.style.display = 'block';
                    squareInputs.style.display = 'none';
                } else {
                    roundInputs.style.display = 'none';
                    squareInputs.style.display = 'block';
                }
                calculateBakingRatio();
            });
        });

        // Attach input listeners to all baking inputs
        const allBakingInputs = document.querySelectorAll('.baking-input-group input, .sim-input');
        allBakingInputs.forEach(input => {
            input.addEventListener('input', () => {
                if (input.classList.contains('sim-input')) {
                    updateSimulator();
                } else {
                    calculateBakingRatio();
                }
            });
        });

        // Initial calc
        calculateBakingRatio();
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
    });    // --- Substitute Measuring Logic ---
    const pastaCircle = document.getElementById('pasta-circle');
    const pastaBtns = document.querySelectorAll('[data-pasta]');
    const subInput = document.getElementById('sub-input');
    const subUnit = document.getElementById('sub-unit');
    const capResult = document.getElementById('cap-result');
    const calPlus = document.getElementById('cal-plus');
    const calMinus = document.getElementById('cal-minus');

    // Display scale factor (default heuristic for high-DPI mobile)
    let ppiScale = parseFloat(localStorage.getItem('measuring_ppi_scale')) || 1.6;
    let currentPastaType = '100';

    function updatePastaSize() {
        if (!pastaCircle) return;
        // Standard mm to px at 96dpi is ~3.78. 
        // We multiply by our calibration scale.
        const baseMm = currentPastaType === '100' ? 23 : 32.5;
        const px = baseMm * 3.78 * ppiScale;

        pastaCircle.style.width = px + 'px';
        pastaCircle.style.height = px + 'px';
        pastaCircle.textContent = currentPastaType + 'g';

        const note = document.getElementById('pasta-real-size-note');
        if (note) {
            if (currentPastaType === '100') {
                note.textContent = '※10円玉と同じサイズに合わせてください';
            } else {
                note.textContent = '※10円玉2枚分より一回り小さいサイズ';
            }
        }
    }

    if (pastaCircle) {
        pastaBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                pastaBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentPastaType = btn.dataset.pasta;
                updatePastaSize();
            });
        });

        calPlus.addEventListener('click', () => {
            ppiScale += 0.05;
            localStorage.setItem('measuring_ppi_scale', ppiScale);
            updatePastaSize();
        });

        calMinus.addEventListener('click', () => {
            ppiScale -= 0.05;
            if (ppiScale < 0.5) ppiScale = 0.5;
            localStorage.setItem('measuring_ppi_scale', ppiScale);
            updatePastaSize();
        });

        updatePastaSize();
    }

    function calculateCap() {
        if (!capResult || !subInput) return;
        const val = parseFloat(subInput.value) || 0;
        const unit = subUnit.value;
        let ml = val;

        if (unit === 'tbsp') ml = val * 15;
        if (unit === 'tsp') ml = val * 5;

        const cups = ml / 7.5;
        capResult.textContent = parseFloat(cups.toFixed(1)) + '杯分';
    }

    if (subInput && subUnit) {
        // Use multiple events for maximum reactivity on mobile
        ['input', 'keyup', 'change', 'blur'].forEach(ev => {
            subInput.addEventListener(ev, calculateCap);
        });

        subUnit.addEventListener('change', calculateCap);
        // Initial calc
        calculateCap();
    }

    // Global Matrix Conversion Functions
    window.GlobalMatrix = {
        // Country-specific cup volumes in ml
        cupVolumes: {
            jp: 200,    // Japan
            us: 236.59,  // US
            uk: 284.13   // UK (also Australia, Canada)
        },

        // Ingredient density data (g/ml)
        ingredientDensities: {
            'flour-cake': 0.55,      // 薄力粉
            'flour-bread': 0.58,     // 強力粉
            'flour-all': 0.55,       // 中力粉
            'sugar-white': 0.85,     // 上白糖
            'sugar-granulated': 0.8, // グラニュー糖
            'cornstarch': 0.55,      // 片栗粉
            'cocoa': 0.4,            // ココア
            'panko': 0.2,            // パン粉
            'butter': 0.9,           // バター
            'oil': 0.9,              // 油
            'honey': 1.4,            // はちみつ
            'maple': 1.3,            // メープルシロップ
            'water': 1.0,            // 水
            'milk': 1.03,            // 牛乳
            'soy-sauce': 1.2,        // 醤油
            'sake': 1.0,             // 酒
            'mirin': 1.2             // みりん
        },

        // Convert between units for specific ingredient and country
        convert: function(value, fromUnit, toUnit, ingredientType, country = 'jp') {
            const density = this.ingredientDensities[ingredientType] || 1.0;
            
            // Convert to grams first
            let grams = this.toGrams(value, fromUnit, ingredientType, country);
            
            // Convert from grams to target unit
            return this.fromGrams(grams, toUnit, ingredientType, country);
        },

        // Convert any unit to grams
        toGrams: function(value, unit, ingredientType, country = 'jp') {
            const density = this.ingredientDensities[ingredientType] || 1.0;
            
            switch(unit) {
                case 'g':
                    return value;
                case 'oz':
                    return value * 28.35;
                case 'ml':
                    return value * density;
                case 'cup':
                    return value * this.cupVolumes[country] * density;
                case 'tbsp':
                    return value * 15 * density;
                case 'tsp':
                    return value * 5 * density;
                default:
                    return value;
            }
        },

        // Convert grams to any unit
        fromGrams: function(grams, unit, ingredientType, country = 'jp') {
            const density = this.ingredientDensities[ingredientType] || 1.0;
            
            switch(unit) {
                case 'g':
                    return grams;
                case 'oz':
                    return grams / 28.35;
                case 'ml':
                    return grams / density;
                case 'cup':
                    return grams / (this.cupVolumes[country] * density);
                case 'tbsp':
                    return grams / (15 * density);
                case 'tsp':
                    return grams / (5 * density);
                default:
                    return grams;
            }
        },

        // Get cup weight for ingredient in specific country
        getCupWeight: function(ingredientType, country = 'jp') {
            const density = this.ingredientDensities[ingredientType] || 1.0;
            return this.cupVolumes[country] * density;
        },

        // Format number with appropriate precision
        formatNumber: function(num, decimals = 1) {
            return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
        }
    };

    // Auto-populate matrix data if on global-matrix page
    if (window.location.pathname.includes('global-matrix.html')) {
        // Add any matrix-specific initialization here
        console.log('Global Matrix loaded with conversion functions');
    }

    // No-Scale Measuring Data
    window.NoScaleMeasuring = {
        // Everyday items for weight reference
        everydayItems: {
            'egg': { weight: 50, name: '卵', unit: '個' },
            'smartphone': { weight: 180, name: 'スマホ', unit: '台' },
            'battery-aaa': { weight: 23, name: '単3電池', unit: '本' },
            'coin-100': { weight: 4.5, name: '100円玉', unit: '枚' },
            'coin-10': { weight: 4.5, name: '10円玉', unit: '枚' },
            'coin-1': { weight: 1.0, name: '1円玉', unit: '枚' }
        },

        // Container volume data
        containers: {
            'mug-small': { volume: 200, name: 'マグカップ（小）', unit: '杯' },
            'mug-standard': { volume: 300, name: 'マグカップ（標準）', unit: '杯' },
            'paper-cup': { volume: 205, name: '紙コップ', unit: '杯' },
            'soup-bowl': { volume: 200, name: '汁椀', unit: '杯' },
            'rice-bowl': { volume: 250, name: 'ご飯茶碗', unit: '杯' },
            'pet-bottle-cap': { volume: 7.5, name: 'ペットボトルキャップ', unit: '個' }
        },

        // Visual measurement guides
        visualGuides: {
            'finger-first-joint': { volume: 5, name: '人差し指第一関節まで', description: '小さじ1相当' },
            'finger-circle': { volume: 15, name: '親指と人差し指で輪', description: '大さじ1相当' },
            'two-fingers-pinch': { weight: 0.3, name: '指2本でつまむ', description: '少々' },
            'three-fingers-pinch': { weight: 1.0, name: '指3本でつまむ', description: 'ひとつまみ' },
            'hand-flat': { weight: 17, name: '手のひら一杯（平ら）', description: '粉類15-20g' },
            'hand-heaped': { weight: 27, name: '手のひら一杯（山盛り）', description: '粉類25-30g' }
        },

        // Convert grams to everyday items
        convertToEverydayItems: function(grams, itemType = 'egg') {
            const item = this.everydayItems[itemType];
            if (!item) return null;
            
            const count = grams / item.weight;
            return {
                count: count,
                text: `${item.name} ${count.toFixed(1)}${item.unit}分`,
                itemName: item.name,
                unit: item.unit
            };
        },

        // Convert volume to containers
        convertToContainers: function(ml, containerType = 'mug-small') {
            const container = this.containers[containerType];
            if (!container) return null;
            
            const count = ml / container.volume;
            return {
                count: count,
                text: `${container.name} ${count.toFixed(1)}${container.unit}分`,
                containerName: container.name,
                unit: container.unit
            };
        },

        // Get visual guide for measurement
        getVisualGuide: function(targetAmount, unit = 'g') {
            const guides = Object.values(this.visualGuides);
            
            if (unit === 'g') {
                return guides.filter(g => g.weight).find(g => Math.abs(g.weight - targetAmount) < 2);
            } else if (unit === 'ml') {
                return guides.filter(g => g.volume).find(g => Math.abs(g.volume - targetAmount) < 3);
            }
            
            return null;
        },

        // Quick search data
        quickSearchData: {
            '小麦粉100g': '卵2個分、またはマグカップ小さめ1杯弱',
            '小麦粉50g': '卵1個分、またはマグカップ小さめ1/2杯',
            '砂糖100g': '卵2個分、またはマグカップ小さめ0.6杯',
            '砂糖50g': '卵1個分、またはマグカップ小さめ0.3杯',
            'バター100g': '卵2個分、またはマグカップ小さめ0.55杯',
            '塩小さじ1': '指3本でつまんだ量（ひとつまみ）',
            '大さじ1': '親指と人差し指で輪を作った量',
            'カップ1': 'マグカップ小さめ1杯、または汁椀1杯',
            '水200ml': 'マグカップ小さめ1杯、または汁椀1杯'
        },

        // Search quick answers
        searchQuickAnswer: function(query) {
            const lowerQuery = query.toLowerCase();
            
            for (const [key, value] of Object.entries(this.quickSearchData)) {
                if (key.includes(lowerQuery)) {
                    return value;
                }
            }
            
            return null;
        }
    };

    // Microwave Heating Calculator
    window.MicrowaveCalc = {
        // Heating data for different drinks
        drinkData: {
            milk: { targetTemp: 60, specificHeat: 3.93, name: '牛乳' },
            soymilk: { targetTemp: 60, specificHeat: 3.95, name: '豆乳' },
            water: { targetTemp: 60, specificHeat: 4.19, name: '水' },
            coffee: { targetTemp: 65, specificHeat: 4.19, name: 'コーヒー' }
        },

        // Freezing data for different foods
        freezeData: {
            'chicken-breast': { baseTime: 2.0, thickness: 2, name: '鶏むね肉' },
            'chicken-thigh': { baseTime: 2.2, thickness: 2.5, name: '鶏もも肉' },
            'ground-meat': { baseTime: 1.5, thickness: 1, name: 'ひき肉' },
            'block-meat': { baseTime: 3.0, thickness: 3, name: 'ブロック肉' },
            'rice': { baseTime: 2.5, thickness: 2, name: 'ごはん' },
            'bread': { baseTime: 1.8, thickness: 1.5, name: 'パン' }
        },

        // Calculate drink heating time
        calculateDrinkHeating: function(drinkType, amount, startTemp, watt) {
            const data = this.drinkData[drinkType];
            if (!data) return null;

            const tempDiff = data.targetTemp - startTemp;
            const energyNeeded = amount * data.specificHeat * tempDiff; // in Joules
            const timeInSeconds = energyNeeded / (watt * 0.8); // 80% efficiency
            
            return {
                timeInSeconds: timeInSeconds,
                minutes: Math.floor(timeInSeconds / 60),
                seconds: Math.round(timeInSeconds % 60),
                targetTemp: data.targetTemp,
                drinkName: data.name
            };
        },

        // Calculate freezing time
        calculateFreezing: function(foodType, weight, mode, watt) {
            const data = this.freezeData[foodType];
            if (!data) return null;

            const effectiveWatt = mode === 'defrost' ? 200 : watt;
            const baseTime = data.baseTime * (weight / 100);
            const timeInSeconds = (baseTime * 60) * (200 / effectiveWatt);
            
            return {
                timeInSeconds: timeInSeconds,
                minutes: Math.floor(timeInSeconds / 60),
                seconds: Math.round(timeInSeconds % 60),
                foodName: data.name,
                thickness: data.thickness
            };
        },

        // Convert wattage between different microwave powers
        convertWattage: function(originalWatt, originalTime, targetWatt) {
            const convertedTime = originalTime * (originalWatt / targetWatt);
            return {
                convertedTime: convertedTime,
                minutes: Math.floor(convertedTime),
                seconds: Math.round((convertedTime - Math.floor(convertedTime)) * 60),
                ratio: originalWatt / targetWatt
            };
        },

        // Get temperature guide
        getTemperatureGuide: function() {
            return [
                { temp: 40, description: 'ぬるま湯', usage: '赤ちゃんミルク向け' },
                { temp: 60, description: '飲み頃', usage: 'ホットミルク・コーヒー' },
                { temp: 70, description: '熱め', usage: '紅茶・ココア' },
                { temp: 80, description: '注意！', usage: '突沸の可能性' }
            ];
        },

        // Get freezing tips
        getFreezingTips: function(foodType) {
            const data = this.freezeData[foodType];
            if (!data) return [];

            const tips = [
                '薄く切る：厚さ2cm以下で均一に解凍',
                '並べて加熱：重ならないように熱の通りを均一に',
                '途中で裏返す：1-2分ごとにムラ防止',
                '余熱で仕上げ：少し硬いうちに自然解凍と組み合わせ'
            ];

            if (data.thickness > 2) {
                tips.push('厚みがある場合は、途中で裏返すと均一に解凍できます');
            }

            return tips;
        },

        // Generate wattage conversion table
        generateWattageTable: function() {
            const commonWatts = [500, 600, 700];
            const targetWatts = [500, 600, 700, 800, 1000];
            const baseTime = 3; // 3 minutes as reference

            const table = [];
            commonWatts.forEach(originalWatt => {
                const row = { originalWatt: originalWatt, originalTime: baseTime };
                targetWatts.forEach(targetWatt => {
                    const converted = this.convertWattage(originalWatt, baseTime, targetWatt);
                    row[`w${targetWatt}`] = `${converted.minutes}分${converted.seconds}秒`;
                });
                table.push(row);
            });

            return table;
        }
    };

    // Butter Length Calculator (butter.html)
    const butterLengthInput = document.getElementById('butter-length-input');
    const butterWeightResult = document.getElementById('butter-weight-result');
    if (butterLengthInput && butterWeightResult) {
        butterLengthInput.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value) || 0;
            // 1.2cm = 10g rule
            const weight = (val * (10 / 1.2)).toFixed(1);
            butterWeightResult.textContent = weight.replace(/\.0$/, '');
        });
    }

    // Update SPA navigation active states
    const filename = window.location.pathname.split('/').pop() || 'index.html';
    const chips = document.querySelectorAll('.chip-link');
    chips.forEach(chip => {
        chip.classList.remove('active');
        if (chip.getAttribute('href') === filename) {
            chip.classList.add('active');
            chip.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    });
};

document.addEventListener('DOMContentLoaded', window.initApp);

// ==========================================
// SPA Routing & Sticky Header Logic
// ==========================================

// SPA Router
document.addEventListener('click', async (e) => {
    const link = e.target.closest('.spa-link');
    if (link && link.href && link.href.startsWith(window.location.origin)) {
        const url = link.href;

        // ローカル環境（fileプロトコル）の場合はSPA遷移を諦めて通常遷移する
        if (window.location.protocol === 'file:') {
            return; // e.preventDefault()を呼ばないことで通常のリンク遷移に任せる
        }

        e.preventDefault();
        
        try {
            history.pushState(null, '', url);
        } catch (err) {
            // セキュリティエラー（Origin null等）のフォールバック
            window.location.href = url;
            return;
        }
        
        try {
            const resp = await fetch(url);
            const html = await resp.text();
            
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            const newMain = doc.querySelector('main');
            const newTitle = doc.querySelector('title');
            
            if (newMain) {
                const currentMain = document.querySelector('main');
                if (currentMain) {
                    currentMain.replaceWith(newMain);
                }
                if (newTitle) {
                    document.title = newTitle.textContent;
                }
                
                // Update mobile category select if it exists
                const select = document.getElementById('mobile-category-select');
                if (select) {
                    const filename = url.split('/').pop() || 'index.html';
                    const option = Array.from(select.options).find(opt => opt.value === filename);
                    if(option) select.value = option.value;
                }
                
                // Re-initialize app logic
                window.initApp();
                window.scrollTo(0, 0);
            }
        } catch(err) {
            console.error('SPA Navigation failed', err);
            window.location.href = url;
        }
    }
});

// Category Select Change
document.addEventListener('change', (e) => {
    if (e.target.id === 'mobile-category-select') {
        const url = e.target.value;
        const link = document.createElement('a');
        link.href = url;
        link.className = 'spa-link';
        document.body.appendChild(link);
        link.click();
        link.remove();
    }
});

window.addEventListener('popstate', () => {
    location.reload(); // Simple reload on back button to ensure state is correct
});

// Sticky Header Hide on Scroll
let lastScrollY = window.scrollY;
document.addEventListener('scroll', () => {
    const header = document.getElementById('app-header');
    if (!header) return;
    
    if (window.scrollY > lastScrollY && window.scrollY > 100) {
        // Scrolling down
        header.style.transform = 'translateY(-100%)';
    } else {
        // Scrolling up
        header.style.transform = 'translateY(0)';
    }
    lastScrollY = window.scrollY;
}, { passive: true });

// ==========================================
// PWA Install & iOS Modal Logic
// ==========================================
let deferredPrompt;
const pwaBanner = document.getElementById('pwa-install-banner');
const pwaInstallBtn = document.getElementById('pwa-install-btn');
const pwaCloseBtn = document.getElementById('pwa-close-btn');

const iosModal = document.getElementById('ios-pwa-modal');
const iosModalClose = document.getElementById('ios-modal-close');
const iosModalGotit = document.getElementById('ios-modal-gotit');

// Device & Environment Checks
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

// Dismissal Logic (24 hours)
function canShowPrompt() {
    const dismissedAt = localStorage.getItem('pwaDismissedAt');
    if (!dismissedAt) return true;
    const now = new Date().getTime();
    const hours24 = 24 * 60 * 60 * 1000;
    return (now - parseInt(dismissedAt, 10)) > hours24;
}

function recordDismissal() {
    localStorage.setItem('pwaDismissedAt', new Date().getTime().toString());
}

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .catch(err => console.log('SW registration failed: ', err));
    });
}

// Banner Trigger (Called when calculation happens)
window.triggerPwaPrompt = function() {
    if (isStandalone || !canShowPrompt() || !pwaBanner) return;
    
    // Wait slightly to show banner after user has seen result
    if (deferredPrompt || isIOS) {
        setTimeout(() => {
            pwaBanner.removeAttribute('hidden');
            pwaBanner.classList.add('show');
        }, 1500);
    }
};

document.addEventListener('input', () => {
    if (window.triggerPwaPrompt) window.triggerPwaPrompt();
}, { once: true });

// Intercept standard install prompt for Android/Chrome
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
});

// Install Button Click Handler
if (pwaInstallBtn) {
    pwaInstallBtn.addEventListener('click', async () => {
        if (pwaBanner) {
            pwaBanner.classList.remove('show');
            setTimeout(() => pwaBanner.setAttribute('hidden', 'true'), 300);
        }
        
        if (isIOS) {
            // Show iOS Custom Modal
            if (iosModal) {
                iosModal.removeAttribute('hidden');
            }
        } else if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            console.log(`User response to install prompt: ${outcome}`);
            deferredPrompt = null;
        }
    });
}

// Close Button Click Handler
if (pwaCloseBtn) {
    pwaCloseBtn.addEventListener('click', () => {
        if (pwaBanner) {
            pwaBanner.classList.remove('show');
            setTimeout(() => pwaBanner.setAttribute('hidden', 'true'), 300);
        }
        recordDismissal();
    });
}

// iOS Modal Close Logic
function closeIosModal() {
    if (iosModal) {
        iosModal.setAttribute('hidden', 'true');
        recordDismissal();
    }
}
if (iosModalClose) iosModalClose.addEventListener('click', closeIosModal);
if (iosModalGotit) iosModalGotit.addEventListener('click', closeIosModal);
