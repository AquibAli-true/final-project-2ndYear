const express = require('express');
const router = express.Router();
const userModel = require('../models/userModel.js');
const DailyLog = require('../models/dashboardModel.js');

const calculateTotals = (meals) => {
    let totalCalories = 0;
    let totalProtein = 0;
    
    if (!meals) return { totalCalories, totalProtein };
    
    const allFoods = [...(meals.breakfast || []), ...(meals.lunch || []), ...(meals.dinner || []), ...(meals.snacks || [])];
    allFoods.forEach(food => {
        totalCalories += food.calories;
        totalProtein += food.protein;
    });

    return { totalCalories, totalProtein };
};

router.get('/dashboard', async (req, res) => {
    try {
        const token = req.cookies.user_session;
        if (!token) return res.status(401).json({ message: 'Not authenticated' });
        const user = await userModel.findOne({ token: token });
        if (!user) return res.status(401).json({ message: 'Invalid session' });
        const requestedDate = req.query.date || new Date().toISOString().split('T')[0];
        let bmr = (10 * user.weight) + (6.25 * user.height) - (5 * user.age);
        bmr += (user.sex === 'male') ? 5 : -161;
        const maintenanceCalories = Math.round(bmr * 1.2);
        const maintenanceProtein = Math.round((maintenanceCalories * 0.30) / 4);
        let dailyLog = await DailyLog.findOne({ user: user._id, date: requestedDate });
        if (!dailyLog) {
            dailyLog = await DailyLog.create({
                user: user._id,
                date: requestedDate,
                targetCalories: maintenanceCalories, 
                targetProtein: maintenanceProtein,   
                meals: { breakfast: [], lunch: [], dinner: [], snacks: [] }
            });
        }
        const { totalCalories, totalProtein } = calculateTotals(dailyLog.meals);
        res.status(200).json({
            date: dailyLog.date,
            targetCalories: dailyLog.targetCalories,
            consumedCalories: totalCalories,
            targetProtein: dailyLog.targetProtein, 
            consumedProtein: totalProtein,
            meals: dailyLog.meals
        });

    } catch (error) {
        console.error("Dashboard Error:", error);
        res.status(500).json({ message: error.message });
    }
}).put('/dashboard/targets', async (req, res) => {
    try {
        const token = req.cookies.user_session;
        if (!token) return res.status(401).json({ message: 'Not authenticated' });
        
        const user = await userModel.findOne({ token: token });
        if (!user) return res.status(401).json({ message: 'Invalid session' });

        const { date, targetCalories, targetProtein } = req.body;

        if (!date || !targetCalories || !targetProtein) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const updatedLog = await DailyLog.findOneAndUpdate(
            { user: user._id, date: date },
            { 
                targetCalories: Number(targetCalories), 
                targetProtein: Number(targetProtein) 
            },
            { new: true }
        );

        if (!updatedLog) {
            return res.status(404).json({ message: 'Log not found for this date' });
        }

        res.status(200).json({ 
            message: 'Targets updated', 
            targetCalories: updatedLog.targetCalories, 
            targetProtein: updatedLog.targetProtein 
        });

    } catch (error) {
        console.error("Update Targets Error:", error);
        res.status(500).json({ message: error.message });
    }
}).post('/dashboard/food', async (req, res) => {
    try {
        const token = req.cookies.user_session;
        if (!token) return res.status(401).json({ message: 'Not authenticated' });
        
        const user = await userModel.findOne({ token: token });
        if (!user) return res.status(401).json({ message: 'Invalid session' });

        const { date, name, fdcId, servingAmount, servingUnit, calories, protein, fat, carbs, mealType } = req.body;

        const validMealTypes = ['breakfast', 'lunch', 'dinner', 'snacks'];
        if (!mealType || !validMealTypes.includes(mealType)) {
            return res.status(400).json({ message: 'Valid mealType (breakfast, lunch, dinner, snacks) is required' });
        }

        const foodItem = {
            name,
            fdcId: String(fdcId || 'custom'), 
            servingAmount: Number(servingAmount) || 100,
            servingUnit: servingUnit || 'g',
            calories: Number(calories) || 0,
            protein: Number(protein) || 0,
            carbs: Number(carbs) || 0,
            fat: Number(fat) || 0, 
        };
        const updatedLog = await DailyLog.findOneAndUpdate(
            { user: user._id, date: date },
            { $push: { [`meals.${mealType}`]: foodItem } },
            { new: true } 
        );

        if (!updatedLog) {
            return res.status(404).json({ message: 'Log not found' });
        }

        res.status(200).json(updatedLog);
    } catch (error) {
        console.error("Log Food Error:", error);
        res.status(500).json({ message: error.message });
    }
}).patch('/dashboard/weight', async (req, res) => {
    try {
        const token = req.cookies.user_session;
        if (!token) return res.status(401).json({ message: 'Not authenticated' });
 
        const user = await userModel.findOne({ token: token });
        if (!user) return res.status(401).json({ message: 'Invalid session' });
 
        const { date, weight } = req.body;
 
        if (!date || weight === undefined) {
            return res.status(400).json({ message: 'date and weight are required' });
        }
 
        const weightNum = Number(weight);
        if (isNaN(weightNum) || weightNum <= 0) {
            return res.status(400).json({ message: 'weight must be a positive number' });
        }
        let dailyLog = await DailyLog.findOne({ user: user._id, date: date });
 
        if (!dailyLog) {
            let bmr = (10 * user.weight) + (6.25 * user.height) - (5 * user.age);
            bmr += (user.sex === 'male') ? 5 : -161;
            const maintenanceCalories = Math.round(bmr * 1.2);
            const maintenanceProtein = Math.round((maintenanceCalories * 0.30) / 4);
 
            dailyLog = await DailyLog.create({
                user: user._id,
                date: date,
                targetCalories: maintenanceCalories,
                targetProtein: maintenanceProtein,
                loggedWeight: weightNum,
                meals: { breakfast: [], lunch: [], dinner: [], snacks: [] },
            });
        } else {
            dailyLog.loggedWeight = weightNum;
            await dailyLog.save();
        }
 
        const mostRecentLog = await DailyLog.findOne({
            user: user._id,
            loggedWeight: { $exists: true, $ne: null },
        }).sort({ date: -1 });
 
        if (mostRecentLog) {
            await userModel.findByIdAndUpdate(user._id, { weight: mostRecentLog.loggedWeight });
        }
 
        res.status(200).json({ date: dailyLog.date, loggedWeight: dailyLog.loggedWeight });
    } catch (error) {
        console.error('Log Weight Error:', error);
        res.status(500).json({ message: error.message });
    }
})
 
.get('/dashboard/weight-history', async (req, res) => {
    try {
        const token = req.cookies.user_session;
        if (!token) return res.status(401).json({ message: 'Not authenticated' });
 
        const user = await userModel.findOne({ token: token });
        if (!user) return res.status(401).json({ message: 'Invalid session' });
        const logs = await DailyLog.find({
            user: user._id,
            loggedWeight: { $exists: true, $ne: null },
        })
            .sort({ date: -1 })
            .limit(30);
 
        const chronological = logs.reverse().map(log => ({
            date: log.date,
            weight: log.loggedWeight,
        }));
 
        res.status(200).json(chronological);
    } catch (error) {
        console.error('Weight History Error:', error);
        res.status(500).json({ message: error.message });
    }
});


module.exports = router;