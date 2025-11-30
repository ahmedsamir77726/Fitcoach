
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, DietPlan, WorkoutRoutine } from "../types";

const getAiClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Helper for Veo API Key Selection ---

const ensureApiKey = async (): Promise<boolean> => {
  const win = window as any;
  if (win.aistudio && win.aistudio.hasSelectedApiKey) {
    const hasKey = await win.aistudio.hasSelectedApiKey();
    if (!hasKey) {
        await win.aistudio.openSelectKey();
        return true;
    }
    return true;
  }
  return true;
};

// --- General AI Intelligence ---

export const getQuickTip = async (profile: UserProfile): Promise<string> => {
  const ai = getAiClient();
  const langPrompt = profile.language === 'ar' ? 'Respond in Arabic.' : 'Respond in English.';
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Give me a 1-sentence personalized fitness tip for a ${profile.age} year old who wants to ${profile.goal}. ${langPrompt}`,
  });
  return response.text || "Consistency is key!";
};

export const chatWithCoach = async (history: { role: string; parts: { text: string }[] }[], message: string, profile: UserProfile) => {
  const ai = getAiClient();
  const lang = profile.language === 'ar' ? 'Arabic' : 'English';
  const chat = ai.chats.create({
    model: 'gemini-3-pro-preview',
    history: history,
    config: {
      systemInstruction: `You are an elite fitness coach. Language: ${lang}. User: ${profile.age}y, ${profile.weight}kg, Goal: ${profile.goal}. Preference: ${profile.workoutPreference}. Be encouraging, precise, and data-driven.`,
    }
  });
  
  const result = await chat.sendMessage({ message });
  return result.text;
};

// --- Personalized Diet Planning ---

export const generatePersonalizedDiet = async (profile: UserProfile, type: 'daily' | 'weekly' = 'daily'): Promise<DietPlan | DietPlan[] | null> => {
  const ai = getAiClient();
  const lang = profile.language === 'ar' ? 'Arabic' : 'English';
  
  const prompt = `Create a ${type} diet plan (${profile.budget} budget) for ${profile.age}y ${profile.gender}, ${profile.weight}kg. 
  Target: ${profile.targetWeight}kg in ${profile.targetTimeline} weeks.
  Cheat Day: ${profile.cheatDay}.
  Goal: ${profile.goal}. Restrictions: ${profile.dietaryRestrictions || 'None'}.
  Language: ${lang}.
  Return valid JSON. For weekly, return an array of 7 daily plans. For daily, return one object.
  Include cost estimate ($ to $$$) per meal.`;

  const schema = type === 'daily' ? {
        type: Type.OBJECT,
        properties: {
          day: { type: Type.STRING },
          isCheatDay: { type: Type.BOOLEAN },
          breakfast: {
             type: Type.OBJECT,
             properties: { name: {type: Type.STRING}, calories: {type: Type.NUMBER}, costEstimate: {type:Type.STRING}, macros: { type: Type.OBJECT, properties: { p: {type:Type.STRING}, c: {type:Type.STRING}, f: {type:Type.STRING} } }, ingredients: {type: Type.ARRAY, items: {type: Type.STRING}}, instructions: {type: Type.STRING} }
          },
          lunch: {
             type: Type.OBJECT,
             properties: { name: {type: Type.STRING}, calories: {type: Type.NUMBER}, costEstimate: {type:Type.STRING}, macros: { type: Type.OBJECT, properties: { p: {type:Type.STRING}, c: {type:Type.STRING}, f: {type:Type.STRING} } }, ingredients: {type: Type.ARRAY, items: {type: Type.STRING}}, instructions: {type: Type.STRING} }
          },
          dinner: {
             type: Type.OBJECT,
             properties: { name: {type: Type.STRING}, calories: {type: Type.NUMBER}, costEstimate: {type:Type.STRING}, macros: { type: Type.OBJECT, properties: { p: {type:Type.STRING}, c: {type:Type.STRING}, f: {type:Type.STRING} } }, ingredients: {type: Type.ARRAY, items: {type: Type.STRING}}, instructions: {type: Type.STRING} }
          },
          snacks: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: { name: {type: Type.STRING}, calories: {type: Type.NUMBER}, costEstimate: {type:Type.STRING}, macros: { type: Type.OBJECT, properties: { p: {type:Type.STRING}, c: {type:Type.STRING}, f: {type:Type.STRING} } }, ingredients: {type: Type.ARRAY, items: {type: Type.STRING}}, instructions: {type: Type.STRING} }
            }
          }
        }
      } : {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                day: { type: Type.STRING },
                isCheatDay: { type: Type.BOOLEAN },
                breakfast: {
                    type: Type.OBJECT,
                    properties: { name: {type: Type.STRING}, calories: {type: Type.NUMBER}, costEstimate: {type:Type.STRING}, macros: { type: Type.OBJECT, properties: { p: {type:Type.STRING}, c: {type:Type.STRING}, f: {type:Type.STRING} } }, ingredients: {type: Type.ARRAY, items: {type: Type.STRING}}, instructions: {type: Type.STRING} }
                },
                lunch: {
                    type: Type.OBJECT,
                    properties: { name: {type: Type.STRING}, calories: {type: Type.NUMBER}, costEstimate: {type:Type.STRING}, macros: { type: Type.OBJECT, properties: { p: {type:Type.STRING}, c: {type:Type.STRING}, f: {type:Type.STRING} } }, ingredients: {type: Type.ARRAY, items: {type: Type.STRING}}, instructions: {type: Type.STRING} }
                },
                dinner: {
                    type: Type.OBJECT,
                    properties: { name: {type: Type.STRING}, calories: {type: Type.NUMBER}, costEstimate: {type:Type.STRING}, macros: { type: Type.OBJECT, properties: { p: {type:Type.STRING}, c: {type:Type.STRING}, f: {type:Type.STRING} } }, ingredients: {type: Type.ARRAY, items: {type: Type.STRING}}, instructions: {type: Type.STRING} }
                },
                snacks: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: { name: {type: Type.STRING}, calories: {type: Type.NUMBER}, costEstimate: {type:Type.STRING}, macros: { type: Type.OBJECT, properties: { p: {type:Type.STRING}, c: {type:Type.STRING}, f: {type:Type.STRING} } }, ingredients: {type: Type.ARRAY, items: {type: Type.STRING}}, instructions: {type: Type.STRING} }
                    }
                }
            }
        }
      };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: schema
    }
  });
  
  try {
      return JSON.parse(response.text || "{}");
  } catch (e) {
      console.error(e);
      return null;
  }
};

export const generateRecoveryPlan = async (profile: UserProfile): Promise<string> => {
    const ai = getAiClient();
    const lang = profile.language === 'ar' ? 'Arabic' : 'English';
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `User missed their diet/workout yesterday. Create a 1-day recovery plan to get back on track.
        User: ${profile.name}, Goal: ${profile.goal}. Language: ${lang}.
        Keep it brief and motivating.`,
    });
    return response.text || "Rest and hydrate.";
}

export const generateMealImage = async (mealName: string, size: "1K" | "2K" | "4K" = "1K"): Promise<string | null> => {
  await ensureApiKey(); 
  const ai = getAiClient();
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: {
        parts: [{ text: `A delicious, professional food photography shot of ${mealName}, healthy, studio lighting, high resolution.` }]
    },
    config: {
        imageConfig: {
            imageSize: size,
            aspectRatio: "1:1"
        }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
};

// --- Personalized Workout Planning ---

export const generatePersonalizedWorkout = async (profile: UserProfile, period: 'daily' | 'weekly' | 'monthly' = 'daily'): Promise<WorkoutRoutine | null> => {
    const ai = getAiClient();
    const lang = profile.language === 'ar' ? 'Arabic' : 'English';
    
    const prompt = `Create a ${period} workout routine for ${profile.workoutPreference}.
    User Stats: ${profile.age}y, ${profile.weight}kg, Goal: ${profile.goal}.
    Language: ${lang}.
    For each exercise, explain briefly "What I will gain" (benefits).
    If weekly/monthly, provide a schedule summary.
    Return valid JSON.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    period: { type: Type.STRING },
                    warmUp: { type: Type.ARRAY, items: { type: Type.STRING } },
                    exercises: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING },
                                sets: { type: Type.STRING },
                                reps: { type: Type.STRING },
                                notes: { type: Type.STRING },
                                benefits: { type: Type.STRING }
                            }
                        }
                    },
                    coolDown: { type: Type.ARRAY, items: { type: Type.STRING } },
                    schedule: {
                        type: Type.ARRAY,
                        items: {
                             type: Type.OBJECT,
                             properties: {
                                 day: { type: Type.STRING },
                                 focus: { type: Type.STRING }
                             }
                        }
                    }
                }
            }
        }
    });

    try {
        return JSON.parse(response.text || "{}");
    } catch (e) {
        console.error("Error parsing workout", e);
        return null;
    }
}

