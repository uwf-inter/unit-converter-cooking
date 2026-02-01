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

    function calculate() {
        const val = parseFloat(sourceInput.value);
        if (isNaN(val)) {
            targetOutput.value = '';
            referenceList.innerHTML = '<span class="ref-item">数値を入力してください</span>';
            return;
        }

        const sourceUnit = sourceUnitSelect.value;
        const targetUnit = targetUnitSelect.value;

        // 1. Get Base ML
        let baseML;
        if (units[sourceUnit].type === 'mass') {
            baseML = val / DENSITY;
        } else {
            baseML = val * units[sourceUnit].factor;
        }

        // 2. Convert to Target
        let result;
        if (units[targetUnit].type === 'mass') {
            result = baseML * DENSITY;
        } else {
            result = baseML / units[targetUnit].factor;
        }

        targetOutput.value = formatNumber(result);

        // 3. Update References
        updateReferences(baseML, sourceUnit, targetUnit);
    }

    function updateReferences(baseML, sourceUnit, targetUnit) {
        referenceList.innerHTML = '';

        Object.keys(units).forEach(unitKey => {
            // Skip if it's the source or target unit (redundant)
            // But user might want to see them if they are looking for comparison? 
            // Better to show ALL others.
            if (unitKey === sourceUnit || unitKey === targetUnit) return;

            let converted;
            if (units[unitKey].type === 'mass') {
                converted = baseML * DENSITY;
            } else {
                converted = baseML / units[unitKey].factor;
            }

            const item = document.createElement('span');
            item.className = 'ref-item';
            item.textContent = `${units[unitKey].label}: ${formatNumber(converted)}`;
            referenceList.appendChild(item);
        });
    }

    function formatNumber(num) {
        // Round to up to 2 decimals, discard trailing zeros
        return Math.round(num * 100) / 100;
    }

    function resetAll() {
        sourceInput.value = '';
        targetOutput.value = '';
        referenceList.innerHTML = '<span class="ref-item">-</span>';
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

    // --- Custom Select Implementation ---
    function setupCustomSelects() {
        const selects = document.querySelectorAll('.unit-select');

        selects.forEach(select => {
            // Create Wrapper
            const wrapper = document.createElement('div');
            wrapper.className = 'custom-select-wrapper';

            // Create Trigger
            const trigger = document.createElement('div');
            trigger.className = 'custom-select-trigger';
            trigger.textContent = select.options[select.selectedIndex].text;

            // Create Options Container
            const startUnit = select.value;
            const optionsContainer = document.createElement('div');
            optionsContainer.className = 'custom-options';

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
                });

                optionsContainer.appendChild(optDiv);
            });

            // Toggle Dropdown
            wrapper.appendChild(trigger);
            wrapper.appendChild(optionsContainer);

            // Insert after the original select (original is hidden via CSS)
            select.parentNode.insertBefore(wrapper, select.nextSibling);

            // Event listener for Wrapper
            wrapper.addEventListener('click', (e) => {
                e.stopPropagation(); // Stop bubble so document click doesn't close immediately

                // Close other open dropdowns
                document.querySelectorAll('.custom-options.open').forEach(el => {
                    if (el !== optionsContainer) el.classList.remove('open');
                });

                optionsContainer.classList.toggle('open');
            });
        });

        // Close dropdowns when clicking outside
        document.addEventListener('click', () => {
            document.querySelectorAll('.custom-options.open').forEach(el => el.classList.remove('open'));
        });
    }

    // Initialize Custom Selects
    setupCustomSelects();

});
