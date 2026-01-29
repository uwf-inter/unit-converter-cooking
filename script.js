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
    sourceUnitSelect.addEventListener('change', calculate);
    targetUnitSelect.addEventListener('change', calculate);

    resetBtn.addEventListener('click', resetAll);
});
