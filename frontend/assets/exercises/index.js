// ─── Exercise Asset Registry (Task 2 Fix) ───
// Use static require for local GIFs as requested.
// NOTE: Since actual .gif files are missing, we use placeholder.png.
// USER: Add your .gif files to assets/gifs/ and update these paths to see animations.

const EXERCISE_ASSETS = {
    crunches: require('./crunches.png'),
    plank: require('./plank_hold.png'),
    leg_raises: require('./leg_raises.png'),
    mountain_climbers: require('./mountain_climb.png'),
    bicycle_crunches: require('./Bicycle_crunches.png'),
    russian_twists: require('./russian-twist.png'),
    pushups: require('./push_ups.png'),
    wide_pushups: require('./wide_pushups.png'),
    diamond_pushups: require('./diamond_pushups.png'),
    decline_pushups: require('./decline_pushups.png'),
    dips: require('./chest_dips.png'),
    incline_pushups: require('./incline_pushups.png'),
    squats: require('./placeholder.png'),
    burpees: require('./placeholder.png'),
    // Categories
    cat_belly: require('./cat_belly.png'),
    cat_chest: require('./cat_chest.png'),
    cat_arms: require('./cat_arms.png'),
    cat_legs: require('./cat_legs.png'),
    cat_fullbody: require('./cat_fullbody.png'),
    // Fallback
    default: require('./placeholder.png'),
};

/**
 * Get the correct exercise asset based on name.
 */
export const getExerciseAsset = (gifName) => {
    // Standardize key
    const key = (gifName || '').toLowerCase().replace(/[^a-z0-9_]/g, '');
    return EXERCISE_ASSETS[key] || EXERCISE_ASSETS.default;
};

export default EXERCISE_ASSETS;
