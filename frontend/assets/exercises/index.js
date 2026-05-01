// ─── Exercise Asset Registry (Task 2 Fix) ───
// Use static require for local GIFs as requested.
// NOTE: Since actual .gif files are missing, we use placeholder.png.
// USER: Add your .gif files to assets/gifs/ and update these paths to see animations.

const EXERCISE_ASSETS = {
    crunches: require('./placeholder.png'),
    plank: require('./placeholder.png'),
    leg_raises: require('./placeholder.png'),
    mountain_climbers: require('./placeholder.png'),
    pushups: require('./placeholder.png'),
    squats: require('./placeholder.png'),
    burpees: require('./placeholder.png'),
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
