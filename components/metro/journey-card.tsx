
'use client';

import { Clock, MapPin, CreditCard, Route } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Journey, JourneyStatus } from '@/lib/types';
import { formatCurrency, formatDateTime, formatDuration, getLineColor, getLineName } from '@/lib/utils';

interface JourneyCardProps {
  journey: Journey;
  className?: string;
}

export function JourneyCard({ journey, className }: JourneyCardProps) {
  const getStatusColor = (status: JourneyStatus) => {
    switch (status) {
      case JourneyStatus.COMPLETED:
        return 'bg-green-100 text-green-800';
      case JourneyStatus.IN_PROGRESS:
        return 'bg-blue-100 text-blue-800';
      case JourneyStatus.CANCELLED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: JourneyStatus) => {
    switch (status) {
      case JourneyStatus.COMPLETED:
        return 'Completed';
      case JourneyStatus.IN_PROGRESS:
        return 'In Progress';
      case JourneyStatus.CANCELLED:
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Route className="h-4 w-4" />
            Journey Details
          </CardTitle>
          <Badge className={getStatusColor(journey.status)}>
            {getStatusText(journey.status)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Route Information */}
        <div className="space-y-3">
          {/* From Station */}
          <div className="flex items-center gap-3">
            <div 
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: getLineColor(journey.fromStation.line) }}
            />
            <div className="flex-1">
              <p className="font-medium">{journey.fromStation.name}</p>
              <p className="text-xs text-muted-foreground">
                {getLineName(journey.fromStation.line)} • {formatDateTime(journey.entryTime)}
              </p>
            </div>
          </div>

          {/* Connection Line */}
          {journey.toStation && (
            <div className="ml-1.5 h-6 w-0.5 bg-gray-300" />
          )}

          {/* To Station */}
          {journey.toStation ? (
            <div className="flex items-center gap-3">
              <div 
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: getLineColor(journey.toStation.line) }}
              />
              <div className="flex-1">
                <p className="font-medium">{journey.toStation.name}</p>
                <p className="text-xs text-muted-foreground">
                  {getLineName(journey.toStation.line)} • {journey.exitTime && formatDateTime(journey.exitTime)}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 opacity-50">
              <div className="h-3 w-3 rounded-full border-2 border-dashed border-gray-300" />
              <div className="flex-1">
                <p className="font-medium text-muted-foreground">Destination pending</p>
                <p className="text-xs text-muted-foreground">Journey in progress</p>
              </div>
            </div>
          )}
        </div>

        {/* Journey Stats */}
        <div className="grid grid-cols-2 gap-4 pt-3 border-t">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Duration</p>
              <p className="text-sm font-medium">
                {journey.duration ? formatDuration(journey.duration) : 'In progress'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Fare</p>
              <p className="text-sm font-medium">
                {journey.fare ? formatCurrency(journey.fare) : 'Pending'}
              </p>
            </div>
          </div>
        </div>

        {/* Distance */}
        {journey.distance && (
          <div className="flex items-center gap-2 pt-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Distance</p>
              <p className="text-sm font-medium">{journey.distance.toFixed(1)} km</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
