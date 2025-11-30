
import React, { useState } from 'react';
import { UserProfile } from '../types';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    goal: 'lose_weight',
    activityLevel: 'sedentary',
    workoutPreference: 'gym',
    gender: 'male',
    language: 'en',
    budget: 'moderate',
    cheatDay: 'sun',
    targetTimeline: 12,
    name: ''
  });

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
    else {
      if (!profile.name || !profile.weight || !profile.height || !profile.targetWeight) {
        alert("Please fill in all required fields.");
        return;
      }
      onComplete(profile as UserProfile);
    }
  };

  const handleChange = (field: keyof UserProfile, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl max-w-lg w-full border border-slate-700">
        <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Setup Your Profile</h1>
            <p className="text-slate-400">Step {step} of 4</p>
            <div className="w-full bg-slate-700 h-2 rounded-full mt-2">
                <div className="bg-blue-500 h-2 rounded-full transition-all duration-300" style={{ width: `${(step/4)*100}%` }}></div>
            </div>
        </div>

        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Language / اللغة</label>
                    <select value={profile.language} onChange={e => handleChange('language', e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-blue-500 outline-none">
                        <option value="en">English</option>
                        <option value="ar">العربية</option>
                    </select>
                </div>
                <div>
                     <label className="block text-sm font-medium text-slate-300 mb-1">Name</label>
                     <input type="text" value={profile.name} onChange={e => handleChange('name', e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-blue-500 outline-none" placeholder="Your Name" />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Age</label>
                    <input type="number" value={profile.age || ''} onChange={e => handleChange('age', parseInt(e.target.value))} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-blue-500 outline-none" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Gender</label>
                    <select value={profile.gender} onChange={e => handleChange('gender', e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-blue-500 outline-none">
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </select>
                </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
             <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Current Weight (kg)</label>
                    <input type="number" value={profile.weight || ''} onChange={e => handleChange('weight', parseFloat(e.target.value))} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-blue-500 outline-none" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Target Weight (kg)</label>
                    <input type="number" value={profile.targetWeight || ''} onChange={e => handleChange('targetWeight', parseFloat(e.target.value))} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-blue-500 outline-none" />
                </div>
            </div>
            <div>
                 <label className="block text-sm font-medium text-slate-300 mb-1">Goal Timeline (Weeks)</label>
                 <input type="range" min="4" max="52" value={profile.targetTimeline} onChange={e => handleChange('targetTimeline', parseInt(e.target.value))} className="w-full accent-blue-500" />
                 <p className="text-right text-xs text-blue-400">{profile.targetTimeline} weeks</p>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Height (cm)</label>
                <input type="number" value={profile.height || ''} onChange={e => handleChange('height', parseFloat(e.target.value))} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-blue-500 outline-none" />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
             <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Primary Goal</label>
                <select value={profile.goal} onChange={e => handleChange('goal', e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-blue-500 outline-none">
                    <option value="lose_weight">Lose Weight</option>
                    <option value="gain_muscle">Build Muscle</option>
                    <option value="maintain">Maintain</option>
                    <option value="endurance">Endurance</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Activity Level</label>
                <select value={profile.activityLevel} onChange={e => handleChange('activityLevel', e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-blue-500 outline-none">
                    <option value="sedentary">Sedentary (Office Job)</option>
                    <option value="active">Active (1-3 days/week)</option>
                    <option value="athlete">Athlete (5+ days/week)</option>
                </select>
            </div>
             <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Workout Preference</label>
                <div className="grid grid-cols-2 gap-4">
                    <button 
                        onClick={() => handleChange('workoutPreference', 'home')}
                        className={`p-4 rounded-xl border transition-all ${profile.workoutPreference === 'home' ? 'bg-blue-600/20 border-blue-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'}`}
                    >
                        🏠 Home
                    </button>
                    <button 
                        onClick={() => handleChange('workoutPreference', 'gym')}
                        className={`p-4 rounded-xl border transition-all ${profile.workoutPreference === 'gym' ? 'bg-blue-600/20 border-blue-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'}`}
                    >
                        🏋️ Gym
                    </button>
                </div>
            </div>
          </div>
        )}

        {step === 4 && (
             <div className="space-y-4 animate-fade-in">
                 <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Meal Budget</label>
                    <div className="flex gap-2">
                        {['cheap', 'moderate', 'expensive'].map((b) => (
                            <button 
                                key={b}
                                onClick={() => handleChange('budget', b)}
                                className={`flex-1 p-2 rounded-lg border text-sm capitalize ${profile.budget === b ? 'bg-green-600/20 border-green-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'}`}
                            >
                                {b}
                            </button>
                        ))}
                    </div>
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Preferred Cheat Day</label>
                    <select value={profile.cheatDay} onChange={e => handleChange('cheatDay', e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-blue-500 outline-none">
                        <option value="none">No Cheat Days</option>
                        <option value="fri">Friday</option>
                        <option value="sat">Saturday</option>
                        <option value="sun">Sunday</option>
                    </select>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Dietary Restrictions (Optional)</label>
                    <input type="text" value={profile.dietaryRestrictions || ''} onChange={e => handleChange('dietaryRestrictions', e.target.value)} placeholder="e.g., Vegan, Nut Allergy" className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-blue-500 outline-none" />
                </div>
             </div>
        )}

        <button 
          onClick={handleNext}
          className="mt-8 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-colors"
        >
          {step === 4 ? "Start My Journey" : "Next Step"}
        </button>
      </div>
    </div>
  );
};

export default Onboarding;
