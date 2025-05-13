
import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface SchedulePickerProps {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
}

export function SchedulePicker({ value, onChange }: SchedulePickerProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(value);
  const [selectedHour, setSelectedHour] = React.useState<string>(value ? format(value, "HH") : "12");
  const [selectedMinute, setSelectedMinute] = React.useState<string>(value ? format(value, "mm") : "00");

  // Update the main value when any component changes
  React.useEffect(() => {
    if (selectedDate) {
      const updatedDate = new Date(selectedDate);
      updatedDate.setHours(parseInt(selectedHour, 10));
      updatedDate.setMinutes(parseInt(selectedMinute, 10));
      updatedDate.setSeconds(0);
      onChange(updatedDate);
    } else {
      onChange(undefined);
    }
  }, [selectedDate, selectedHour, selectedMinute, onChange]);

  // Generate hours and minutes options
  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"));
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0"));

  return (
    <div className="space-y-3">
      <div className="flex flex-col space-y-2">
        <Label htmlFor="schedule-date">Schedule Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="schedule-date"
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !selectedDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              initialFocus
              // Removed the disabled property to allow today's date selection
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex flex-col space-y-2">
        <Label>Schedule Time</Label>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          
          <Select
            value={selectedHour}
            onValueChange={setSelectedHour}
            disabled={!selectedDate}
          >
            <SelectTrigger className="w-[80px]">
              <SelectValue placeholder="Hour" />
            </SelectTrigger>
            <SelectContent position="popper">
              {hours.map((hour) => (
                <SelectItem key={hour} value={hour}>
                  {hour}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <span className="text-muted-foreground mx-1">:</span>
          
          <Select
            value={selectedMinute}
            onValueChange={setSelectedMinute}
            disabled={!selectedDate}
          >
            <SelectTrigger className="w-[80px]">
              <SelectValue placeholder="Minute" />
            </SelectTrigger>
            <SelectContent position="popper">
              {minutes.map((minute) => (
                <SelectItem key={minute} value={minute}>
                  {minute}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
