import { NextRequest, NextResponse } from 'next/server';

// Episode 1 feature packet type
interface Episode1Features {
  t_host_ms: number;
  lr_pan: number;          // [-1, 1]
  lr_energy: number;       // [0, 1]
  coherence: number;       // [0, 1]
  E_left: number;
  E_right: number;
  tempo_bpm: number;
  beat_phase: number;      // [0, 1]
  system_state: string;    // 'OK' | 'DEGRADED' | 'PANIC'
  altitude_left?: number;
  altitude_right?: number;
  speed_left?: number;
  speed_right?: number;
}

// In-memory buffer for Episode 1 features
let ep1FeatureBuffer: Episode1Features[] = [];
const MAX_EP1_BUFFER = 1000;

// POST endpoint - receive Episode 1 features from Python backend
export async function POST(request: NextRequest) {
  try {
    const features: Episode1Features = await request.json();
    
    // Add to buffer
    ep1FeatureBuffer.push(features);
    
    // Trim buffer
    if (ep1FeatureBuffer.length > MAX_EP1_BUFFER) {
      ep1FeatureBuffer = ep1FeatureBuffer.slice(-MAX_EP1_BUFFER);
    }
    
    console.log(`✅ Episode 1 feature received: pan=${features.lr_pan.toFixed(2)}, coherence=${features.coherence.toFixed(2)}, state=${features.system_state}`);
    
    return NextResponse.json({
      success: true,
      bufferSize: ep1FeatureBuffer.length,
      timestamp: Date.now(),
    });
    
  } catch (error) {
    console.error('❌ Error processing Episode 1 features:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process Episode 1 features',
        details: error instanceof Error ? error.message : 'Unknown error',
      }, 
      { status: 500 }
    );
  }
}

// GET endpoint - retrieve Episode 1 features for dashboard
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '100');
    
    const recentFeatures = ep1FeatureBuffer.slice(-limit);
    
    return NextResponse.json({
      success: true,
      data: recentFeatures,
      total: ep1FeatureBuffer.length,
      timestamp: Date.now(),
    });
    
  } catch (error) {
    console.error('Error retrieving Episode 1 features:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to retrieve Episode 1 features',
      }, 
      { status: 500 }
    );
  }
}

