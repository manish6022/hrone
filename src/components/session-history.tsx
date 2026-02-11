import { Video } from 'lucide-react';

interface SessionItem {
  id: string;
  name: string;
  date: string;
  imageUrl: string;
  location: string;
  country: string;
  flag: string;
}

interface SessionHistoryProps {
  currentPage?: number;
  totalPages?: number;
}

export function SessionHistory({ currentPage = 2, totalPages = 8 }: SessionHistoryProps) {
  const sessions: SessionItem[] = [
    {
      id: '1',
      name: 'Harry Bender',
      date: 'Sep 20, 17:00',
      imageUrl: 'https://images.unsplash.com/photo-1629507208649-70919ca33793?w=100',
      location: 'Paris, France',
      country: 'FR',
      flag: '🇫🇷'
    },
    {
      id: '2',
      name: 'Jonathan Kelly',
      date: 'Sep 20, 12:30',
      imageUrl: 'https://images.unsplash.com/photo-1623594675959-02360202d4d6?w=100',
      location: 'Victoria, Canada',
      country: 'CA',
      flag: '🇨🇦'
    },
    {
      id: '3',
      name: 'Billie Wright',
      date: 'Sep 20, 11:00',
      imageUrl: 'https://images.unsplash.com/photo-1758599543120-4e462429a4d7?w=100',
      location: 'Paris, France',
      country: 'FR',
      flag: '🇫🇷'
    },
    {
      id: '4',
      name: 'Sarah Page',
      date: 'Sep 19, 16:05',
      imageUrl: 'https://images.unsplash.com/photo-1681752987706-e7345626a5da?w=100',
      location: 'Perth, Australia',
      country: 'AU',
      flag: '🇦🇺'
    },
    {
      id: '5',
      name: 'Erica Wyatt',
      date: 'Sep 19, 14:30',
      imageUrl: 'https://images.unsplash.com/photo-1623594675959-02360202d4d6?w=100',
      location: 'Leon, France',
      country: 'FR',
      flag: '🇫🇷'
    }
  ];

  return (
    <div className="bg-[#2D2D2D] rounded-3xl p-8 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl text-white font-semibold">Session History</h3>
        <div className="text-white text-2xl font-bold">
          {currentPage}/{totalPages}
        </div>
      </div>

      {/* Sessions List */}
      <div className="space-y-4 flex-1">
        {sessions.map((session) => (
          <div
            key={session.id}
            className="flex items-center justify-between p-4 bg-[#3A3A3A] rounded-2xl hover:bg-[#424242] transition"
          >
            <div className="flex items-center gap-4">
              {/* Video Icon */}
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Video className="w-5 h-5 text-white/70" />
              </div>

              {/* Profile Image */}
              <img
                src={session.imageUrl}
                alt={session.name}
                className="w-12 h-12 rounded-full object-cover"
              />

              {/* Name and Date */}
              <div>
                <div className="text-white font-semibold">{session.name}</div>
                <div className="text-white/60 text-sm">{session.date}</div>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center gap-2">
              <span className="text-2xl">{session.flag}</span>
              <span className="text-white/80 text-sm">{session.location}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
