
import { Journey, Station, MetroCard, JourneyStatus, EntryMethod } from '../types';
import { calculateFare, calculateDistance, calculateDuration } from '../utils';
import { prisma } from '../db';
import { NotificationService } from './notification-service';

export class JourneyService {
  static async startJourney(
    userId: string,
    metroCardId: string,
    fromStationId: string,
    entryMethod: EntryMethod,
    entryLatitude?: number,
    entryLongitude?: number
  ): Promise<Journey> {
    try {
      // Check if user has an active journey
      const activeJourney = await this.getActiveJourney(userId);
      if (activeJourney) {
        throw new Error('You already have an active journey. Please complete it first.');
      }

      // Get metro card and check balance
      const metroCard = await prisma.metroCard.findUnique({
        where: { id: metroCardId },
      });

      if (!metroCard || !metroCard.isActive) {
        throw new Error('Invalid or inactive metro card');
      }

      if (metroCard.balance < 10) { // Minimum balance check
        throw new Error('Insufficient balance. Please recharge your metro card.');
      }

      // Get station details
      const fromStation = await prisma.station.findUnique({
        where: { id: fromStationId },
      });

      if (!fromStation || !fromStation.isActive) {
        throw new Error('Invalid or inactive station');
      }

      // Create journey
      const journey = await prisma.journey.create({
        data: {
          userId,
          metroCardId,
          fromStationId,
          entryTime: new Date(),
          entryMethod,
          entryLatitude,
          entryLongitude,
          status: JourneyStatus.IN_PROGRESS,
        },
        include: {
          fromStation: true,
          toStation: true,
        },
      });

      // Send notification
      await NotificationService.notifyJourneyStart(userId, fromStation.name);

      return journey as any;
    } catch (error: any) {
      console.error('Start journey error:', error);
      throw new Error(error.message || 'Failed to start journey');
    }
  }

  static async endJourney(
    journeyId: string,
    toStationId: string,
    exitMethod: EntryMethod,
    exitLatitude?: number,
    exitLongitude?: number
  ): Promise<Journey> {
    try {
      // Get journey details
      const journey = await prisma.journey.findUnique({
        where: { id: journeyId },
        include: {
          fromStation: true,
          metroCard: true,
        },
      });

      if (!journey) {
        throw new Error('Journey not found');
      }

      if (journey.status !== JourneyStatus.IN_PROGRESS) {
        throw new Error('Journey is not active');
      }

      // Get destination station
      const toStation = await prisma.station.findUnique({
        where: { id: toStationId },
      });

      if (!toStation || !toStation.isActive) {
        throw new Error('Invalid or inactive destination station');
      }

      // Calculate fare, distance, and duration
      const fare = calculateFare(journey.fromStation, toStation, journey.metroCard.cardType);
      const distance = calculateDistance(
        journey.fromStation.latitude,
        journey.fromStation.longitude,
        toStation.latitude,
        toStation.longitude
      );
      const exitTime = new Date();
      const duration = calculateDuration(journey.entryTime, exitTime);

      // Check if card has sufficient balance
      if (journey.metroCard.balance < fare) {
        throw new Error('Insufficient balance to complete journey');
      }

      // Update journey
      const updatedJourney = await prisma.journey.update({
        where: { id: journeyId },
        data: {
          toStationId,
          exitTime,
          exitMethod,
          exitLatitude,
          exitLongitude,
          fare,
          distance,
          duration,
          status: JourneyStatus.COMPLETED,
        },
        include: {
          fromStation: true,
          toStation: true,
        },
      });

      // Deduct fare from metro card
      await prisma.metroCard.update({
        where: { id: journey.metroCardId },
        data: {
          balance: {
            decrement: fare,
          },
        },
      });

      // Create transaction record
      await prisma.transaction.create({
        data: {
          userId: journey.userId,
          type: 'JOURNEY_PAYMENT',
          amount: -fare,
          status: 'SUCCESS',
          metroCardId: journey.metroCardId,
          description: `Journey from ${journey.fromStation.name} to ${toStation.name}`,
        },
      });

      // Send notification
      await NotificationService.notifyJourneyEnd(journey.userId, toStation.name, fare);

      // Check for low balance
      const updatedCard = await prisma.metroCard.findUnique({
        where: { id: journey.metroCardId },
      });

      if (updatedCard && updatedCard.balance < 50) {
        await NotificationService.notifyLowBalance(journey.userId, updatedCard.balance);
      }

      return updatedJourney as any;
    } catch (error: any) {
      console.error('End journey error:', error);
      throw new Error(error.message || 'Failed to end journey');
    }
  }

