const calculateBMR = (weight, height, age, gender) => {
    // Mifflin-St Jeor Equation
    if (gender === 'male') {
        return 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
        return 10 * weight + 6.25 * height - 5 * age - 161;
    }
};

const calculateTDEE = (bmr, activityLevel) => {
    const activityMultipliers = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        active: 1.725,
        very_active: 1.9,
    };
    return bmr * (activityMultipliers[activityLevel] || 1.2);
};

module.exports = { calculateBMR, calculateTDEE };
