import React, { useState, useEffect } from 'react';
import { findNearbyPlaces } from '../services/geminiService';
import { PlaceResult } from '../types';

const NearbyFinder: React.FC = () => {
  const [places, setPlaces] = useState<PlaceResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    // Basic geolocation
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            (err) => console.error(err)
        );
    }
  }, []);

  const handleSearch = async (type: string) => {
    if (!location) {
        alert("Please allow location access to find nearby places.");
        return;
    }
    setLoading(true);
    try {
        const query = type === 'gym' 
            ? "Find the best rated gyms near me" 
            : "Find healthy restaurants with high protein options near me";
            
        const results = await findNearbyPlaces(query, location);
        setPlaces(results);
    } catch (e) {
        console.error(e);
        alert("Error searching maps.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 h-full">
        <h3 className="text-xl font-bold text-white mb-4">Nearby & Healthy</h3>
        
        <div className="flex gap-4 mb-6">
            <button 
                onClick={() => handleSearch('gym')}
                className="flex-1 bg-slate-700 hover:bg-slate-600 p-4 rounded-xl text-center transition-colors group"
            >
                <span className="text-2xl mb-2 block group-hover:scale-110 transition-transform">🏋️‍♀️</span>
                <span className="font-semibold text-white">Find Gyms</span>
            </button>
            <button 
                onClick={() => handleSearch('food')}
                className="flex-1 bg-slate-700 hover:bg-slate-600 p-4 rounded-xl text-center transition-colors group"
            >
                <span className="text-2xl mb-2 block group-hover:scale-110 transition-transform">🥗</span>
                <span className="font-semibold text-white">Healthy Eats</span>
            </button>
        </div>

        <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {loading && <div className="text-center text-slate-400 py-4">Searching Google Maps...</div>}
            
            {places.map((place, i) => (
                <a 
                    key={i} 
                    href={place.uri} 
                    target="_blank" 
                    rel="noreferrer"
                    className="block bg-slate-900 p-4 rounded-lg hover:bg-slate-950 transition-colors border border-slate-800 hover:border-blue-500"
                >
                    <h4 className="font-bold text-blue-400 mb-1">{place.title}</h4>
                    <span className="text-xs text-slate-500">View on Maps &rarr;</span>
                </a>
            ))}
            {!loading && places.length === 0 && (
                <div className="text-center text-slate-600 text-sm">Select a category to search nearby.</div>
            )}
        </div>
    </div>
  );
};

export default NearbyFinder;
