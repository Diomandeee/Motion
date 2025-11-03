'use client';

import { useEffect, useState } from 'react';
import { Activity, Zap, Music } from 'lucide-react';

interface Episode1Features {
  t_host_ms: number;
  lr_pan: number;
  lr_energy: number;
  coherence: number;
  E_left: number;
  E_right: number;
  tempo_bpm: number;
  beat_phase: number;
  system_state: string;
}

export default function Episode1Panel() {
  const [features, setFeatures] = useState<Episode1Features | null>(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        const response = await fetch('/api/episode1?limit=1');
        const result = await response.json();
        
        if (result.success && result.data && result.data.length > 0) {
          setFeatures(result.data[result.data.length - 1]);
          setIsActive(true);
        } else {
          setIsActive(false);
        }
      } catch (error) {
        setIsActive(false);
      }
    };

    const interval = setInterval(fetchFeatures, 100); // 10 Hz
    return () => clearInterval(interval);
  }, []);

  if (!isActive || !features) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Music className="w-5 h-5" />
          Episode 1: Computational Choreography
        </h2>
        <p className="text-gray-400 text-sm">
          Waiting for Episode 1 pipeline... (run: python3 inference/run_episode1_with_web.py)
        </p>
      </div>
    );
  }

  // State colors
  const stateColors = {
    'OK': 'text-green-400',
    'DEGRADED': 'text-yellow-400',
    'PANIC': 'text-red-400',
  };

  const stateColor = stateColors[features.system_state as keyof typeof stateColors] || 'text-gray-400';

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Music className="w-5 h-5" />
        Episode 1: Two-Device Fusion
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Coherence */}
        <div className="bg-gray-700 rounded p-4">
          <div className="text-gray-400 text-xs mb-1">Coherence</div>
          <div className="text-2xl font-bold">{(features.coherence * 100).toFixed(0)}%</div>
          <div className="w-full bg-gray-600 h-2 rounded mt-2">
            <div
              className={`h-2 rounded ${features.coherence > 0.7 ? 'bg-green-500' : features.coherence > 0.4 ? 'bg-yellow-500' : 'bg-red-500'}`}
              style={{ width: `${features.coherence * 100}%` }}
            />
          </div>
        </div>

        {/* Tempo */}
        <div className="bg-gray-700 rounded p-4">
          <div className="text-gray-400 text-xs mb-1">Tempo</div>
          <div className="text-2xl font-bold">{features.tempo_bpm.toFixed(1)} <span className="text-sm text-gray-400">BPM</span></div>
          <div className="text-gray-400 text-xs mt-1">Phase: {features.beat_phase.toFixed(2)}</div>
        </div>

        {/* State */}
        <div className="bg-gray-700 rounded p-4">
          <div className="text-gray-400 text-xs mb-1">System State</div>
          <div className={`text-xl font-bold ${stateColor}`}>{features.system_state}</div>
        </div>

        {/* Energy */}
        <div className="bg-gray-700 rounded p-4">
          <div className="text-gray-400 text-xs mb-1">Combined Energy</div>
          <div className="text-2xl font-bold">{(features.lr_energy * 100).toFixed(0)}%</div>
        </div>
      </div>

      {/* Balance Meter */}
      <div className="mb-4">
        <div className="text-gray-400 text-sm mb-2">Left-Right Balance</div>
        <div className="relative h-12 bg-gray-700 rounded overflow-hidden">
          {/* Center line */}
          <div className="absolute inset-y-0 left-1/2 w-0.5 bg-gray-500" />
          
          {/* Balance indicator */}
          <div
            className="absolute inset-y-0 bg-blue-500 transition-all duration-200"
            style={{
              left: features.lr_pan < 0 ? `${(features.lr_pan + 1) * 50}%` : '50%',
              right: features.lr_pan > 0 ? `${(1 - features.lr_pan) * 50}%` : '50%',
            }}
          />
          
          {/* Labels */}
          <div className="absolute inset-0 flex items-center justify-between px-4 pointer-events-none">
            <span className="text-xs text-gray-300">LEFT</span>
            <span className="text-xs text-white font-semibold">{features.lr_pan.toFixed(2)}</span>
            <span className="text-xs text-gray-300">RIGHT</span>
          </div>
        </div>
      </div>

      {/* Device Energies */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-700 rounded p-3">
          <div className="text-gray-400 text-xs mb-1">Left Device</div>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-400" />
            <span className="text-lg font-semibold">{features.E_left.toFixed(2)}</span>
          </div>
        </div>
        
        <div className="bg-gray-700 rounded p-3">
          <div className="text-gray-400 text-xs mb-1">Right Device</div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-red-400" />
            <span className="text-lg font-semibold">{features.E_right.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Status footer */}
      <div className="mt-4 pt-4 border-t border-gray-700 text-xs text-gray-400">
        Last update: {new Date(features.t_host_ms).toLocaleTimeString()}
      </div>
    </div>
  );
}

