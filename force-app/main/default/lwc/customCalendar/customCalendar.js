import { LightningElement, api, track } from 'lwc';
import getEvents from '@salesforce/apex/CalendarController.getEvents';

export default class CustomCalendar extends LightningElement {
    // Parametri configurabili
    @api startTime = '07:30';
    @api endTime = '13:00';
    @api slotDuration = 10;
    @api defaultView = 'month';
    @api flowApiName; // Nome API del Flow da lanciare (opzionale)
    
    // Stato componente
    @track currentDate = new Date();
    @track currentView = 'month';
    weekDays = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
    weekDaysShort = ['L', 'M', 'M', 'G', 'V'];
    @track calendarDays = { days: [], weekDays: [], gridRows: [] };
    @track events = [];
    @track isLoading = false;
    @track error;
    
    // Modal dettaglio evento
    @track showEventModal = false;
    @track selectedEvent = null;

    // Sidebar
    @track isSidebarOpen = false;
    
    // Gestione calendari e colori
    get myCalendars() {
        return this._myCalendars.map(cal => ({
            ...cal,
            colorStyle: `background-color: ${cal.color};`
        }));
    }
    
    set myCalendars(value) {
        this._myCalendars = value;
    }
    
    _myCalendars = [
        { id: 'myEvents', name: 'Eventi personali', color: '#1589EE', visible: true }
    ];
    
