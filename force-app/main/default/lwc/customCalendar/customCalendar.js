import { LightningElement, api } from 'lwc';
import getEvents from '@salesforce/apex/CalendarController.getEvents';

export default class CustomCalendar extends LightningElement {
    // Parametri configurabili
    @api startTime = '07:30';
    @api endTime = '13:00';
    @api slotDuration = 10;
    @api defaultView = 'month';
    
    // Stato componente
    currentDate = new Date();
    currentView = 'month';
    weekDays = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
    weekDaysShort = ['L', 'M', 'M', 'G', 'V'];
    calendarDays = [];
    events = [];
    isLoading = false;
    error;

    connectedCallback() {
        this.currentView = this.defaultView || 'month';
        this.loadEvents();
        console.log('Calendario custom inizializzato - Vista:', this.currentView);
    }

    // Getter per le viste (booleani per template)
    get showMonthView() {
        return this.currentView === 'month';
    }

    get showWeekView() {
        return this.currentView === 'week';
    }

    get showDayView() {
        return this.currentView === 'day';
    }

    // Getter per varianti pulsanti
    get isMonthView() {
        return this.currentView === 'month' ? 'brand' : 'neutral';
    }

    get isWeekView() {
        return this.currentView === 'week' ? 'brand' : 'neutral';
    }

    get isDayView() {
        return this.currentView === 'day' ? 'brand' : 'neutral';
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
        
        if (this.isMonthView) {
            return `${months[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
        } else if (this.isWeekView) {
            const weekStart = this.getWeekStart(this.currentDate);
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 4); // Venerdì
            return `Settimana ${weekStart.getDate()}-${weekEnd.getDate()} ${months[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
        } else {
            return `${this.currentDate.getDate()} ${months[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
        }
    }

    /**
     * Gestisce il cambio vista
     */
    handleViewChange(event) {
        const newView = event.target.value;
        this.currentView = newView;
        this.generateCalendar();
    }

    /**
     * Ottiene il lunedì della settimana corrente
     */
    getWeekStart(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Lunedì
        return new Date(d.setDate(diff));
    }

    generateCalendar() {
        if (this.isMonthView) {
            this.generateMonthView();
        } else if (this.isWeekView) {
            this.generateWeekView();
        } else if (this.isDayView) {
            this.generateDayView();
        }
    }

    generateMonthView() {
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

    /**
     * Genera la vista settimanale (Lun-Ven con griglia oraria)
     */
    generateWeekView() {
        const weekStart = this.getWeekStart(this.currentDate);
        const timeSlots = this.generateTimeSlots();
        const weekDays = [];

        // Genera 5 giorni lavorativi (Lun-Ven)
        for (let i = 0; i < 5; i++) {
            const day = new Date(weekStart);
            day.setDate(day.getDate() + i);
            
            const dayEvents = this.getEventsForDay(day);
            
            weekDays.push({
                key: `day-${i}`,
                date: day,
                dayNumber: day.getDate(),
                dayName: this.weekDaysShort[i],
                events: dayEvents
            });
        }

        // Crea righe della griglia (una riga per ogni slot temporale)
        const gridRows = timeSlots.map((slot, index) => {
            const row = {
                key: `row-${index}`,
                timeLabel: slot.time,
                cells: []
            };

            // Per ogni giorno, trova gli eventi in questo slot
            weekDays.forEach(day => {
                const slotEvents = day.events.filter(event => {
                    const eventStart = event.date.getHours() * 60 + event.date.getMinutes();
                    return slot.minutes <= eventStart && slot.minutes + this.slotDuration > eventStart;
                }).map(event => ({
                    ...event,
                    style: `background-color: ${event.color}; border-left: 4px solid ${event.color};`
                }));

                row.cells.push({
                    key: `${day.key}-${slot.time}`,
                    events: slotEvents
                });
            });

            return row;
        });

        this.calendarDays = { weekDays, gridRows };
        console.log('Vista settimanale generata:', weekDays.length, 'giorni,', gridRows.length, 'slot');
    }

    /**
     * Genera la vista giornaliera (singolo giorno con griglia oraria)
     */
    generateDayView() {
        const timeSlots = this.generateTimeSlots();
        const dayEvents = this.getEventsForDay(this.currentDate);

        // Crea righe della griglia (una riga per ogni slot temporale)
        const gridRows = timeSlots.map((slot, index) => {
            const slotEvents = dayEvents.filter(event => {
                const eventStart = event.date.getHours() * 60 + event.date.getMinutes();
                return slot.minutes <= eventStart && slot.minutes + this.slotDuration > eventStart;
            }).map(event => ({
                ...event,
                style: `background-color: ${event.color}; border-left: 4px solid ${event.color};`
            }));

            return {
                key: `row-${index}`,
                timeLabel: slot.time,
                events: slotEvents
            };
        });

        this.calendarDays = { gridRows };
        console.log('Vista giornaliera generata:', gridRows.length, 'slot');
    }

    /**
     * Genera gli slot temporali in base alla configurazione
     */
    generateTimeSlots() {
        const slots = [];
        const [startHour, startMin] = this.startTime.split(':').map(Number);
        const [endHour, endMin] = this.endTime.split(':').map(Number);
        
        let currentTime = startHour * 60 + startMin;
        const endTime = endHour * 60 + endMin;
        
        while (currentTime < endTime) {
            const hour = Math.floor(currentTime / 60);
            const minute = currentTime % 60;
            const timeLabel = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
            
            slots.push({
                time: timeLabel,
                minutes: currentTime
            });
            
            currentTime += this.slotDuration;
        }
        
        return slots;
    }

    /**
     * Ottiene gli eventi per un giorno specifico
     */
    getEventsForDay(date) {
        return this.events.filter(event => {
            return event.date.getDate() === date.getDate() &&
                   event.date.getMonth() === date.getMonth() &&
                   event.date.getFullYear() === date.getFullYear();
        });
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