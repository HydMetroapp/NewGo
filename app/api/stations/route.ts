
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { MetroLine } from '@/lib/types';

// Sample station data for Hyderabad Metro
const HYDERABAD_METRO_STATIONS = [
  // Red Line
  { name: 'Miyapur', code: 'MYP', line: 'RED_LINE', latitude: 17.4967, longitude: 78.3275, address: 'Miyapur, Hyderabad', facilities: ['Parking', 'ATM', 'Restrooms'] },
  { name: 'JNTU College', code: 'JNT', line: 'RED_LINE', latitude: 17.4924, longitude: 78.3473, address: 'JNTU College, Hyderabad', facilities: ['ATM', 'Restrooms'] },
  { name: 'KPHB Colony', code: 'KPH', line: 'RED_LINE', latitude: 17.4881, longitude: 78.3672, address: 'KPHB Colony, Hyderabad', facilities: ['Parking', 'Restrooms'] },
  { name: 'Kukatpally', code: 'KUK', line: 'RED_LINE', latitude: 17.4838, longitude: 78.3871, address: 'Kukatpally, Hyderabad', facilities: ['Parking', 'ATM', 'Restrooms', 'Shopping'] },
  { name: 'Balanagar', code: 'BLN', line: 'RED_LINE', latitude: 17.4795, longitude: 78.4070, address: 'Balanagar, Hyderabad', facilities: ['ATM', 'Restrooms'] },
  { name: 'Moosapet', code: 'MSP', line: 'RED_LINE', latitude: 17.4752, longitude: 78.4269, address: 'Moosapet, Hyderabad', facilities: ['Parking', 'Restrooms'] },
  { name: 'Bharatnagar', code: 'BHN', line: 'RED_LINE', latitude: 17.4709, longitude: 78.4468, address: 'Bharatnagar, Hyderabad', facilities: ['ATM', 'Restrooms'] },
  { name: 'Erragadda', code: 'ERR', line: 'RED_LINE', latitude: 17.4666, longitude: 78.4667, address: 'Erragadda, Hyderabad', facilities: ['Parking', 'ATM', 'Restrooms'] },
  { name: 'ESI Hospital', code: 'ESI', line: 'RED_LINE', latitude: 17.4623, longitude: 78.4866, address: 'ESI Hospital, Hyderabad', facilities: ['ATM', 'Restrooms'] },
  { name: 'S.R.Nagar', code: 'SRN', line: 'RED_LINE', latitude: 17.4580, longitude: 78.5065, address: 'S.R.Nagar, Hyderabad', facilities: ['Parking', 'Restrooms'] },
  { name: 'Ameerpet', code: 'AMP', line: 'RED_LINE', latitude: 17.4537, longitude: 78.5264, address: 'Ameerpet, Hyderabad', facilities: ['Parking', 'ATM', 'Restrooms', 'Shopping'] },
  { name: 'Punjagutta', code: 'PJG', line: 'RED_LINE', latitude: 17.4494, longitude: 78.5463, address: 'Punjagutta, Hyderabad', facilities: ['ATM', 'Restrooms'] },
  { name: 'Irrum Manzil', code: 'IRM', line: 'RED_LINE', latitude: 17.4451, longitude: 78.5662, address: 'Irrum Manzil, Hyderabad', facilities: ['Restrooms'] },
  { name: 'Khairatabad', code: 'KHB', line: 'RED_LINE', latitude: 17.4408, longitude: 78.5861, address: 'Khairatabad, Hyderabad', facilities: ['Parking', 'ATM', 'Restrooms'] },
  { name: 'Lakdikapul', code: 'LKP', line: 'RED_LINE', latitude: 17.4365, longitude: 78.6060, address: 'Lakdikapul, Hyderabad', facilities: ['ATM', 'Restrooms'] },
  { name: 'Assembly', code: 'ASM', line: 'RED_LINE', latitude: 17.4322, longitude: 78.6259, address: 'Assembly, Hyderabad', facilities: ['Parking', 'Restrooms'] },
  { name: 'Nampally', code: 'NMP', line: 'RED_LINE', latitude: 17.4279, longitude: 78.6458, address: 'Nampally, Hyderabad', facilities: ['Parking', 'ATM', 'Restrooms'] },
  { name: 'Gandhi Bhavan', code: 'GBH', line: 'RED_LINE', latitude: 17.4236, longitude: 78.6657, address: 'Gandhi Bhavan, Hyderabad', facilities: ['ATM', 'Restrooms'] },
  { name: 'Osmania Medical College', code: 'OMC', line: 'RED_LINE', latitude: 17.4193, longitude: 78.6856, address: 'Osmania Medical College, Hyderabad', facilities: ['Parking', 'Restrooms'] },
  { name: 'MG Bus Station', code: 'MGB', line: 'RED_LINE', latitude: 17.4150, longitude: 78.7055, address: 'MG Bus Station, Hyderabad', facilities: ['Parking', 'ATM', 'Restrooms', 'Bus Terminal'] },
  { name: 'Malakpet', code: 'MLP', line: 'RED_LINE', latitude: 17.4107, longitude: 78.7254, address: 'Malakpet, Hyderabad', facilities: ['ATM', 'Restrooms'] },
  { name: 'New Market', code: 'NMK', line: 'RED_LINE', latitude: 17.4064, longitude: 78.7453, address: 'New Market, Hyderabad', facilities: ['Parking', 'Restrooms'] },
  { name: 'Musarambagh', code: 'MSB', line: 'RED_LINE', latitude: 17.4021, longitude: 78.7652, address: 'Musarambagh, Hyderabad', facilities: ['ATM', 'Restrooms'] },
  { name: 'Dilsukhnagar', code: 'DLN', line: 'RED_LINE', latitude: 17.3978, longitude: 78.7851, address: 'Dilsukhnagar, Hyderabad', facilities: ['Parking', 'ATM', 'Restrooms', 'Shopping'] },
  { name: 'Chaitanyapuri', code: 'CHP', line: 'RED_LINE', latitude: 17.3935, longitude: 78.8050, address: 'Chaitanyapuri, Hyderabad', facilities: ['ATM', 'Restrooms'] },
  { name: 'Victoria Memorial', code: 'VCM', line: 'RED_LINE', latitude: 17.3892, longitude: 78.8249, address: 'Victoria Memorial, Hyderabad', facilities: ['Parking', 'Restrooms'] },
  { name: 'L.B.Nagar', code: 'LBN', line: 'RED_LINE', latitude: 17.3849, longitude: 78.8448, address: 'L.B.Nagar, Hyderabad', facilities: ['Parking', 'ATM', 'Restrooms', 'Bus Terminal'] },

  // Green Line
  { name: 'Nagole', code: 'NGL', line: 'GREEN_LINE', latitude: 17.3806, longitude: 78.8647, address: 'Nagole, Hyderabad', facilities: ['Parking', 'ATM', 'Restrooms'] },
  { name: 'Uppal', code: 'UPL', line: 'GREEN_LINE', latitude: 17.3863, longitude: 78.8448, address: 'Uppal, Hyderabad', facilities: ['Parking', 'ATM', 'Restrooms', 'Shopping'] },
  { name: 'Stadium', code: 'STD', line: 'GREEN_LINE', latitude: 17.3920, longitude: 78.8249, address: 'Stadium, Hyderabad', facilities: ['ATM', 'Restrooms'] },
  { name: 'NGRI', code: 'NGR', line: 'GREEN_LINE', latitude: 17.3977, longitude: 78.8050, address: 'NGRI, Hyderabad', facilities: ['Parking', 'Restrooms'] },
  { name: 'Habsiguda', code: 'HBG', line: 'GREEN_LINE', latitude: 17.4034, longitude: 78.7851, address: 'Habsiguda, Hyderabad', facilities: ['ATM', 'Restrooms'] },
  { name: 'Tarnaka', code: 'TNK', line: 'GREEN_LINE', latitude: 17.4091, longitude: 78.7652, address: 'Tarnaka, Hyderabad', facilities: ['Parking', 'ATM', 'Restrooms'] },
  { name: 'Mettuguda', code: 'MTG', line: 'GREEN_LINE', latitude: 17.4148, longitude: 78.7453, address: 'Mettuguda, Hyderabad', facilities: ['ATM', 'Restrooms'] },
  { name: 'Secunderabad East', code: 'SCE', line: 'GREEN_LINE', latitude: 17.4205, longitude: 78.7254, address: 'Secunderabad East, Hyderabad', facilities: ['Parking', 'Restrooms'] },
  { name: 'Parade Ground', code: 'PDG', line: 'GREEN_LINE', latitude: 17.4262, longitude: 78.7055, address: 'Parade Ground, Hyderabad', facilities: ['ATM', 'Restrooms'] },
  { name: 'Secunderabad West', code: 'SCW', line: 'GREEN_LINE', latitude: 17.4319, longitude: 78.6856, address: 'Secunderabad West, Hyderabad', facilities: ['Parking', 'ATM', 'Restrooms', 'Railway Station'] },
  { name: 'Gandhi Hospital', code: 'GHO', line: 'GREEN_LINE', latitude: 17.4376, longitude: 78.6657, address: 'Gandhi Hospital, Hyderabad', facilities: ['ATM', 'Restrooms'] },
  { name: 'Musheerabad', code: 'MSH', line: 'GREEN_LINE', latitude: 17.4433, longitude: 78.6458, address: 'Musheerabad, Hyderabad', facilities: ['Parking', 'Restrooms'] },
  { name: 'RTC X Roads', code: 'RTC', line: 'GREEN_LINE', latitude: 17.4490, longitude: 78.6259, address: 'RTC X Roads, Hyderabad', facilities: ['ATM', 'Restrooms', 'Bus Terminal'] },
  { name: 'Chikkadpally', code: 'CKP', line: 'GREEN_LINE', latitude: 17.4547, longitude: 78.6060, address: 'Chikkadpally, Hyderabad', facilities: ['Parking', 'ATM', 'Restrooms'] },
  { name: 'Narayanguda', code: 'NRG', line: 'GREEN_LINE', latitude: 17.4604, longitude: 78.5861, address: 'Narayanguda, Hyderabad', facilities: ['ATM', 'Restrooms'] },
  { name: 'Sultan Bazar', code: 'SLB', line: 'GREEN_LINE', latitude: 17.4661, longitude: 78.5662, address: 'Sultan Bazar, Hyderabad', facilities: ['Parking', 'Restrooms', 'Shopping'] },

  // Blue Line
  { name: 'Raidurg', code: 'RDG', line: 'BLUE_LINE', latitude: 17.4718, longitude: 78.5463, address: 'Raidurg, Hyderabad', facilities: ['Parking', 'ATM', 'Restrooms'] },
  { name: 'Hitec City', code: 'HTC', line: 'BLUE_LINE', latitude: 17.4775, longitude: 78.5264, address: 'Hitec City, Hyderabad', facilities: ['Parking', 'ATM', 'Restrooms', 'IT Hub'] },
  { name: 'Durgam Cheruvu', code: 'DGC', line: 'BLUE_LINE', latitude: 17.4832, longitude: 78.5065, address: 'Durgam Cheruvu, Hyderabad', facilities: ['ATM', 'Restrooms'] },
  { name: 'Madhapur', code: 'MDP', line: 'BLUE_LINE', latitude: 17.4889, longitude: 78.4866, address: 'Madhapur, Hyderabad', facilities: ['Parking', 'ATM', 'Restrooms', 'IT Hub'] },
  { name: 'Peddamma Gudi', code: 'PDG', line: 'BLUE_LINE', latitude: 17.4946, longitude: 78.4667, address: 'Peddamma Gudi, Hyderabad', facilities: ['ATM', 'Restrooms'] },
  { name: 'Jubilee Hills Checkpost', code: 'JHC', line: 'BLUE_LINE', latitude: 17.5003, longitude: 78.4468, address: 'Jubilee Hills Checkpost, Hyderabad', facilities: ['Parking', 'Restrooms'] },
  { name: 'Jubilee Hills', code: 'JBH', line: 'BLUE_LINE', latitude: 17.5060, longitude: 78.4269, address: 'Jubilee Hills, Hyderabad', facilities: ['Parking', 'ATM', 'Restrooms', 'Shopping'] },
  { name: 'Yusufguda', code: 'YSG', line: 'BLUE_LINE', latitude: 17.5117, longitude: 78.4070, address: 'Yusufguda, Hyderabad', facilities: ['ATM', 'Restrooms'] },
  { name: 'Madhura Nagar', code: 'MDN', line: 'BLUE_LINE', latitude: 17.5174, longitude: 78.3871, address: 'Madhura Nagar, Hyderabad', facilities: ['Parking', 'Restrooms'] },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const line = searchParams.get('line');
    const search = searchParams.get('search');

    let stations = await prisma.station.findMany({
      where: {
        isActive: true,
        ...(line && { line: line as MetroLine }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { code: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
      orderBy: [
        { line: 'asc' },
        { name: 'asc' },
      ],
    });

    // If no stations in database, seed with sample data
    if (stations.length === 0) {
      console.log('Seeding stations...');
      await seedStations();
      stations = await prisma.station.findMany({
        where: { isActive: true },
        orderBy: [
          { line: 'asc' },
          { name: 'asc' },
        ],
      });
    }

    return NextResponse.json({ stations }, { status: 200 });
  } catch (error: any) {
    console.error('Stations API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch stations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const stationData = await request.json();

    const station = await prisma.station.create({
      data: {
        ...stationData,
        isActive: true,
      },
    });

    return NextResponse.json({ station }, { status: 201 });
  } catch (error: any) {
    console.error('Create station error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create station' },
      { status: 500 }
    );
  }
}

async function seedStations() {
  try {
    for (const stationData of HYDERABAD_METRO_STATIONS) {
      await prisma.station.upsert({
        where: { code: stationData.code },
        update: {
          ...stationData,
          line: stationData.line as MetroLine,
        },
        create: {
          ...stationData,
          line: stationData.line as MetroLine,
          isActive: true,
        },
      });
    }
    console.log('Stations seeded successfully');
  } catch (error) {
    console.error('Error seeding stations:', error);
  }
}
