import { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const CalendarView = ({ appointments }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDayAppointments, setSelectedDayAppointments] = useState([]);

  // Grouper les rendez-vous par date
  const appointmentsByDate = appointments.reduce((acc, appt) => {
    const date = new Date(appt.startTime).toDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(appt);
    return acc;
  }, {});

  const handleDateClick = (date) => {
    const dateStr = date.toDateString();
    setSelectedDate(date);
    setSelectedDayAppointments(appointmentsByDate[dateStr] || []);
  };

  // Fonction pour marquer les jours avec rendez-vous
  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const dateStr = date.toDateString();
      if (appointmentsByDate[dateStr]) {
        return <div className="dot"></div>;
      }
    }
    return null;
  };

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <div className="flex-1">
        <Calendar
          onClickDay={handleDateClick}
          tileContent={tileContent}
          value={selectedDate}
        />
        <style>{`
          .react-calendar .dot {
            height: 8px;
            width: 8px;
            background-color: #000;
            border-radius: 50%;
            margin: 0 auto;
            margin-top: 2px;
          }
        `}</style>
      </div>
      <div className="flex-1">
        <h3 className="text-lg font-bold mb-4">
          Rendez-vous du {selectedDate.toLocaleDateString('fr-FR')}
        </h3>
        {selectedDayAppointments.length === 0 ? (
          <p>Aucun rendez-vous ce jour-là.</p>
        ) : (
          <div className="space-y-2">
            {selectedDayAppointments.map((appt) => (
              <div key={appt.id} className="border p-3 rounded">
                <p className="font-bold">{appt.service.name}</p>
                <p>{appt.salon.name}</p>
                <p className="text-sm text-gray-600">
                  {new Date(appt.startTime).toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarView;