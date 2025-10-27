import { LightningElement, wire } from 'lwc';
import getEvents from '@salesforce/apex/CalendarController.getEvents';

export default class CustomCalendar extends LightningElement {
    currentDate = new Date();
    weekDays = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
    calendarDays = [];
    events = [];
    isLoading = false;
    error;

    connectedCallback() {
        this.loadEvents();
        console.log('Calendario custom inizializzato');
    }

    /**
     * Carica gli eventi dal server per il mese corrente
     */
    loadEvents() {
        this.isLoading = true;
        this.error = undefined;
        
        // Calcola primo e ultimo giorno del mese
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0, 23, 59, 59);
        
        console.log('Caricamento eventi da', startDate, 'a', endDate);
        
        // Chiama Apex
        getEvents({ 
            startDate: startDate.toISOString().split('T')[0], 
            endDate: endDate.toISOString().split('T')[0] 
        })
        .then(data => {
            console.log('Eventi ricevuti:', data);
            // Trasforma eventi per il calendario
            this.events = data.map(event => ({
                id: event.id,
                title: event.title,
                date: new Date(event.startDateTime),
                startTime: this.formatTime(new Date(event.startDateTime)),
                endTime: this.formatTime(new Date(event.endDateTime)),
                color: event.color,
                description: event.description,
                location: event.location,
                ownerName: event.ownerName,
                eventType: event.eventType
            }));
            
            this.isLoading = false;
            this.generateCalendar();
        })
        .catch(error => {
            console.error('Errore caricamento eventi:', error);
            this.error = error.body ? error.body.message : 'Errore sconosciuto';
            this.isLoading = false;
            this.events = [];
            this.generateCalendar();
        });
    }

    /**
     * Formatta DateTime in stringa ora HH:MM
     */
    formatTime(dateTime) {
        if (!dateTime) return '';
        const hours = String(dateTime.getHours()).padStart(2, '0');
        const minutes = String(dateTime.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
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
            const dayEvents = this.events.filter(event => {
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
        this.loadEvents();
    }

    nextMonth() {
        this.currentDate = new Date(
            this.currentDate.getFullYear(),
            this.currentDate.getMonth() + 1,
            1
        );
        this.loadEvents();
    }

    handleEventClick(event) {
        const eventId = event.currentTarget.dataset.id;
        const eventData = this.events.find(e => e.id === eventId);
        if (eventData) {
            // Placeholder per Step futuri - popup dettaglio
            let message = `📅 ${eventData.title}\n`;
            message += `🕐 ${eventData.startTime} - ${eventData.endTime}\n`;
            if (eventData.location) {
                message += `📍 ${eventData.location}\n`;
            }
            if (eventData.description) {
                message += `📝 ${eventData.description}`;
            }
            alert(message);
        }
    }
}