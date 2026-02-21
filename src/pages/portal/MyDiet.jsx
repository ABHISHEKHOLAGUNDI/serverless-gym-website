import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UtensilsCrossed, Coffee, Sun, Sunset, Moon } from 'lucide-react';

const mealIcons = {
    'Breakfast': <Coffee size={18} />,
    'Morning Snack': <Sun size={18} />,
    'Lunch': <UtensilsCrossed size={18} />,
    'Evening Snack': <Sunset size={18} />,
    'Dinner': <Moon size={18} />,
};

const mealColors = {
    'Breakfast': 'from-amber-500/15 to-amber-600/5 border-amber-400/20 text-amber-400',
    'Morning Snack': 'from-yellow-500/15 to-yellow-600/5 border-yellow-400/20 text-yellow-400',
    'Lunch': 'from-green-500/15 to-green-600/5 border-green-400/20 text-green-400',
    'Evening Snack': 'from-orange-500/15 to-orange-600/5 border-orange-400/20 text-orange-400',
    'Dinner': 'from-indigo-500/15 to-indigo-600/5 border-indigo-400/20 text-indigo-400',
};

const MyDiet = () => {
    const [meals, setMeals] = useState([]);

    useEffect(() => {
        fetch('/api/portal/diet').then(r => r.json()).then(setMeals).catch(console.error);
    }, []);

    return (
        <div className="space-y-6 pb-6">
            <h2 className="text-xl font-display font-bold text-gold-400 tracking-wider">MY DIET PLAN</h2>

            {meals.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="glass-card rounded-2xl p-8 border border-white/[0.06] text-center">
                    <UtensilsCrossed className="mx-auto text-gray-600 mb-3" size={40} />
                    <h3 className="text-sm font-tech text-gray-400 tracking-wider mb-1">NO DIET PLAN ASSIGNED</h3>
                    <p className="text-xs font-tech text-gray-600">Your gym owner will assign a diet plan for you.</p>
                </motion.div>
            ) : (
                <div className="space-y-3">
                    {meals.map((meal, i) => {
                        const colors = mealColors[meal.meal_type] || 'border-white/[0.06] text-gray-400';
                        return (
                            <motion.div
                                key={meal.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.08 }}
                                className={`glass-card rounded-2xl p-5 border bg-gradient-to-r ${colors.split(' ').slice(0, 3).join(' ')}`}
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 ${colors.split(' ').pop()}`}>
                                        {mealIcons[meal.meal_type] || <UtensilsCrossed size={18} />}
                                    </div>
                                    <h3 className="text-sm font-tech font-bold text-white tracking-wider">{meal.meal_type?.toUpperCase()}</h3>
                                </div>
                                <p className="text-sm font-tech text-gray-300 leading-relaxed pl-1">{meal.items}</p>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MyDiet;
