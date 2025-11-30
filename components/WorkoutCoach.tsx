
import React, { useState } from 'react';
import { generatePersonalizedWorkout, generateWorkoutVideo, analyzeForm, editWorkoutImage } from '../services/geminiService';
import { UserProfile, WorkoutRoutine } from '../types';

interface WorkoutCoachProps {
    profile: UserProfile;
}

const WorkoutCoach: React.FC<WorkoutCoachProps> = ({ profile }) => {
  const [activeTab, setActiveTab] = useState<'routine' | 'analyze' | 'edit'>('routine');
  
  // Routine State
  const [routine, setRoutine] = useState<WorkoutRoutine | null>(null);
  const [generatingRoutine, setGeneratingRoutine] = useState(false);
  const [routinePeriod, setRoutinePeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [demoVideos, setDemoVideos] = useState<Record<string, string>>({});
  const [generatingVideoFor, setGeneratingVideoFor] = useState<string | null>(null);

  // Form Check State
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string>('');
  
  // Edit Image State
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [editPrompt, setEditPrompt] = useState('');
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  const handleGenerateRoutine = async () => {
      setGeneratingRoutine(true);
      try {
          const result = await generatePersonalizedWorkout(profile, routinePeriod);
          setRoutine(result);
      } catch (e) {
          alert("Failed to generate workout.");
      } finally {
          setGeneratingRoutine(false);
      }
  }

  const handleGenerateDemo = async (exerciseName: string) => {
    setGeneratingVideoFor(exerciseName);
    try {
      // Use Veo to generate a demo
      const vid = await generateWorkoutVideo(`A fitness model demonstrating how to do ${exerciseName} with perfect form, in a ${profile.workoutPreference} setting.`);
      if (vid) {
          setDemoVideos(prev => ({...prev, [exerciseName]: vid}));
      }
    } catch (e) {
      console.error(e);
      alert("Veo generation failed. Make sure you have a paid API key selected.");
    } finally {
      setGeneratingVideoFor(null);
    }
  };

  const handleFormCheck = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        setAnalysisLoading(true);
        setAnalysisResult("");
        try {
            const result = await analyzeForm(e.target.files[0]);
            setAnalysisResult(result);
        } catch (err) {
            setAnalysisResult("Error analyzing video.");
        } finally {
            setAnalysisLoading(false);
        }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const reader = new FileReader();
        reader.onload = (ev) => {
            setSelectedImage(ev.target?.result as string);
        };
        reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleImageEdit = async () => {
      if (!selectedImage || !editPrompt) return;
      setEditLoading(true);
      try {
          const base64 = selectedImage.split(',')[1];
          const result = await editWorkoutImage(base64, editPrompt);
          setEditedImage(result);
      } catch (e) {
          alert("Image editing failed.");
      } finally {
          setEditLoading(false);
      }
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-4 border-b border-slate-700 pb-2 overflow-x-auto">
        <button 
          onClick={() => setActiveTab('routine')}
          className={`px-4 py-2 font-medium transition-colors ${activeTab === 'routine' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-400 hover:text-white'}`}
        >
          My Routine
        </button>
        <button 
          onClick={() => setActiveTab('analyze')}
          className={`px-4 py-2 font-medium transition-colors ${activeTab === 'analyze' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-400 hover:text-white'}`}
        >
          Form Analyzer
        </button>
        <button 
          onClick={() => setActiveTab('edit')}
          className={`px-4 py-2 font-medium transition-colors ${activeTab === 'edit' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-400 hover:text-white'}`}
        >
          Photo Editor
        </button>
      </div>

      {activeTab === 'routine' && (
        <div className="space-y-6">
             <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h3 className="text-xl font-bold text-white">Your Workout Plan</h3>
                    <p className="text-slate-400 text-sm">Goal: {profile.goal.replace('_', ' ')}</p>
                </div>
                <div className="flex gap-2 items-center bg-slate-900 p-1 rounded-lg">
                    {['daily', 'weekly', 'monthly'].map((p) => (
                        <button 
                            key={p}
                            onClick={() => setRoutinePeriod(p as any)}
                            className={`px-3 py-1.5 rounded capitalize text-sm ${routinePeriod === p ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
                        >
                            {p}
                        </button>
                    ))}
                </div>
                <button 
                    onClick={handleGenerateRoutine}
                    disabled={generatingRoutine}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold disabled:opacity-50 transition-colors shadow-lg shadow-blue-900/20"
                >
                    {generatingRoutine ? "Planning..." : "Generate"}
                </button>
             </div>

             {routine && (
                 <div className="space-y-4 animate-fade-in">
                     {routine.schedule && (
                         <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-6">
                             <h4 className="font-bold text-white mb-4">Schedule Overview</h4>
                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                 {routine.schedule.map((s, i) => (
                                     <div key={i} className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                                         <span className="block text-xs text-blue-400 font-bold uppercase">{s.day}</span>
                                         <span className="text-sm text-slate-300">{s.focus}</span>
                                     </div>
                                 ))}
                             </div>
                         </div>
                     )}

                     {/* Warmup */}
                     <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                         <h4 className="font-bold text-orange-400 mb-2 uppercase text-xs tracking-wider">Warm Up</h4>
                         <ul className="list-disc list-inside text-slate-300 text-sm space-y-1">
                             {routine.warmUp.map((w, i) => <li key={i}>{w}</li>)}
                         </ul>
                     </div>

                     {/* Exercises */}
                     <div className="grid gap-4">
                         {routine.exercises.map((ex, i) => (
                             <div key={i} className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col md:flex-row gap-6">
                                 <div className="flex-1">
                                     <div className="flex items-baseline justify-between mb-2">
                                         <h4 className="text-lg font-bold text-white">{i + 1}. {ex.name}</h4>
                                     </div>
                                     <div className="flex gap-4 mb-3">
                                         <div className="bg-slate-900 px-3 py-1 rounded text-sm text-blue-300 font-mono">Sets: {ex.sets}</div>
                                         <div className="bg-slate-900 px-3 py-1 rounded text-sm text-blue-300 font-mono">Reps: {ex.reps}</div>
                                     </div>
                                     <div className="mb-2">
                                         <span className="text-xs font-bold text-green-500 uppercase">Benefits (Gains)</span>
                                         <p className="text-slate-300 text-sm">{ex.benefits}</p>
                                     </div>
                                     <p className="text-slate-500 text-xs italic border-l-2 border-slate-700 pl-3">{ex.notes}</p>
                                 </div>
                                 
                                 {/* Veo Demo Section */}
                                 <div className="w-full md:w-64 bg-slate-900 rounded-lg overflow-hidden flex-shrink-0 relative min-h-[140px] flex items-center justify-center border border-slate-800 group">
                                     {demoVideos[ex.name] ? (
                                         <video src={demoVideos[ex.name]} controls className="w-full h-full object-cover" />
                                     ) : (
                                         <div className="text-center p-4 w-full h-full flex flex-col items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
                                             <button 
                                                onClick={() => handleGenerateDemo(ex.name)}
                                                disabled={generatingVideoFor === ex.name}
                                                className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-4 py-2 rounded-full transition-colors flex flex-col items-center gap-2 shadow-lg"
                                             >
                                                <span className="text-xl">🎥</span>
                                                {generatingVideoFor === ex.name ? "Generating..." : "Generate AI Demo"}
                                             </button>
                                             <p className="text-[10px] text-slate-500 mt-2">Powered by Veo</p>
                                         </div>
                                     )}
                                 </div>
                             </div>
                         ))}
                     </div>

                      {/* Cooldown */}
                      <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                         <h4 className="font-bold text-blue-400 mb-2 uppercase text-xs tracking-wider">Cool Down</h4>
                         <ul className="list-disc list-inside text-slate-300 text-sm space-y-1">
                             {routine.coolDown.map((w, i) => <li key={i}>{w}</li>)}
                         </ul>
                     </div>
                 </div>
             )}
             {!routine && !generatingRoutine && (
                 <div className="text-center py-10 text-slate-500">Click generate to build your {routinePeriod} routine.</div>
             )}
        </div>
      )}

      {activeTab === 'analyze' && (
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
            <h3 className="text-xl font-bold text-white mb-2">Video Form Analyzer</h3>
            <p className="text-slate-400 mb-4 text-sm">Upload a short clip of your exercise. Gemini Pro will analyze your form.</p>
            
            <label className="block w-full p-8 border-2 border-dashed border-slate-600 rounded-xl text-center cursor-pointer hover:border-blue-500 transition-colors mb-6 group">
                <input type="file" accept="video/*" onChange={handleFormCheck} className="hidden" />
                <div className="group-hover:scale-105 transition-transform">
                    <span className="text-4xl block mb-2">📤</span>
                    <span className="text-slate-300">Click to Upload Video</span>
                </div>
            </label>

            {analysisLoading && <div className="text-center text-blue-400 animate-pulse">Analyzing movement patterns...</div>}
            
            {analysisResult && (
                <div className="bg-slate-900 p-6 rounded-xl border-l-4 border-green-500 animate-fade-in">
                    <h4 className="text-lg font-bold text-white mb-2">Coach Feedback</h4>
                    <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{analysisResult}</p>
                </div>
            )}
        </div>
      )}

      {activeTab === 'edit' && (
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
             <h3 className="text-xl font-bold text-white mb-2">Workout Photo Editor</h3>
             <p className="text-slate-400 mb-4 text-sm">Use "Nano Banana" (Flash Image) to edit your gym selfies.</p>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="mb-4 block w-full text-sm text-slate-400
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-600 file:text-white
                        hover:file:bg-blue-700
                    "/>
                    {selectedImage && (
                        <div className="relative">
                            <img src={selectedImage} alt="Original" className="w-full rounded-lg mb-4" />
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    value={editPrompt} 
                                    onChange={(e) => setEditPrompt(e.target.value)}
                                    placeholder="E.g. Add a retro cyberpunk filter"
                                    className="flex-1 bg-slate-900 p-2 rounded text-white text-sm border border-slate-700 focus:border-blue-500 outline-none"
                                />
                                <button 
                                    onClick={handleImageEdit}
                                    disabled={editLoading}
                                    className="bg-purple-600 hover:bg-purple-700 px-4 rounded text-white text-sm font-bold transition-colors"
                                >
                                    {editLoading ? '...' : 'Edit'}
                                </button>
                            </div>
                        </div>
                    )}
                 </div>
                 <div className="bg-slate-900 rounded-lg flex items-center justify-center min-h-[300px] border border-slate-700">
                     {editedImage ? (
                         <img src={editedImage} alt="Edited" className="w-full h-auto rounded-lg animate-fade-in" />
                     ) : (
                         <div className="text-center p-4">
                             <span className="text-4xl block mb-2">✨</span>
                             <span className="text-slate-500 text-sm">Edited result will appear here</span>
                         </div>
                     )}
                 </div>
             </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutCoach;