export const analyzeForm = async (videoFile: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64Data = (reader.result as string).split(',')[1];
            try {
                const ai = getAiClient();
                const response = await ai.models.generateContent({
                    model: 'gemini-3-pro-preview',
                    contents: {
                        parts: [
                            { inlineData: { mimeType: videoFile.type, data: base64Data } },
                            { text: "Analyze the form in this workout video. Identify the exercise and provide 3 precise corrections to improve safety and efficiency." }
                        ]
                    }
                });
                resolve(response.text || "Could not analyze video.");
            } catch (e) {
                console.error(e);
                reject("Error analyzing video.");
            }
        };
        reader.readAsDataURL(videoFile);
    });
};

export const generateWorkoutVideo = async (prompt: string): Promise<string | null> => {
    // Ensure key initially
    await ensureApiKey();
    let ai = getAiClient();
    
    const attemptGeneration = async () => {
        let operation = await ai.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: `Instructional fitness video, perfect form: ${prompt}`,
            config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio: '16:9'
            }
        });

        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 5000));
            operation = await ai.operations.getVideosOperation({ operation: operation });
        }
        return operation;
    };

    try {
        const operation = await attemptGeneration();
        const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (videoUri) {
            return `${videoUri}&key=${process.env.API_KEY}`;
        }
    } catch (e: any) {
        // Handle "Requested entity was not found" error (invalid/expired key)
        if (e.message && e.message.includes("Requested entity was not found")) {
            console.warn("Veo API Key invalid, prompting re-selection...");
            const win = window as any;
            if (win.aistudio && win.aistudio.openSelectKey) {
                await win.aistudio.openSelectKey();
                // Refresh client and retry once
                ai = getAiClient();
                try {
                    const operation = await attemptGeneration();
                    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
                    if (videoUri) {
                         return `${videoUri}&key=${process.env.API_KEY}`;
                    }
                } catch (retryError) {
                    console.error("Retry failed for Veo generation", retryError);
                }
            }
        } else {
            console.error("Veo generation failed", e);
        }
    }
    return null;
};

// --- Image Editing ---
export const editWorkoutImage = async (imageBase64: string, prompt: string): Promise<string | null> => {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [
                { inlineData: { mimeType: 'image/png', data: imageBase64 } },
                { text: prompt }
            ]
        }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
            return `data:image/png;base64,${part.inlineData.data}`;
        }
    }
    return null;
}

// --- Grounding ---

export const findNearbyPlaces = async (query: string, location: { lat: number, lng: number }): Promise<any[]> => {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: query,
        config: {
            tools: [{ googleMaps: {} }],
            toolConfig: {
                retrievalConfig: {
                    latLng: {
                        latitude: location.lat,
                        longitude: location.lng
                    }
                }
            }
        }
    });

    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    return chunks.filter((c: any) => c.web?.uri || c.maps?.uri).map((c: any) => ({
        title: c.web?.title || c.maps?.title || "Result",
        uri: c.web?.uri || c.maps?.uri,
        address: c.maps?.placeAnswerSources?.place?.formattedAddress
    }));
};

export const searchFitnessTrends = async (query: string): Promise<any> => {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: query,
        config: {
            tools: [{ googleSearch: {} }]
        }
    });
    
    return {
        text: response.text,
        sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };
};
