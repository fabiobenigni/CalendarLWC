import { LightningElement } from 'lwc';
import { loadScript } from 'lightning/platformResourceLoader';
import FULLCALENDAR from '@salesforce/resourceUrl/fullcalendar';

export default class CustomCalendar extends LightningElement {
    calendarInitialized = false;
    calendar;

    renderedCallback() {
        if (this.calendarInitialized) {
            return;
        }
        this.calendarInitialized = true;

        // Carica FullCalendar
        loadScript(this, FULLCALENDAR)
            .then(() => {
                this.initializeCalendar();
            })
            .catch(error => {
                console.error('Errore caricamento FullCalendar:', error);
            });
    }

    initializeCalendar() {
        const calendarEl = this.template.querySelector('.calendar-container');
        
        // Dati mock per lo Step 1
        const mockEvents = [
            {
                title: 'Meeting con Cliente',
                start: new Date().toISOString().split('T')[0] + 'T10:00:00',
                end: new Date().toISOString().split('T')[0] + 'T11:00:00',
                backgroundColor: '#1589EE',
                borderColor: '#1589EE'
            },
            {
                title: 'Demo Prodotto',
                start: new Date(Date.now() + 86400000).toISOString().split('T')[0] + 'T14:00:00',
                end: new Date(Date.now() + 86400000).toISOString().split('T')[0] + 'T15:30:00',
                backgroundColor: '#06A59A',
                borderColor: '#06A59A'
            },
            {
                title: 'Formazione Team',
                start: new Date(Date.now() + 172800000).toISOString().split('T')[0] + 'T09:00:00',
                end: new Date(Date.now() + 172800000).toISOString().split('T')[0] + 'T12:00:00',
                backgroundColor: '#E3652A',
                borderColor: '#E3652A'
            }
        ];

        // Inizializza FullCalendar con vista mensile
        this.calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth'
            },
            locale: 'it',
            events: mockEvents,
            height: 'auto',
            eventClick: (info) => {
                // Placeholder per Step futuri - popup dettaglio
                alert('Evento: ' + info.event.title);
            }
        });

        this.calendar.render();
    }
}