  static async getActiveJourney(userId: string): Promise<Journey | null> {
    try {
      const journey = await prisma.journey.findFirst({
        where: {
          userId,
          status: JourneyStatus.IN_PROGRESS,
        },
        include: {
          fromStation: true,
          toStation: true,
          metroCard: true,
        },
      });

      return journey as any;
    } catch (error: any) {
      console.error('Get active journey error:', error);
      return null;
    }
  }

  static async getJourneyHistory(userId: string, limit: number = 20): Promise<Journey[]> {
    try {
      const journeys = await prisma.journey.findMany({
        where: { userId },
        include: {
          fromStation: true,
          toStation: true,
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });

      return journeys as any;
    } catch (error: any) {
      console.error('Get journey history error:', error);
      throw new Error('Failed to get journey history');
    }
  }

  static async cancelJourney(journeyId: string): Promise<Journey> {
    try {
      const journey = await prisma.journey.findUnique({
        where: { id: journeyId },
      });

      if (!journey) {
        throw new Error('Journey not found');
      }

      if (journey.status !== JourneyStatus.IN_PROGRESS) {
        throw new Error('Journey cannot be cancelled');
      }

      const updatedJourney = await prisma.journey.update({
        where: { id: journeyId },
        data: {
          status: JourneyStatus.CANCELLED,
        },
        include: {
          fromStation: true,
          toStation: true,
        },
      });

      return updatedJourney as any;
    } catch (error: any) {
      console.error('Cancel journey error:', error);
      throw new Error(error.message || 'Failed to cancel journey');
    }
  }

  static async getJourneyById(journeyId: string): Promise<Journey | null> {
    try {
      const journey = await prisma.journey.findUnique({
        where: { id: journeyId },
        include: {
          fromStation: true,
          toStation: true,
          metroCard: true,
        },
      });

      return journey as any;
    } catch (error: any) {
      console.error('Get journey by ID error:', error);
      return null;
    }
  }

  static async getJourneyStats(userId: string): Promise<{
    totalJourneys: number;
    totalDistance: number;
    totalFare: number;
    averageFare: number;
    favoriteStation: string | null;
  }> {
    try {
      const journeys = await prisma.journey.findMany({
        where: {
          userId,
          status: JourneyStatus.COMPLETED,
        },
        include: {
          fromStation: true,
          toStation: true,
        },
      });

      const totalJourneys = journeys.length;
      const totalDistance = journeys.reduce((sum, journey) => sum + (journey.distance || 0), 0);
      const totalFare = journeys.reduce((sum, journey) => sum + (journey.fare || 0), 0);
      const averageFare = totalJourneys > 0 ? totalFare / totalJourneys : 0;

      // Find most frequently used station
      const stationCounts: { [key: string]: number } = {};
      journeys.forEach(journey => {
        stationCounts[journey.fromStation.name] = (stationCounts[journey.fromStation.name] || 0) + 1;
        if (journey.toStation) {
          stationCounts[journey.toStation.name] = (stationCounts[journey.toStation.name] || 0) + 1;
        }
      });

      const favoriteStation = Object.keys(stationCounts).reduce((a, b) => 
        stationCounts[a] > stationCounts[b] ? a : b, null
      );

      return {
        totalJourneys,
        totalDistance: Math.round(totalDistance * 100) / 100,
        totalFare: Math.round(totalFare * 100) / 100,
        averageFare: Math.round(averageFare * 100) / 100,
        favoriteStation,
      };
    } catch (error: any) {
      console.error('Get journey stats error:', error);
      throw new Error('Failed to get journey statistics');
    }
  }
}
