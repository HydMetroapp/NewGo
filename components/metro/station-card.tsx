
'use client';

import { MapPin, Navigation, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Station } from '@/lib/types';
import { getLineColor, getLineName, calculateDistance } from '@/lib/utils';
import { useLocation } from '@/hooks/use-location';

interface StationCardProps {
  station: Station;
  onSelect?: (station: Station) => void;
  onNavigate?: (station: Station) => void;
  showDistance?: boolean;
  className?: string;
}

export function StationCard({ 
  station, 
  onSelect, 
  onNavigate, 
  showDistance = true,
  className 
}: StationCardProps) {
  const { location } = useLocation();

  const distance = location && showDistance 
    ? calculateDistance(
        location.latitude,
        location.longitude,
        station.latitude,
        station.longitude
      )
    : null;

  return (
    <Card className={`cursor-pointer transition-all hover:shadow-md ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="h-4 w-4 rounded-full"
              style={{ backgroundColor: getLineColor(station.line) }}
            />
            <div>
              <CardTitle className="text-base">{station.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{station.code}</p>
            </div>
          </div>
          <Badge variant="outline" style={{ borderColor: getLineColor(station.line) }}>
            {getLineName(station.line)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Address */}
        <div className="flex items-start gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
          <p className="text-sm text-muted-foreground">{station.address}</p>
        </div>

        {/* Distance */}
        {distance !== null && (
          <div className="flex items-center gap-2">
            <Navigation className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm">
              <span className="font-medium">{distance.toFixed(1)} km</span>
              <span className="text-muted-foreground"> away</span>
            </p>
          </div>
        )}

        {/* Facilities */}
        {station.facilities && station.facilities.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Facilities</p>
            <div className="flex flex-wrap gap-1">
              {station.facilities.slice(0, 3).map((facility, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {facility}
                </Badge>
              ))}
              {station.facilities.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{station.facilities.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {onSelect && (
            <Button 
              onClick={() => onSelect(station)}
              size="sm"
              className="flex-1"
            >
              Select
            </Button>
          )}
          {onNavigate && (
            <Button 
              onClick={() => onNavigate(station)}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Navigation className="h-4 w-4" />
              Navigate
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
