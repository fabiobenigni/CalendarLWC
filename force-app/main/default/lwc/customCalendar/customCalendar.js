import { LightningElement } from 'lwc';

export default class CustomCalendar extends LightningElement {
    currentDate = new Date();
    weekDays = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
    calendarDays = [];

    // Eventi mock per lo Step 1
    mockEvents = [
        {
            id: '1',
            title: 'Meeting con Cliente',
            date: new Date(),
            startTime: '10:00',
            endTime: '11:00',
            color: '#1589EE'
        },
        {
            id: '2',
            title: 'Demo Prodotto',
            date: new Date(Date.now() + 86400000), // +1 giorno
            startTime: '14:00',
            endTime: '15:30',
            color: '#06A59A'
        },
        {
            id: '3',
            title: 'Formazione Team',
            date: new Date(Date.now() + 172800000), // +2 giorni
            startTime: '09:00',
            endTime: '12:00',
            color: '#E3652A'
        }
    ];

    connectedCallback() {
        this.generateCalendar();
        console.log('Calendario custom inizializzato');
    }

    get currentMonthYear() {
        const months = [
            'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
            'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
        ];
        return `${months[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
    }

    generateCalendar() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        // Primo giorno del mese
        const firstDay = new Date(year, month, 1);
        // Ultimo giorno del mese
        const lastDay = new Date(year, month + 1, 0);
        
        // Giorno della settimana del primo giorno (0=Domenica, 1=Lunedì, etc)
        let startDayOfWeek = firstDay.getDay();
        // Converti da formato US (0=Domenica) a formato EU (0=Lunedì)
        startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;
        
        const daysInMonth = lastDay.getDate();
        const today = new Date();
        
        const days = [];
        
        // Aggiungi giorni vuoti all'inizio
        for (let i = 0; i < startDayOfWeek; i++) {
            days.push({
                key: `empty-${i}`,
                day: '',
                className: 'calendar-day empty-day',
                hasEvents: false,
                events: []
            });
        }
        
        // Aggiungi i giorni del mese
        for (let day = 1; day <= daysInMonth; day++) {
            const currentDay = new Date(year, month, day);
            const isToday = 
                currentDay.getDate() === today.getDate() &&
                currentDay.getMonth() === today.getMonth() &&
                currentDay.getFullYear() === today.getFullYear();
            
            // Trova eventi per questo giorno
            const dayEvents = this.mockEvents.filter(event => {
                return event.date.getDate() === day &&
                       event.date.getMonth() === month &&
                       event.date.getFullYear() === year;
            }).map(event => ({
                ...event,
                style: `background-color: ${event.color}; border-left: 4px solid ${event.color};`
            }));
            
            days.push({
                key: `day-${day}`,
                day: day,
                className: `calendar-day ${isToday ? 'today' : ''}`,
                hasEvents: dayEvents.length > 0,
                events: dayEvents
            });
        }
        
        this.calendarDays = days;
        console.log(`Calendario generato per ${this.currentMonthYear}:`, this.calendarDays.length, 'celle');
    }

    previousMonth() {
        this.currentDate = new Date(
            this.currentDate.getFullYear(),
            this.currentDate.getMonth() - 1,
            1
        );
        this.generateCalendar();
    }

    nextMonth() {
        this.currentDate = new Date(
            this.currentDate.getFullYear(),
            this.currentDate.getMonth() + 1,
            1
        );
        this.generateCalendar();
    }

    handleEventClick(event) {
        const eventId = event.currentTarget.dataset.id;
        const eventData = this.mockEvents.find(e => e.id === eventId);
        if (eventData) {
            // Placeholder per Step futuri - popup dettaglio
            alert(`Evento: ${eventData.title}\nOrario: ${eventData.startTime} - ${eventData.endTime}`);
        }
    }
}