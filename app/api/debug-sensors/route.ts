import { NextRequest, NextResponse } from 'next/server';

// Simplified debug endpoint that doesn't require Prisma at build time
export async function GET(request: NextRequest) {
  try {
    // Dynamic import of Prisma to avoid build-time errors
    const { prisma } = await import('@/lib/prisma');
    
    const recentReadings = await prisma.sensorReading.findMany({
      orderBy: { timestamp: 'desc' },
      take: 10,
    });
    
    const sensorTypes = Array.from(new Set(recentReadings.map(r => r.sensorName)));
    
    return NextResponse.json({
      success: true,
      totalReadings: recentReadings.length,
      sensorTypes,
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Debug analysis failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
