/**
 * VitalIQ Food Database — 120+ Indian & International foods
 * Accuracy: USDA + IFCT (Indian Food Composition Tables) reference values
 * All values are per standard serving
 */
function estimateCalories(foodName) {
    if (!foodName) return { error: "Food name required" };

    const lower = foodName.toLowerCase().trim();

    // ─── Comprehensive Food Database (per serving) ───
    const db = {
        // ── Indian Breads ──
        'roti': 120, 'chapati': 120, 'paratha': 260, 'naan': 260,
        'puri': 150, 'bhatura': 330, 'kulcha': 290, 'thepla': 180,
        'phulka': 70, 'rumali roti': 90, 'missi roti': 160,

        // ── Rice & Grains ──
        'rice': 200, 'biryani': 400, 'pulao': 300, 'jeera rice': 220,
        'fried rice': 350, 'khichdi': 200, 'upma': 190, 'poha': 180,
        'dalia': 160, 'quinoa': 220, 'couscous': 180,

        // ── Lentils & Curries ──
        'dal': 150, 'sambar': 130, 'rajma': 200, 'chole': 210,
        'chana': 210, 'kadhi': 160, 'dal makhani': 250, 'dal tadka': 170,
        'rasam': 80, 'dal fry': 180,

        // ── Vegetables ──
        'aloo gobi': 180, 'palak paneer': 280, 'paneer butter masala': 350,
        'shahi paneer': 330, 'matar paneer': 280, 'malai kofta': 350,
        'baingan bharta': 160, 'bhindi': 110, 'gobi': 120,
        'mixed veg': 150, 'paneer': 265, 'paneer tikka': 300,
        'aloo': 160, 'sabzi': 150, 'curry': 200,

        // ── Non-Veg ──
        'chicken': 250, 'chicken breast': 165, 'chicken curry': 280,
        'chicken tikka': 200, 'tandoori chicken': 220, 'butter chicken': 380,
        'egg': 78, 'boiled egg': 78, 'omelette': 150, 'egg bhurji': 180,
        'fish': 150, 'fish curry': 200, 'fish fry': 280,
        'mutton': 300, 'mutton curry': 350, 'keema': 280,
        'prawn': 100, 'prawn curry': 220,

        // ── Breakfast & Snacks ──
        'idli': 60, 'dosa': 170, 'masala dosa': 250, 'vada': 180,
        'medu vada': 180, 'uttapam': 200, 'pongal': 210,
        'aloo paratha': 300, 'paneer paratha': 320,
        'sandwich': 250, 'grilled sandwich': 300, 'toast': 120,
        'bread': 80, 'oats': 150, 'muesli': 200, 'cornflakes': 160,
        'maggi': 310, 'maggie': 310, 'noodles': 310, 'pasta': 350,

        // ── Fruits ──
        'apple': 95, 'banana': 105, 'mango': 100, 'papaya': 60,
        'watermelon': 46, 'grapes': 70, 'orange': 62, 'pomegranate': 83,
        'guava': 68, 'pineapple': 80, 'kiwi': 42, 'strawberry': 50,
        'berries': 70, 'dates': 66, 'coconut': 160, 'fruit': 80,

        // ── Dairy ──
        'milk': 150, 'curd': 100, 'yogurt': 100, 'raita': 120,
        'lassi': 180, 'buttermilk': 60, 'cheese': 110, 'butter': 100,
        'ghee': 120, 'cream': 80, 'ice cream': 250, 'milkshake': 300,

        // ── Drinks ──
        'tea': 30, 'green tea': 5, 'coffee': 50, 'black coffee': 5,
        'juice': 120, 'smoothie': 200, 'protein shake': 250,
        'soda': 140, 'cola': 140, 'lemonade': 100, 'coconut water': 45,
        'nimbu pani': 50, 'jal jeera': 30,

        // ── Fast Food ──
        'pizza': 280, 'burger': 350, 'french fries': 320, 'samosa': 260,
        'kachori': 280, 'pakora': 200, 'bhaji': 200, 'chaat': 250,
        'pani puri': 180, 'sev puri': 200, 'pav bhaji': 380,
        'vada pav': 290, 'dabeli': 250, 'momos': 200, 'spring roll': 220,
        'wrap': 300, 'shawarma': 400, 'rolls': 350,

        // ── Sweets ──
        'gulab jamun': 150, 'rasgulla': 120, 'jalebi': 150,
        'halwa': 250, 'ladoo': 180, 'barfi': 160, 'kheer': 200,
        'rabri': 250, 'payasam': 220, 'cake': 300, 'brownie': 350,
        'cookie': 120, 'biscuit': 80, 'chocolate': 230,

        // ── Dry Fruits & Nuts ──
        'almond': 170, 'cashew': 160, 'walnut': 190, 'peanut': 160,
        'pistachio': 160, 'raisin': 130, 'mixed nuts': 170,

        // ── Salads & Light ──
        'salad': 100, 'raita': 120, 'soup': 90,
        'sprouts': 120, 'corn': 130,
    };

    let baseCals = 0;
    let matched = false;

    // Try longest match first (e.g., "paneer butter masala" before "paneer")
    const sortedKeys = Object.keys(db).sort((a, b) => b.length - a.length);
    for (const key of sortedKeys) {
        if (lower.includes(key)) {
            baseCals = db[key];
            matched = true;
            break;
        }
    }

    if (!matched) {
        console.log(`🤖 [Estimator] ❌ Food not recognized: "${foodName}"`);
        return { error: "Food not recognized" };
    }

    // ─── Portion Multiplier ───
    let multiplier = 1;
    const countMatch = lower.match(/^(\d+\.?\d*)/);
    if (countMatch) {
        multiplier = parseFloat(countMatch[1]);
    }

    // Text-based portion cues
    if (lower.includes('double') || lower.includes('2 plate')) multiplier = Math.max(multiplier, 2);
    else if (lower.includes('half')) multiplier = 0.5;
    else if (lower.includes('quarter')) multiplier = 0.25;
    else if (lower.includes('large') || lower.includes('big')) multiplier = Math.max(multiplier, 1.5);
    else if (lower.includes('small')) multiplier = Math.max(multiplier, 0.7);

    // Bowl / plate detection
    if (lower.includes('2 bowl')) multiplier = 2;
    else if (lower.includes('1 bowl') || lower.includes('bowl')) multiplier = Math.max(multiplier, 1);
    if (lower.includes('1 plate') || lower.includes('plate')) multiplier = Math.max(multiplier, 1.5);
    if (lower.includes('half plate')) multiplier = 0.75;

    const finalCals = Math.round(baseCals * multiplier);
    console.log(`🤖 [Estimator] ✅ "${foodName}" → Matched: Base ${baseCals} × ${multiplier} = ${finalCals} kcal`);

    return finalCals;
}

module.exports = { estimateCalories };
