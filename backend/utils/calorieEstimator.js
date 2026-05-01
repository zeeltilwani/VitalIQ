const foods = require('../data/foods.json');

/**
 * ✅ TASK 4: LOG FOOD VALIDATION
 * Before saving: check if food exists in dataset
 */
function estimateCalories(foodName) {
    if (!foodName) return { error: "Food name required" };

    const lower = foodName.toLowerCase().trim();
    const keys = Object.keys(foods);
    
    let matchedKey = null;
    for (const key of keys) {
        if (lower.includes(key) || key.includes(lower)) {
            matchedKey = key;
            break;
        }
    }

    if (matchedKey) {
        const baseCals = foods[matchedKey];
        
        // Simple multiplier logic
        let multiplier = 1;
        if (lower.includes('double') || lower.includes('2')) multiplier = 2;
        else if (lower.includes('half')) multiplier = 0.5;

        return Math.round(baseCals * multiplier);
    }

    // ✅ If NOT found: return error to block submission
    console.log(`[Validation] Food "${foodName}" NOT found in dataset. Blocking log.`);
    return { error: "Food not recognized" };
}

module.exports = { estimateCalories };
