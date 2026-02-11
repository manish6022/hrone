import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  time: string;
  attendees: string[];
  color: 'dark' | 'yellow';
}

interface CalendarViewProps {
  events?: CalendarEvent[];
}

export function CalendarView({ events = [] }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const currentMonth = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const prevMonthName = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1).toLocaleString('default', { month: 'long' });
  const nextMonthName = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1).toLocaleString('default', { month: 'long' });

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Calculate start of week (Monday)
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + 1);
  const dates = Array.from({ length: 6 }, (_, i) => startOfWeek.getDate() + i);

  const timeSlots = ['8:00 am', '9:00 am', '10:00 am', '11:00 am', '12:00 pm', '1:00 pm'];

  const defaultEvents: CalendarEvent[] = [
    {
      id: '1',
      title: 'Weekly Team Sync',
      description: 'Discuss progress on projects',
      time: '9:00 am',
      attendees: ['https://images.unsplash.com/photo-1629507208649-70919ca33793?w=100', 'https://images.unsplash.com/photo-1623594675959-02360202d4d6?w=100', 'https://images.unsplash.com/photo-1758599543120-4e462429a4d7?w=100'],
      color: 'dark'
    },
    {
      id: '2',
      title: 'Onboarding Session',
      description: 'Introduction for new hires',
      time: '10:00 am',
      attendees: ['https://images.unsplash.com/photo-1629507208649-70919ca33793?w=100', 'https://images.unsplash.com/photo-1623594675959-02360202d4d6?w=100'],
      color: 'dark'
    },
    {
      id: '3',
      title: 'Daily Meeting',
      description: '12:00pm-01:00pm',
      time: '12:00 pm',
      attendees: ['https://images.unsplash.com/photo-1629507208649-70919ca33793?w=100', 'https://images.unsplash.com/photo-1623594675959-02360202d4d6?w=100', 'https://images.unsplash.com/photo-1758599543120-4e462429a4d7?w=100', 'https://images.unsplash.com/photo-1681752987706-e7345626a5da?w=100'],
      color: 'yellow'
    }
  ];

  const displayEvents = events.length > 0 ? events : defaultEvents;

  return (
    <div className="bg-gradient-to-br from-[#FFFEF9] to-[#FFF9E8] rounded-3xl p-8 h-full">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={prevMonth} className="text-[#6B6B6B] hover:text-[#2D2D2D] transition">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-4">
          <span className="text-[#6B6B6B]">{prevMonthName}</span>
          <span className="font-semibold text-xl">{currentMonth}</span>
          <span className="text-[#6B6B6B]">{nextMonthName}</span>
        </div>
        <button onClick={nextMonth} className="text-[#6B6B6B] hover:text-[#2D2D2D] transition">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Week Days */}
      <div className="grid grid-cols-6 gap-4 mb-4">
        {weekDays.map((day, index) => (
          <div key={day} className="text-center">
            <div className="text-sm text-[#6B6B6B] mb-2">{day}</div>
            <div className={`text-lg ${index === 2 ? 'font-bold' : ''}`}>{dates[index]}</div>
          </div>
        ))}
      </div>

      {/* Time Slots and Events */}
      <div className="space-y-3">
        {timeSlots.map((time) => {
          const event = displayEvents.find(e => e.time === time);
          return (
            <div key={time} className="flex items-center gap-4">
              <div className="text-sm text-[#6B6B6B] w-20 flex-shrink-0">{time}</div>
              <div className="flex-1 relative">
                {event ? (
                  <div
                    className={`${
                      event.color === 'dark' ? 'bg-[#2D2D2D]' : 'bg-[#FDE68A]'
                    } rounded-2xl p-4 flex items-center justify-between`}
                  >
                    <div>
                      <div className={`font-semibold ${event.color === 'dark' ? 'text-white' : 'text-[#2D2D2D]'}`}>
                        {event.title}
                      </div>
                      <div className={`text-sm ${event.color === 'dark' ? 'text-white/70' : 'text-[#6B6B6B]'}`}>
                        {event.description}
                      </div>
                    </div>
                    <div className="flex -space-x-2">
                      {event.attendees.map((attendee, idx) => (
                        <img
                          key={idx}
                          src={attendee}
                          alt={`Attendee ${idx + 1}`}
                          className="w-8 h-8 rounded-full border-2 border-white object-cover"
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="h-2 border-b border-dashed border-[#E8E2D5]"></div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
