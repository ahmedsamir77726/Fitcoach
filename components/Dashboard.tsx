import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { DailyMetric, UserProfile } from '../types';
import { getQuickTip, generateRecoveryPlan } from '../services/geminiService';

interface DashboardProps {
    profile: UserProfile;
}

const mockData: DailyMetric[] = [
  { day: 'Mon', weight: 0, calories: 2100, heartRate: 72 },
  { day: 'Tue', weight: 0, calories: 2300, heartRate: 75 },
  { day: 'Wed', weight: 0, calories: 1950, heartRate: 70 },
  { day: 'Thu', weight: 0, calories: 2400, heartRate: 78 },
  { day: 'Fri', weight: 0, calories: 2200, heartRate: 74 },
  { day: 'Sat', weight: 0, calories: 2500, heartRate: 80 },
  { day: 'Sun', weight: 0, calories: 2100, heartRate: 71 },
];

const Dashboard: React.FC<DashboardProps> = ({ profile }) => {
  const [tip, setTip] = useState("Loading inspiration...");
  const [deviceConnected, setDeviceConnected] = useState(false);
  const [heartRate, setHeartRate] = useState<number | string>('--');
  const [connecting, setConnecting] = useState(false);
  
  const [recoveryPlan, setRecoveryPlan] = useState<string | null>(null);
  const [generatingRecovery, setGeneratingRecovery] = useState(false);

  // Hydrate mock data with user weight as baseline
  const [chartData, setChartData] = useState(mockData);

  useEffect(() => {
    getQuickTip(profile).then(setTip);
    
    // Adjust mock data to hover around user's current weight
    const adjusted = mockData.map(d => ({
        ...d,
        weight: profile.weight + (Math.random() * 1 - 0.5)
    }));
    setChartData(adjusted);
  }, [profile]);

  const handleConnectDevice = async () => {
      setConnecting(true);
      const nav = navigator as any;
      if (!nav.bluetooth) {
          alert("Web Bluetooth is not supported in this browser. Try Chrome.");
          setConnecting(false);
          return;
      }
      try {
          const device = await nav.bluetooth.requestDevice({
              filters: [{ services: ['heart_rate'] }]
          });
          const server = await device.gatt?.connect();
          const service = await server?.getPrimaryService('heart_rate');
          const char = await service?.getCharacteristic('heart_rate_measurement');
          
          if (char) {
              char.startNotifications();
              char.addEventListener('characteristicvaluechanged', (event: any) => {
                  const value = event.target.value;
                  // Basic parsing for HR (uint8)
                  const hr = value.getUint8(1);
                  setHeartRate(hr);
              });
              setDeviceConnected(true);
          }
      } catch (e) {
          console.error(e);
          alert("Could not connect to heart rate monitor.");
      } finally {
          setConnecting(false);
      }
  }

  const handleRecovery = async () => {
      setGeneratingRecovery(true);
      const plan = await generateRecoveryPlan(profile);
      setRecoveryPlan(plan);
      setGeneratingRecovery(false);
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Welcome Card */}
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg">
          <div className="flex justify-between items-start">
            <div>
                <h2 className="text-2xl font-bold text-white mb-2">Hello, {profile.name}</h2>
                <p className="text-slate-400 mb-4">Target: <span className="text-blue-400">{profile.targetWeight}kg</span> in {profile.targetTimeline} weeks</p>
            </div>
            <div className="text-right">
                <p className="text-3xl font-bold text-white">{profile.weight}<span className="text-sm text-slate-500 ml-1">kg</span></p>
                <p className="text-slate-500 text-xs">Current Weight</p>
            </div>
          </div>
          <div className="bg-slate-900/50 p-4 rounded-xl border border-blue-500/30">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚡</span>
              <div>
                <h3 className="text-sm font-semibold text-blue-400">Coach's Daily Tip</h3>
                <p className="text-sm text-slate-300 mt-1 italic">"{tip}"</p>
              </div>
            </div>
          </div>
        </div>

        {/* Smartwatch Integration Stats */}
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
             <h3 className="text-lg font-semibold text-white">Live Metrics</h3>
             {!deviceConnected ? (
                 <button 
                    onClick={handleConnectDevice}
                    disabled={connecting}
                    className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-full transition-colors flex items-center gap-1"
                 >
                    <span className="text-sm">⌚</span>
                    {connecting ? 'Connecting...' : 'Connect Watch'}
                 </button>
             ) : (
                <span className="flex items-center gap-2 text-xs text-green-400 bg-green-900/30 px-2 py-1 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    Bluetooth Connected
                </span>
             )}
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center bg-slate-900 p-3 rounded-xl border border-slate-800">
               <p className="text-xs text-slate-500 uppercase mb-1">Heart Rate</p>
               <p className="text-xl font-bold text-red-400">{heartRate} <span className="text-xs text-slate-600">BPM</span></p>
            </div>
            <div className="text-center bg-slate-900 p-3 rounded-xl border border-slate-800">
               <p className="text-xs text-slate-500 uppercase mb-1">Steps</p>
               <p className="text-xl font-bold text-blue-400">{deviceConnected ? '2,432' : '--'}</p>
            </div>
            <div className="text-center bg-slate-900 p-3 rounded-xl border border-slate-800">
               <p className="text-xs text-slate-500 uppercase mb-1">Cals Burned</p>
               <p className="text-xl font-bold text-orange-400">{deviceConnected ? '450' : '--'} <span className="text-xs text-slate-600">kcal</span></p>
            </div>
          </div>
          
          {!deviceConnected && (
              <p className="text-xs text-slate-500 mt-2 text-center">Use a Web Bluetooth compatible heart rate monitor.</p>
          )}
        </div>
      </div>
    
      {/* Recovery Section */}
      <div className="bg-gradient-to-r from-red-900/20 to-slate-800 p-6 rounded-2xl border border-slate-700 flex flex-col md:flex-row items-center justify-between gap-4">
           <div>
               <h3 className="text-lg font-bold text-white">Missed a workout or cheated on diet?</h3>
               <p className="text-slate-400 text-sm">Generate a 1-day recovery plan to get back on track without guilt.</p>
           </div>
           <button 
                onClick={handleRecovery}
                disabled={generatingRecovery}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors whitespace-nowrap"
           >
               {generatingRecovery ? "Generating..." : "🚑 Create Recovery Plan"}
           </button>
      </div>
      
      {recoveryPlan && (
          <div className="bg-slate-800 p-6 rounded-2xl border border-blue-500 animate-in fade-in slide-in-from-top-4">
               <h4 className="font-bold text-blue-400 mb-2">Recovery Protocol</h4>
               <p className="text-slate-300 whitespace-pre-wrap">{recoveryPlan}</p>
               <button onClick={() => setRecoveryPlan(null)} className="text-xs text-slate-500 mt-4 hover:text-white underline">Dismiss</button>
          </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
           <h3 className="text-lg font-semibold text-white mb-4">Projected Progress</h3>
           <div className="h-64 w-full">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={chartData}>
                 <defs>
                   <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8}/>
                     <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                 <XAxis dataKey="day" stroke="#94a3b8" />
                 <YAxis domain={['dataMin - 1', 'dataMax + 1']} stroke="#94a3b8" />
                 <Tooltip contentStyle={{backgroundColor: '#1e293b', border: 'none', borderRadius: '8px'}} />
                 <Area type="monotone" dataKey="weight" stroke="#a855f7" fillOpacity={1} fill="url(#colorWeight)" />
               </AreaChart>
             </ResponsiveContainer>
           </div>
        </div>

        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
           <h3 className="text-lg font-semibold text-white mb-4">Calorie Intake</h3>
           <div className="h-64 w-full">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={chartData}>
                 <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                 <XAxis dataKey="day" stroke="#94a3b8" />
                 <YAxis stroke="#94a3b8" />
                 <Tooltip contentStyle={{backgroundColor: '#1e293b', border: 'none', borderRadius: '8px'}} />
                 <Bar dataKey="calories" fill="#3b82f6" radius={[4, 4, 0, 0]} />
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;