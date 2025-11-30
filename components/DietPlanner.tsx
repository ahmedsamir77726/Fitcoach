
import React, { useState } from 'react';
import { generatePersonalizedDiet, generateMealImage } from '../services/geminiService';
import { UserProfile, DietPlan, DietMeal } from '../types';

interface DietPlannerProps {
    profile: UserProfile;
}

interface MealCardProps {
    meal: DietMeal;
    title: string;
    generatingImg: string | null;
    mealImages: Record<string, string>;
    onGenerateImage: (name: string) => void;
}

const MealCard: React.FC<MealCardProps> = ({ meal, title, generatingImg, mealImages, onGenerateImage }) => (
    <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden flex flex-col h-full hover:border-slate-500 transition-colors">
        <div className="relative h-48 bg-slate-900 flex items-center justify-center group">
            {mealImages[meal.name] ? (
            <img src={mealImages[meal.name]} alt={meal.name} className="w-full h-full object-cover animate-fade-in" />
            ) : (
            <div className="text-center p-4">
                <p className="text-slate-500 mb-2 text-sm">No photo available</p>
                <button 
                onClick={() => onGenerateImage(meal.name)}
                disabled={generatingImg === meal.name}
                className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-full transition-colors flex items-center gap-1 mx-auto"
                >
                <span className="text-lg">📸</span> {generatingImg === meal.name ? "Generating..." : "Generate AI Photo"}
                </button>
            </div>
            )}
        </div>
        
        <div className="p-5 flex-1 flex flex-col">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">{title}</span>
                    <h3 className="text-lg font-bold text-white leading-tight">{meal.name}</h3>
                    <p className="text-xs text-green-400 mt-1 font-mono">Cost: {meal.costEstimate}</p>
                </div>
                <span className="text-slate-300 text-sm font-mono whitespace-nowrap bg-slate-700 px-2 py-1 rounded">{meal.calories} kcal</span>
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-xs text-slate-400 mb-4 bg-slate-900/50 p-2 rounded-lg">
                <div className="text-center">
                    <span className="block text-white font-bold">{meal.macros.p}</span>
                    Protein
                </div>
                <div className="text-center border-l border-slate-700">
                    <span className="block text-white font-bold">{meal.macros.c}</span>
                    Carbs
                </div>
                <div className="text-center border-l border-slate-700">
                    <span className="block text-white font-bold">{meal.macros.f}</span>
                    Fats
                </div>
            </div>

            <div className="mt-auto space-y-3">
                <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase mb-1">Ingredients</p>
                    <div className="flex flex-wrap gap-1">
                        {meal.ingredients.map((ing, i) => (
                            <span key={i} className="text-xs text-slate-300 bg-slate-700 px-2 py-1 rounded-sm">
                                {ing}
                            </span>
                        ))}
                    </div>
                </div>
                <div>
                     <p className="text-xs text-slate-500 font-semibold uppercase mb-1">Instructions</p>
                     <p className="text-xs text-slate-400 line-clamp-3 hover:line-clamp-none transition-all cursor-pointer">{meal.instructions}</p>
                </div>
            </div>
        </div>
    </div>
);

