
import { NextRequest, NextResponse } from 'next/server';
import { EnhancedQRService } from '@/lib/services/enhanced-qr-service';
import { JourneyService } from '@/lib/services/journey-service';
import { prisma } from '@/lib/db';
import { EntryMethod } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const { qrCode, scannerId, scannerLocation } = await request.json();

    if (!qrCode || !scannerId) {
      return NextResponse.json(
        { error: 'Missing required fields: qrCode, scannerId' },
        { status: 400 }
      );
    }

    // Validate QR code
    const validationResult = await EnhancedQRService.validateStationQR(qrCode, scannerId);

    if (!validationResult.isValid) {
      // Log failed validation (optional)
      try {
        await (prisma as any).scanLog?.create({
          data: {
            scannerId,
            qrCode: qrCode.substring(0, 100), // Store partial for debugging
            success: false,
            error: validationResult.error,
            scannedAt: new Date(),
          }
        });
      } catch (error) {
        console.warn('Scan logging failed:', error);
      }

      return NextResponse.json(
        { 
          success: false, 
          error: validationResult.error,
          action: 'deny'
        },
        { status: 400 }
      );
    }

    const qrData = validationResult.data!;

    try {
      let journeyResult;

      if (qrData.type === 'entry') {
        // Start new journey
        const metroCard = await prisma.metroCard.findFirst({
          where: { 
            userId: qrData.userId,
            isActive: true 
          }
        });

        if (!metroCard) {
          throw new Error('No active metro card found');
        }

        journeyResult = await JourneyService.startJourney(
          qrData.userId,
          metroCard.id,
          qrData.stationId,
          EntryMethod.QR_SCAN,
          scannerLocation?.latitude,
          scannerLocation?.longitude
        );

      } else if (qrData.type === 'exit') {
        // End existing journey
        const activeJourney = await JourneyService.getActiveJourney(qrData.userId);
        
        if (!activeJourney) {
          throw new Error('No active journey found');
        }

        journeyResult = await JourneyService.endJourney(
          activeJourney.id,
          qrData.stationId,
          EntryMethod.QR_SCAN,
          scannerLocation?.latitude,
          scannerLocation?.longitude
        );
      }

      // Log successful scan (optional)
      try {
        await (prisma as any).scanLog?.create({
          data: {
            scannerId,
            userId: qrData.userId,
            stationId: qrData.stationId,
            journeyId: journeyResult?.id,
            qrType: qrData.type,
            success: true,
            scannedAt: new Date(),
          }
        });
      } catch (error) {
        console.warn('Scan logging failed:', error);
      }

      return NextResponse.json({
        success: true,
        action: qrData.type === 'entry' ? 'open_entry_gate' : 'open_exit_gate',
        journey: journeyResult,
        station: {
          id: qrData.stationId,
          code: qrData.stationCode
        },
        user: {
          id: qrData.userId
        },
        timestamp: Date.now()
      });

    } catch (journeyError: any) {
      // Log journey error but still record the scan attempt (optional)
      try {
        await (prisma as any).scanLog?.create({
          data: {
            scannerId,
            userId: qrData.userId,
            stationId: qrData.stationId,
            qrType: qrData.type,
            success: false,
            error: journeyError.message,
            scannedAt: new Date(),
          }
        });
      } catch (error) {
        console.warn('Scan logging failed:', error);
      }

      return NextResponse.json(
        { 
          success: false, 
          error: journeyError.message,
          action: 'deny'
        },
        { status: 400 }
      );
    }

  } catch (error: any) {
    console.error('QR validation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'QR validation failed',
        action: 'deny'
      },
      { status: 500 }
    );
  }
}
