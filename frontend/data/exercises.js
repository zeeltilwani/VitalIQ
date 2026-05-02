// ─── VitalIQ Exercise Database ───
// Comprehensive exercise data with GIF mappings

export const BODY_PARTS = [
    { key: 'belly', label: 'Belly Fat', color: '#ef4444', description: 'Core & cardio to burn visceral fat' },
    { key: 'chest', label: 'Chest', color: '#3b82f6', description: 'Push movements for upper body' },
    { key: 'arms', label: 'Arms', color: '#8b5cf6', description: 'Biceps, triceps & shoulders' },
    { key: 'legs', label: 'Legs', color: '#f59e0b', description: 'Quads, hamstrings & glutes' },
    { key: 'fullbody', label: 'Full Body', color: '#10b981', description: 'Complete compound movements' },
];

export const EXERCISES = {
    belly: [
        { id: 'b1', name: 'Crunches', sets: 3, reps: 15, restSec: 30, gifName: 'crunches', videoSource: 'crunches_female', description: 'Lie on back, knees bent. Curl upper body towards knees.' },
        { id: 'b2', name: 'Plank Hold', sets: 3, reps: 45, restSec: 30, unit: 'sec', gifName: 'plank', videoSource: 'plank_hold_woman', description: 'Hold forearm plank with body in a straight line.' },
        { id: 'b3', name: 'Leg Raises', sets: 3, reps: 12, restSec: 30, gifName: 'leg_raises', videoSource: 'leg_raises_woman', description: 'Lie flat, lift legs to 90°, lower slowly.' },
        { id: 'b4', name: 'Mountain Climbers', sets: 3, reps: 30, restSec: 30, unit: 'sec', gifName: 'mountain_climbers', videoSource: 'Mountain_climb_man', description: 'In plank, drive knees alternately toward chest.' },
        { id: 'b5', name: 'Bicycle Crunches', sets: 3, reps: 20, restSec: 30, gifName: 'bicycle_crunches', videoSource: 'bicycle_crunch_woman', description: 'Bring opposite elbow to knee alternately.' },
        { id: 'b6', name: 'Russian Twists', sets: 3, reps: 20, restSec: 30, gifName: 'russian_twists', videoSource: 'russian_twist_woman', description: 'Sit with knees bent, rotate torso side to side.' },
    ],
    chest: [
        { id: 'c1', name: 'Push-Ups', sets: 4, reps: 15, restSec: 45, gifName: 'pushups', videoSource: 'pushups', description: 'Hands shoulder-width, body straight. Lower chest to floor.' },
        { id: 'c2', name: 'Wide Push-Ups', sets: 3, reps: 12, restSec: 45, gifName: 'wide_pushups', videoSource: 'wide_pushups', description: 'Hands wider than shoulders. Focus on chest stretch.' },
        { id: 'c3', name: 'Diamond Push-Ups', sets: 3, reps: 10, restSec: 45, gifName: 'diamond_pushups', videoSource: 'diamond_pushup', description: 'Hands form a diamond under chest. Targets triceps.' },
        { id: 'c4', name: 'Decline Push-Ups', sets: 3, reps: 12, restSec: 45, gifName: 'decline_pushups', videoSource: 'decline_pushups', description: 'Feet elevated on bench. Targets upper chest.' },
        { id: 'c5', name: 'Chest Dips', sets: 3, reps: 10, restSec: 60, gifName: 'dips', videoSource: 'chest_dips_man', description: 'Lean forward on bars. Lower body by bending elbows.' },
        { id: 'c6', name: 'Incline Push-Ups', sets: 3, reps: 15, restSec: 30, gifName: 'incline_pushups', videoSource: 'incline_pushups_woman', description: 'Hands on elevated surface. Targets lower chest.' },
    ],
    arms: [
        { id: 'a1', name: 'Tricep Dips', sets: 3, reps: 12, restSec: 45, gifName: 'tricep_dips', description: 'Using a chair, lower body by bending elbows.' },
        { id: 'a2', name: 'Close-Grip Push-Ups', sets: 3, reps: 12, restSec: 45, gifName: 'close_grip_pushups', description: 'Hands close together. Elbows tight to ribs.' },
        { id: 'a3', name: 'Arm Circles', sets: 3, reps: 30, restSec: 20, unit: 'sec', gifName: 'arm_circles', description: 'Extend arms at shoulder height. Make circles.' },
        { id: 'a4', name: 'Plank Shoulder Taps', sets: 3, reps: 20, restSec: 30, gifName: 'shoulder_taps', description: 'In plank, tap opposite shoulder alternately.' },
        { id: 'a5', name: 'Inchworms', sets: 3, reps: 8, restSec: 45, gifName: 'inchworms', description: 'Walk hands out to plank and back.' },
        { id: 'a6', name: 'Pike Push-Ups', sets: 3, reps: 10, restSec: 45, gifName: 'pike_pushups', description: 'Inverted V position. Targets shoulders.' },
    ],
    legs: [
        { id: 'l1', name: 'Bodyweight Squats', sets: 4, reps: 15, restSec: 45, gifName: 'squats', description: 'Feet shoulder-width, squat until thighs parallel.' },
        { id: 'l2', name: 'Lunges', sets: 3, reps: 12, restSec: 45, gifName: 'lunges', description: 'Step forward, lower until both knees at 90°.' },
        { id: 'l3', name: 'Jump Squats', sets: 3, reps: 10, restSec: 45, gifName: 'jump_squats', description: 'Squat down then explosively jump up.' },
        { id: 'l4', name: 'Wall Sit', sets: 3, reps: 45, restSec: 30, unit: 'sec', gifName: 'wall_sit', description: 'Back against wall, thighs parallel. Hold.' },
        { id: 'l5', name: 'Calf Raises', sets: 3, reps: 20, restSec: 30, gifName: 'calf_raises', description: 'Rise up on toes, lower below step level.' },
        { id: 'l6', name: 'Glute Bridges', sets: 3, reps: 15, restSec: 30, gifName: 'glute_bridges', description: 'Lie on back, drive hips up squeezing glutes.' },
    ],
    fullbody: [
        { id: 'f1', name: 'Burpees', sets: 4, reps: 10, restSec: 60, gifName: 'burpees', description: 'Drop to push-up, jump back up, jump with arms up.' },
        { id: 'f2', name: 'Jumping Jacks', sets: 3, reps: 30, restSec: 30, gifName: 'jumping_jacks', description: 'Jump spreading legs and raising arms.' },
        { id: 'f3', name: 'Bear Crawls', sets: 3, reps: 30, restSec: 45, unit: 'sec', gifName: 'bear_crawls', description: 'All fours, knees hovering. Crawl around.' },
        { id: 'f4', name: 'High Knees', sets: 3, reps: 30, restSec: 30, unit: 'sec', gifName: 'high_knees', description: 'Run in place driving knees high.' },
        { id: 'f5', name: 'Squat to Press', sets: 3, reps: 12, restSec: 45, gifName: 'squat_press', description: 'Squat, then press arms overhead as you stand.' },
        { id: 'f6', name: 'Plank Jacks', sets: 3, reps: 20, restSec: 30, gifName: 'plank_jacks', description: 'In plank, jump feet out wide and back.' },
    ],
};

export const MEAL_SUGGESTIONS = {
    light: [
        { name: '🍎 Apple + Green Tea', calories: 80 },
        { name: '🥒 Cucumber Slices', calories: 50 },
        { name: '🍌 Half Banana', calories: 55 },
        { name: '🫐 Mixed Berries', calories: 70 },
    ],
    balanced: [
        { name: '🥚 2 Boiled Eggs', calories: 156 },
        { name: '🥗 Greek Salad', calories: 220 },
        { name: '🍳 Egg White Omelette', calories: 200 },
        { name: '🥜 Handful of Almonds + Fruit', calories: 250 },
    ],
    full: [
        { name: '🍛 Dal + Rice + Salad', calories: 450 },
        { name: '🍗 Grilled Chicken + Veggies', calories: 420 },
        { name: '🥘 Paneer Sabzi + 2 Roti', calories: 500 },
        { name: '🐟 Fish Curry + Brown Rice', calories: 480 },
    ],
};
