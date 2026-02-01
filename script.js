document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const sourceInput = document.getElementById('source-input');
    const sourceUnitSelect = document.getElementById('source-unit');
    const targetOutput = document.getElementById('target-output');
    const targetUnitSelect = document.getElementById('target-unit');
    const referenceList = document.getElementById('reference-list');
    const resetBtn = document.getElementById('reset-btn');

    // Specific Gravity Data (g/cm3 or g/ml) - Fixed to Water for simplicity as requested
    // "Ingredients are not selected" -> Default 1.0
    const DENSITY = 1.0;

    // Unit definitions
    const units = {
        'ml': { type: 'volume', factor: 1, label: 'cc (ml)' },
        'cup': { type: 'volume', factor: 200, label: 'カップ' },
        'tbsp': { type: 'volume', factor: 15, label: '大さじ' },
        'tsp': { type: 'volume', factor: 5, label: '小さじ' },
        'g': { type: 'mass', factor: 1, label: 'g' }
    };

    // Default values for each unit
    const defaultValues = {
        'g': 100,
        'ml': 100,
        'cup': 1,
        'tbsp': 1,
        'tsp': 1
    };

    // Calculate conversion
    function calculate() {
        // Handle "Smart Default/Preview" Logic
        let val = parseFloat(sourceInput.value);
        let isDefaultPreview = false;

        // If input is empty, use the default value for the current source unit
        if (isNaN(val)) {
            const sourceUnit = sourceUnitSelect.value;
            val = defaultValues[sourceUnit] || 1;
            isDefaultPreview = true;

            // Show this default as the placeholder
            sourceInput.placeholder = val;
        } else {
            // Ensure placeholder matches current unit default even when typing
            sourceInput.placeholder = defaultValues[sourceUnitSelect.value] || 1;
        }

        const sourceUnit = sourceUnitSelect.value;
        const targetUnit = targetUnitSelect.value;

        // Style the output based on whether it's a real result or a preview
        if (isDefaultPreview) {
            targetOutput.classList.add('placeholder-text');
        } else {
            targetOutput.classList.remove('placeholder-text');
        }

        // 1. Convert source to grams (using water density=1 as base for simplicity if not food specific)
        // Note: The previous logic was specialized. We'll simplify to:
        // Volume (ml) -> Weight (g) : x1 (water)
        // Weight (g) -> Volume (ml) : /1
        // Cup=200ml, Tbsp=15ml, Tsp=5ml

        // Base unit: ml (or g for water)
        let inMl = 0;

        switch (sourceUnit) {
            case 'g': inMl = val; break; // Assumes water density
            case 'ml': inMl = val; break;
            case 'cup': inMl = val * 200; break;
            case 'tbsp': inMl = val * 15; break;
            case 'tsp': inMl = val * 5; break;
        }

        // 2. Convert ml to target
        let result = 0;
        switch (targetUnit) {
            case 'g': result = inMl; break;
            case 'ml': result = inMl; break;
            case 'cup': result = inMl / 200; break;
            case 'tbsp': result = inMl / 15; break;
            case 'tsp': result = inMl / 5; break;
        }

        // Formatting
        // If it's an integer, show no decimals. If float, max 2 decimals.
        // For preview, we might want to be cleaner.
        let displayResult = parseFloat(result.toFixed(2));
        targetOutput.value = displayResult;

        updateReferenceList(inMl, isDefaultPreview);
    }

    function updateReferenceList(inMl, isPreview) {
        // Clear current
        referenceList.innerHTML = '';

        const refs = [
            { unit: 'tbsp', label: '大さじ', ml: 15 },
            { unit: 'tsp', label: '小さじ', ml: 5 },
            { unit: 'cup', label: 'カップ', ml: 200 },
            { unit: 'ml', label: 'cc (ml)', ml: 1 },
            { unit: 'g', label: 'グラム', ml: 1 }
        ];

        // Filter out current source and target from reference? 
        // Or just show useful ones (Tbsp, Tsp are most common references needed).
        // Let's show Tbsp, Tsp, Cup if they are NOT the result.

        refs.forEach(r => {
            // Don't show if it's the target unit (redundant)
            if (targetUnitSelect.value === r.unit) return;

            let val = inMl / r.ml;
            let valStr = parseFloat(val.toFixed(2));

            const span = document.createElement('span');
            span.className = 'ref-item';
            if (isPreview) span.classList.add('placeholder-text');
            span.textContent = `${r.label}: ${valStr}`;
            referenceList.appendChild(span);
        });
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
    sourceInput.addEventListener('input', calculate);
    // Remove direct change listeners because custom select will trigger them differently or we handle it inside custom select logic
    // sourceUnitSelect.addEventListener('change', calculate); 
    // targetUnitSelect.addEventListener('change', calculate);

    resetBtn.addEventListener('click', () => {
        resetAll();
        // Reset custom selects UI
        document.querySelectorAll('.unit-select').forEach(select => {
            const wrapper = select.nextElementSibling; // The custom wrapper
            if (wrapper && wrapper.classList.contains('custom-select-wrapper')) {
                const trigger = wrapper.querySelector('.custom-select-trigger');
                const selectedOption = select.options[select.selectedIndex];
                trigger.textContent = selectedOption.text;

                // Update selection state in the list
                wrapper.querySelectorAll('.custom-option').forEach(opt => {
                    opt.classList.toggle('selected', opt.dataset.value === select.value);
                });
            }
        });
        calculate(); // Recalculate with defaults
    });

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

        // Initial sync of exclusive units
        updateTargetAvailability(sourceUnitSelect.value);

        // Initial calculation for placeholder
        calculate();

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

});