    // Palette colori disponibili
    get calendarColors() {
        const colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
            '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788',
            '#1589EE', '#E74C3C', '#3498DB', '#2ECC71', '#F39C12',
            '#9B59B6', '#34495E', '#16A085', '#E67E22', '#95A5A6'
        ];
        return colors.map(color => ({
            value: color,
            style: `background-color: ${color};`
        }));
    }

    connectedCallback() {
        this.currentView = this.defaultView || 'month';
        this.loadEvents();
    }

    // Getter per la classe CSS della sidebar
    get sidebarClass() {
        return this.isSidebarOpen ? 'calendar-sidebar open' : 'calendar-sidebar collapsed';
    }

    // Toggle sidebar
    toggleSidebar() {
        this.isSidebarOpen = !this.isSidebarOpen;
    }

    // Handle calendar toggle (visibilità)
    handleCalendarToggle(event) {
        const calendarId = event.currentTarget.dataset.calendar;
        const calendar = this._myCalendars.find(cal => cal.id === calendarId);
        if (calendar) {
            calendar.visible = event.target.checked;
            this._myCalendars = [...this._myCalendars]; // Trigger reactivity
            this.generateCalendar(); // Rigenera vista
        }
    }

    // Gestione cambio colore calendario
    handleColorChange(event) {
        const calendarId = event.currentTarget.dataset.calendar;
        const newColor = event.currentTarget.dataset.color;
        
        const calendar = this._myCalendars.find(cal => cal.id === calendarId);
        if (calendar) {
            calendar.color = newColor;
            this._myCalendars = [...this._myCalendars]; // Trigger reactivity
            
            // Aggiorna colore eventi già caricati
            this.events = this.events.map(evt => ({
                ...evt,
                color: newColor
            }));
            
            this.generateCalendar(); // Rigenera vista con nuovo colore
        }
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

    get showAvailabilityView() {
        return this.currentView === 'availability';
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

    get isAvailabilityView() {
        return this.currentView === 'availability' ? 'brand' : 'neutral';
    }

    // Getter di sicurezza per le viste
    get monthDaysData() {
        return this.calendarDays?.days || [];
    }

    get weekDaysData() {
        return this.calendarDays?.weekDays || [];
    }

    get gridRowsData() {
        return this.calendarDays?.gridRows || [];
    }

    get calendarHeadersData() {
        return this.calendarDays?.calendarHeaders || [];
    }

    get calendarCount() {
        return this.calendarHeadersData.length || 1;
    }

    get availabilityGridStyle() {
        return `--calendar-count: ${this.calendarCount};`;
    }

    // Getter per debug
    get eventsCount() {
        return this.events?.length || 0;
    }

    /**
     * Formatta una data in formato YYYY-MM-DD senza problemi di timezone
     */
    formatDateForApex(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    /**
     * Parse di una data/ora da Apex (formato ISO) in un oggetto Date locale
     * senza problemi di conversione timezone
     */
    parseApexDateTime(isoString) {
        // Formato ISO da Apex: "2025-10-27T08:30:00.000Z"
        // Estraiamo i componenti e creiamo una data locale
        const match = isoString.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);
        if (match) {
            const [, year, month, day, hours, minutes, seconds] = match;
            return new Date(
                parseInt(year),
                parseInt(month) - 1, // I mesi in JS partono da 0
                parseInt(day),
                parseInt(hours),
                parseInt(minutes),
                parseInt(seconds)
            );
        }
        // Fallback se il formato non corrisponde
        return new Date(isoString);
    }

    /**
     * Carica gli eventi dal server per il range corrente (basato sulla vista)
     */
    loadEvents() {
        this.isLoading = true;
        this.error = undefined;
        
        let startDate, endDate;
        
        // Calcola range basato sulla vista corrente
        if (this.currentView === 'month') {
            // Range: mese intero
            const year = this.currentDate.getFullYear();
            const month = this.currentDate.getMonth();
            startDate = new Date(year, month, 1);
            endDate = new Date(year, month + 1, 0);
        } else if (this.currentView === 'week') {
            // Range: settimana corrente (Lunedì-Venerdì)
            startDate = this.getWeekStart(this.currentDate);
            endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 4); // Venerdì
        } else {
            // Range: giorno corrente (dall'inizio del giorno all'inizio del giorno successivo)
            startDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), this.currentDate.getDate());
            endDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), this.currentDate.getDate() + 1);
        }
        
        // Chiama Apex con date formattate correttamente
        getEvents({ 
            startDate: this.formatDateForApex(startDate), 
            endDate: this.formatDateForApex(endDate) 
        })
        .then(data => {
            // Trasforma eventi per il calendario
            this.events = data.map(event => {
                // Parse della data senza problemi di timezone
                const startDate = this.parseApexDateTime(event.startDateTime);
                const endDate = this.parseApexDateTime(event.endDateTime);
                
                // Usa il colore del calendario configurato, altrimenti quello di default
                const myEventsCalendar = this._myCalendars.find(cal => cal.id === 'myEvents');
                const eventColor = myEventsCalendar ? myEventsCalendar.color : event.color;
                
                return {
                    id: event.id,
                    title: event.title,
                    date: startDate,
                    endDate: endDate,
                    startTime: this.formatTime(startDate),
                    endTime: this.formatTime(endDate),
                    color: eventColor,
                    description: event.description,
                    location: event.location,
                    ownerName: event.ownerName,
                    eventType: event.eventType
                };
            });
            
            this.isLoading = false;
            this.generateCalendar();
        })
        .catch(error => {
            console.error('❌ Errore caricamento eventi:', error);
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
        
        if (this.showMonthView) {
            return `${months[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
        } else if (this.showWeekView) {
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
        const newView = event.currentTarget.dataset.view;
        
        if (!newView || newView === this.currentView) {
            return;
        }
        
        // IMPORTANTE: Cambio la vista PRIMA di resettare i dati
        this.currentView = newView;
        
        // Reset dello stato
        this.isLoading = true;
        this.calendarDays = { days: [], weekDays: [], gridRows: [] };
        
        // Reimposta la data corrente (oggi)
        this.currentDate = new Date();
        
        // Ricarica gli eventi con il nuovo range
        // Il metodo loadEvents() chiamerà generateCalendar() alla fine
        this.loadEvents();
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
        if (this.showMonthView) {
            this.generateMonthView();
        } else if (this.showWeekView) {
            this.generateWeekView();
        } else if (this.showDayView) {
            this.generateDayView();
        } else if (this.showAvailabilityView) {
            this.generateAvailabilityView();
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
            
            // Trova eventi per questo giorno (solo eventi visibili)
            const visibleEvents = this.getVisibleEvents();
            const dayEvents = visibleEvents.filter(event => {
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
        
        this.calendarDays = { days: days, weekDays: [], gridRows: [] };
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
            const day = new Date(weekStart.getTime()); // Crea una nuova copia
            day.setDate(weekStart.getDate() + i);
            
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

        this.calendarDays = { days: [], weekDays, gridRows };
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

        this.calendarDays = { days: [], weekDays: [], gridRows };
    }

    /**
     * Genera la vista Availability - mostra più calendari affiancati per un giorno
     */
    generateAvailabilityView() {
        const timeSlots = this.generateTimeSlots();
        
        // Usa i calendari configurati e visibili
        const calendars = this._myCalendars.filter(cal => cal.visible);

        // Crea righe della griglia
        const gridRows = timeSlots.map((slot, index) => {
            // Per ogni slot, crea celle per ogni calendario
            const cells = calendars.map(calendar => {
                const dayEvents = this.getEventsForDay(this.currentDate);
                const slotEvents = dayEvents.filter(event => {
                    const eventStart = event.date.getHours() * 60 + event.date.getMinutes();
                    return slot.minutes <= eventStart && slot.minutes + this.slotDuration > eventStart;
                }).map(event => ({
                    ...event,
                    style: `background-color: ${event.color}; border-left: 4px solid ${event.color};`
                }));

                return {
                    key: `cell-${calendar.id}-${index}`,
                    calendarId: calendar.id,
                    events: slotEvents
                };
            });

            return {
                key: `row-${index}`,
                timeLabel: slot.time,
                cells: cells
            };
        });

        // Prepara header con nomi calendari
        const calendarHeaders = calendars.map(calendar => ({
            key: calendar.id,
            name: calendar.name,
            color: calendar.color
        }));

        this.calendarDays = { 
            days: [], 
            weekDays: [], 
            gridRows: gridRows,
            calendarHeaders: calendarHeaders 
        };
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
     * Ottiene gli eventi visibili (filtra in base ai calendari attivi)
     */
    getVisibleEvents() {
        // Per ora tutti gli eventi sono di "myEvents", quindi filtra in base alla visibilità
        const myEventsCalendar = this._myCalendars.find(cal => cal.id === 'myEvents');
        if (!myEventsCalendar || !myEventsCalendar.visible) {
            return [];
        }
        return this.events;
    }

    /**
     * Ottiene gli eventi per un giorno specifico (solo eventi visibili)
     */
    getEventsForDay(date) {
        const visibleEvents = this.getVisibleEvents();
        return visibleEvents.filter(event => {
            return event.date.getDate() === date.getDate() &&
                   event.date.getMonth() === date.getMonth() &&
                   event.date.getFullYear() === date.getFullYear();
        });
    }

    /**
     * Navigazione precedente (mese/settimana/giorno in base alla vista)
     */
    previousMonth() {
        if (this.currentView === 'month') {
            // Mese precedente
            this.currentDate = new Date(
                this.currentDate.getFullYear(),
                this.currentDate.getMonth() - 1,
                1
            );
        } else if (this.currentView === 'week') {
            // Settimana precedente (7 giorni indietro)
            const newDate = new Date(this.currentDate);
            newDate.setDate(newDate.getDate() - 7);
            this.currentDate = newDate;
        } else {
            // Giorno precedente
            const newDate = new Date(this.currentDate);
            newDate.setDate(newDate.getDate() - 1);
            this.currentDate = newDate;
        }
        this.loadEvents();
    }

    /**
     * Navigazione successiva (mese/settimana/giorno in base alla vista)
     */
    nextMonth() {
        if (this.currentView === 'month') {
            // Mese successivo
            this.currentDate = new Date(
                this.currentDate.getFullYear(),
                this.currentDate.getMonth() + 1,
                1
            );
        } else if (this.currentView === 'week') {
            // Settimana successiva (7 giorni avanti)
            const newDate = new Date(this.currentDate);
            newDate.setDate(newDate.getDate() + 7);
            this.currentDate = newDate;
        } else {
            // Giorno successivo
            const newDate = new Date(this.currentDate);
            newDate.setDate(newDate.getDate() + 1);
            this.currentDate = newDate;
        }
        this.loadEvents();
    }

    handleEventClick(event) {
        const eventId = event.currentTarget.dataset.id;
        const eventData = this.events.find(e => e.id === eventId);
        if (eventData) {
            // Apre il modal con i dettagli dell'evento
            this.selectedEvent = eventData;
            this.showEventModal = true;
        }
    }

    handleCloseModal() {
        // Chiude il modal
        this.showEventModal = false;
        this.selectedEvent = null;
    }
}