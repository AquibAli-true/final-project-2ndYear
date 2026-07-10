const mongoose = require('mongoose');

const foodItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    fdcId: { type: String, required: true },
    servingAmount: { type: Number, required: true }, 
    servingUnit: { type: String, default: 'g' }, 
    calories: { type: Number, required: true },
    protein: { type: Number, required: true },
    carbs: { type: Number, required: true },
    fat: { type: Number, required: true }
});

const dailyLogSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    date: { 
        type: String, 
        required: true, 
        match: /^\d{4}-\d{2}-\d{2}$/ 
    },
    targetCalories: { 
        type: Number, 
        required: true 
    },
    targetProtein: { 
        type: Number, 
        required: true 
    },
    loggedWeight: { 
        type: Number 
    },
    meals: {
        breakfast: [foodItemSchema],
        lunch: [foodItemSchema],
        dinner: [foodItemSchema],
        snacks: [foodItemSchema]
    }
}, {
    timestamps: true
});

dailyLogSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('DailyLog', dailyLogSchema);