const DietPlanner: React.FC<DietPlannerProps> = ({ profile }) => {
  const [plans, setPlans] = useState<DietPlan[]>([]);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('daily');
  const [loading, setLoading] = useState(false);
  const [generatingImg, setGeneratingImg] = useState<string | null>(null);
  const [mealImages, setMealImages] = useState<Record<string, string>>({});

  const handleGeneratePlan = async () => {
    setLoading(true);
    try {
      const result = await generatePersonalizedDiet(profile, viewMode);
      if (Array.isArray(result)) {
          setPlans(result);
          setSelectedDayIndex(0);
      } else if (result) {
          setPlans([result]);
          setSelectedDayIndex(0);
      }
    } catch (e) {
      console.error(e);
      alert("Failed to generate plan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateImage = async (mealName: string) => {
    setGeneratingImg(mealName);
    try {
      const img = await generateMealImage(mealName, "1K");
      if (img) {
        setMealImages(prev => ({...prev, [mealName]: img}));
      }
    } catch (e) {
      console.error(e);
      alert("Error generating image.");
    } finally {
      setGeneratingImg(null);
    }
  };

  const currentPlan = plans[selectedDayIndex];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-8 rounded-2xl border border-slate-700 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
            <h2 className="text-3xl font-bold text-white mb-2">My Diet Plan</h2>
            <p className="text-slate-400">
                Budget: <span className="text-white capitalize">{profile.budget}</span> • 
                Cheat Day: <span className="text-white capitalize">{profile.cheatDay}</span>
            </p>
        </div>
        <div className="flex gap-4">
             <div className="bg-slate-900 rounded-lg p-1 flex items-center">
                 <button onClick={() => setViewMode('daily')} className={`px-4 py-2 rounded-md text-sm transition-colors ${viewMode === 'daily' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}>Daily</button>
                 <button onClick={() => setViewMode('weekly')} className={`px-4 py-2 rounded-md text-sm transition-colors ${viewMode === 'weekly' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}>Weekly</button>
             </div>
             <button 
                onClick={handleGeneratePlan}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-green-900/20"
             >
                {loading ? (
                    <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Generating...
                    </>
                ) : "Generate"}
             </button>
        </div>
      </div>

      {/* Weekly Tabs */}
      {viewMode === 'weekly' && plans.length > 1 && (
          <div className="flex overflow-x-auto gap-2 pb-2">
              {plans.map((p, i) => (
                  <button 
                    key={i}
                    onClick={() => setSelectedDayIndex(i)}
                    className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition-colors ${i === selectedDayIndex ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                  >
                      {p.day || `Day ${i+1}`} {p.isCheatDay ? ' (Cheat)' : ''}
                  </button>
              ))}
          </div>
      )}

      {!currentPlan && !loading && (
          <div className="text-center py-20 bg-slate-800/50 rounded-2xl border border-dashed border-slate-700">
              <p className="text-slate-500 mb-4">No plan generated yet.</p>
              <p className="text-sm text-slate-600">Click generate to start.</p>
          </div>
      )}

      {currentPlan && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
           {currentPlan.isCheatDay ? (
               <div className="col-span-full bg-gradient-to-r from-yellow-900/40 to-slate-800 p-8 rounded-2xl border border-yellow-700/50 text-center">
                   <h3 className="text-4xl mb-4">🍔🍕🍦</h3>
                   <h3 className="text-2xl font-bold text-white mb-2">It's Cheat Day!</h3>
                   <p className="text-slate-300">Enjoy your food freely today, but try to keep portions reasonable.</p>
               </div>
           ) : (
             <>
                <MealCard 
                        key="breakfast" 
                        meal={currentPlan.breakfast} 
                        title="Breakfast" 
                        generatingImg={generatingImg} 
                        mealImages={mealImages} 
                        onGenerateImage={handleGenerateImage} 
                />
                <MealCard 
                        key="lunch" 
                        meal={currentPlan.lunch} 
                        title="Lunch" 
                        generatingImg={generatingImg} 
                        mealImages={mealImages} 
                        onGenerateImage={handleGenerateImage} 
                />
                <MealCard 
                        key="dinner" 
                        meal={currentPlan.dinner} 
                        title="Dinner" 
                        generatingImg={generatingImg} 
                        mealImages={mealImages} 
                        onGenerateImage={handleGenerateImage} 
                />
                {currentPlan.snacks.map((snack, i) => (
                    <MealCard 
                            key={i} 
                            meal={snack} 
                            title={`Snack ${i+1}`} 
                            generatingImg={generatingImg} 
                            mealImages={mealImages} 
                            onGenerateImage={handleGenerateImage} 
                    />
                ))}
             </>
           )}
        </div>
      )}
    </div>
  );
};

export default DietPlanner;
