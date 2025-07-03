
import { NextRequest, NextResponse } from 'next/server';
import { EnhancedQRService } from '@/lib/services/enhanced-qr-service';
import { GeofencingService } from '@/lib/services/geofencing-service';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { stationId, userId, type, journeyId, location } = await request.json();

    if (!stationId || !userId || !type) {
      return NextResponse.json(
        { error: 'Missing required fields: stationId, userId, type' },
        { status: 400 }
      );
    }

    // Validate station exists
    const station = await prisma.station.findUnique({
      where: { id: stationId }
    });

    if (!station) {
      return NextResponse.json(
        { error: 'Station not found' },
        { status: 404 }
      );
    }

    // Validate user location if provided (for geofencing)
    if (location) {
      const isValidLocation = await GeofencingService.validateLocationForEntry(
        stationId, 
        location
      );

      if (!isValidLocation) {
        return NextResponse.json(
          { error: 'User not within station geofence area' },
          { status: 403 }
        );
      }
    }

    let qrCode: string;

    if (type === 'entry') {
      qrCode = await EnhancedQRService.generateStationEntryQR(
        stationId,
        station.code || station.name.substring(0, 3).toUpperCase(),
        userId
      );
    } else if (type === 'exit') {
      if (!journeyId) {
        return NextResponse.json(
          { error: 'Journey ID required for exit QR' },
          { status: 400 }
        );
      }

      qrCode = await EnhancedQRService.generateStationExitQR(
        stationId,
        station.code || station.name.substring(0, 3).toUpperCase(),
        userId,
        journeyId
      );
    } else {
      return NextResponse.json(
        { error: 'Invalid QR type. Must be "entry" or "exit"' },
        { status: 400 }
      );
    }

    // Log QR generation for audit (optional - don't fail if table doesn't exist)
    try {
      await (prisma as any).qrLog?.create({
        data: {
          userId,
          stationId,
          type,
          journeyId,
          generatedAt: new Date(),
          expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
        }
      });
    } catch (error) {
      console.warn('QR logging failed (table may not exist):', error);
    }

    return NextResponse.json({
      qrCode,
      station: {
        id: station.id,
        name: station.name,
        code: station.code
      },
      type,
      validUntil: Date.now() + 5 * 60 * 1000, // 5 minutes
      generatedAt: Date.now()
    });

  } catch (error: any) {
    console.error('QR generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate QR code' },
      { status: 500 }
    );
  }
}
