/**
 * Advanced Keyword-based Calorie Estimator
 * Handles food names and basic portion cues (e.g. '2 roti', 'large pizza').
 */
function estimateCalories(foodName) {
    if (!foodName) return 150;

    const lower = foodName.toLowerCase().trim();
    
    // Base mappings (per serving/item)
    const map = {
        'apple': 95,
        'banana': 105,
        'egg': 78,
        'roti': 120,
        'chapati': 120,
        'paratha': 200,
        'rice': 200, // cup
        'idli': 60,
        'dosa': 170,
        'poha': 180,
        'milk': 150,
        'tea': 30,
        'coffee': 50,
        'chicken': 250,
        'paneer': 265,
        'dal': 150,
        'pizza': 280, // slice
        'burger': 350,
        'salad': 100,
        'oats': 150,
        'samosa': 260,
        'omelette': 150,
        'soup': 90,
        'biryani': 400,
        'maggie': 310,
        'maggi': 310,
        'noodles': 310,
        'pasta': 350,
        'sandwich': 250,
        'fish': 150,
        'curd': 100,
        'juice': 120
    };

    let baseCals = 150; // Default
    let found = false;

    // Direct Match or Keyword match
    for (const [key, value] of Object.entries(map)) {
        if (lower.includes(key)) {
            baseCals = value;
            found = true;
            break;
        }
    }

    // Portion Detection (Basic)
    let multiplier = 1;
    const countMatch = lower.match(/^(\d+)/); // Extracts leading number
    if (countMatch) {
        multiplier = parseInt(countMatch[1]);
    } else if (lower.includes('double')) {
        multiplier = 2;
    } else if (lower.includes('half')) {
        multiplier = 0.5;
    }

    const finalCals = Math.round(baseCals * multiplier);
    console.log(`🤖 [Estimator] "${foodName}" -> Base: ${baseCals}, Multiplier: ${multiplier} -> Final: ${finalCals} kcal`);
    
    return finalCals;
}

module.exports = { estimateCalories };
