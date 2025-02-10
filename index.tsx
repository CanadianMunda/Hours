import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const ShiftCalculator = () => {
  const [hoursMinutesInput, setHoursMinutesInput] = useState('');
  const [timeRangeInput, setTimeRangeInput] = useState('');
  const [deductBreak, setDeductBreak] = useState(false);
  const [totalHours, setTotalHours] = useState(0);

  // Normalize time string to a standard format
  const normalizeTimeString = (timeStr) => {
    timeStr = timeStr.toLowerCase().trim();
    
    // Handle various formats
    let hour, minute, period;
    
    // Match patterns like: 11am, 11:00am, 11:00 am, 11 am, 2pm, etc.
    const timePattern = /^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/;
    const match = timeStr.match(timePattern);
    
    if (match) {
      hour = parseInt(match[1]);
      minute = match[2] ? parseInt(match[2]) : 0;
      period = match[3];

      // If no am/pm is specified, assume:
      // - If hour is 12, treat as PM
      // - If hour < 7, treat as PM
      // - Otherwise treat as AM
      if (!period) {
        if (hour === 12 || (hour < 7 && hour !== 0)) {
          period = 'pm';
        } else {
          period = 'am';
        }
      }

      // Convert to 24-hour format
      if (period === 'pm' && hour !== 12) hour += 12;
      if (period === 'am' && hour === 12) hour = 0;

      // Format time string
      return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    }
    
    return timeStr; // Return original if no match
  };

  const parseHoursMinutes = (input) => {
    const shifts = input.trim().split(/\s+/);
    let total = 0;

    shifts.forEach(shift => {
      const match = shift.match(/(\d+)H\s*(\d+)M/i);
      if (match) {
        const hours = parseInt(match[1]);
        const minutes = parseInt(match[2]);
        total += hours + (minutes / 60);
      }
    });

    if (deductBreak) {
      total -= (shifts.length * 0.5);
    }

    return Math.max(0, total);
  };

  const parseTimeRange = (input) => {
    if (!input.trim()) return 0;
    
    const ranges = input.split(',').map(range => range.trim());
    let total = 0;

    ranges.forEach(range => {
      // Split on 'to', '-', or multiple spaces
      const times = range.split(/(?:\s+to\s+|\s+-\s+|\s{2,})/);
      
      if (times.length >= 2) {
        const startStr = normalizeTimeString(times[0]);
        const endStr = normalizeTimeString(times[1]);

        if (startStr && endStr) {
          const startDate = new Date(`2000/01/01 ${startStr}`);
          const endDate = new Date(`2000/01/01 ${endStr}`);
          
          let diff = (endDate - startDate) / (1000 * 60 * 60);
          if (diff < 0) diff += 24; // Handle overnight shifts
          
          total += diff;
        }
      }
    });

    if (deductBreak) {
      total -= (ranges.length * 0.5);
    }

    return Math.max(0, total);
  };

  const handleHoursMinutesCalculate = () => {
    const total = parseHoursMinutes(hoursMinutesInput);
    setTotalHours(total);
  };

  const handleTimeRangeCalculate = () => {
    const total = parseTimeRange(timeRangeInput);
    setTotalHours(total);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Work Hours Calculator</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex items-center space-x-2">
            <Switch
              checked={deductBreak}
              onCheckedChange={setDeductBreak}
              id="break-switch"
            />
            <Label htmlFor="break-switch">Deduct 30-minute break per shift</Label>
          </div>

          <Tabs defaultValue="format1" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="format1">Hours & Minutes Format</TabsTrigger>
              <TabsTrigger value="format2">Time Range Format</TabsTrigger>
            </TabsList>

            <TabsContent value="format1" className="space-y-4">
              <div className="space-y-2">
                <Label>Enter shifts (e.g., "5H 48M 5H 48M 5H 48M")</Label>
                <Textarea
                  value={hoursMinutesInput}
                  onChange={(e) => setHoursMinutesInput(e.target.value)}
                  placeholder="5H 48M 5H 48M 5H 48M"
                  className="min-h-[100px]"
                />
                <button
                  onClick={handleHoursMinutesCalculate}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Calculate Hours
                </button>
              </div>
            </TabsContent>

            <TabsContent value="format2" className="space-y-4">
              <div className="space-y-2">
                <Label>Enter time ranges (e.g., "11am to 5pm, 6pm to 11pm")</Label>
                <Textarea
                  value={timeRangeInput}
                  onChange={(e) => setTimeRangeInput(e.target.value)}
                  placeholder="11am to 5pm, 6pm to 11pm"
                  className="min-h-[100px]"
                />
                <div className="text-sm text-gray-500 mt-1">
                  Supports flexible formats like: "11am", "11:00am", "11:00 am", "11 am", "2pm to 5pm"
                </div>
                <button
                  onClick={handleTimeRangeCalculate}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Calculate Hours
                </button>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-4 p-4 bg-gray-100 rounded">
            <h3 className="text-lg font-semibold">Total Hours: {totalHours.toFixed(2)}</h3>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ShiftCalculator;
