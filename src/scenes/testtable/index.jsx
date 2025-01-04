import React from 'react';
import './ScrollableTable.css';

const Calendar = () => {
  const staff = ['Jakob', 'Sofie', 'Anders', 'Poul'];
  const events = [
    { time: '13:00 - 13:45', name: 'Ansigtsbehandling + Gua Sha', staff: 'Jakob', color: 'orange' },
    { time: '13:00 - 13:45', name: 'Ansigtsbehandling + Gua Sha', staff: 'Sofie', color: 'green' },
    { time: '13:00 - 13:45', name: 'Ansigtsbehandling + Gua Sha', staff: 'Anders', color: 'brown' },
    { time: '13:00 - 13:45', name: 'Ansigtsbehandling + Gua Sha', staff: 'Poul', color: 'red' },
  ];

  return (
    <div className="calendar-container">
      {/* Calendar Header (Staff names) */}
      <div className="calendar-header">
        <div className="time-slot-header"></div> {/* Empty for time slots */}
        {staff.map((person, index) => (
          <div key={index} className="header-item">{person}</div>
        ))}
      </div>

      {/* Time Slots */}
      <div className="calendar-row">
        <div className="time-slot">13:00</div>
        {events.map((event, index) => (
          <div key={index} className={`event event-${event.color}`}>
            <span>{event.time}</span><br />
            <span>{event.name}</span>
          </div>
        ))}
      </div>

      {/* Add more rows here for other times */}
    </div>
  );
};

export default Calendar;
