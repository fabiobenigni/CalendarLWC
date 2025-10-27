// Script per creare eventi di test per la settimana corrente
// 24 eventi al giorno dalle 8:30 alle 12:30 ogni 10 minuti

// Elimina prima gli eventi esistenti (opzionale)
// Delete [SELECT Id FROM Event WHERE Subject LIKE 'Appuntamento%' OR Subject LIKE 'Riunione%'];

List<Event> testEvents = new List<Event>();
Date today = Date.today();

// Trova il Lunedì della settimana corrente
Date monday = today.toStartOfWeek().addDays(1); // toStartOfWeek() dà Domenica, aggiungiamo 1 per avere Lunedì

List<String> eventTitles = new List<String>{
    'Appuntamento Cliente', 'Riunione Team', 'Demo Prodotto', 'Consulenza',
    'Formazione', 'Follow-up', 'Presentazione', 'Call Conference',
    'Revisione Progetto', 'Planning', 'Workshop', 'Assistenza Tecnica'
};

List<String> locations = new List<String>{
    'Sala Riunioni A', 'Ufficio Principale', 'Online - Teams', 'Sede Cliente',
    'Sala Conferenze', 'Online - Zoom', null
};

Integer eventCounter = 0;

// Genera eventi per i prossimi 5 giorni lavorativi (Lun-Ven)
for (Integer day = 0; day < 5; day++) {
    Date currentDay = monday.addDays(day);
    
    System.debug('Creazione eventi per: ' + currentDay);
    
    // Slot dalle 8:30 alle 12:30 ogni 10 minuti = 24 slot
    for (Integer hour = 8; hour <= 12; hour++) {
        for (Integer minute = 0; minute < 60; minute += 10) {
            // Inizia da 8:30
            if (hour == 8 && minute < 30) continue;
            // Finisce a 12:30
            if (hour == 12 && minute > 30) continue;
            
            DateTime startDateTime = DateTime.newInstance(currentDay, Time.newInstance(hour, minute, 0, 0));
            DateTime endDateTime = startDateTime.addMinutes(10);
            
            Event evt = new Event();
            evt.Subject = eventTitles.get(Math.mod(eventCounter, eventTitles.size())) + ' #' + (eventCounter + 1);
            evt.StartDateTime = startDateTime;
            evt.EndDateTime = endDateTime;
            evt.Location = locations.get(Math.mod(eventCounter, locations.size()));
            
            if (Math.mod(eventCounter, 3) == 0) {
                evt.Description = 'Descrizione dettagliata per ' + evt.Subject;
            }
            
            testEvents.add(evt);
            eventCounter++;
        }
    }
}

System.debug('Totale eventi da creare: ' + testEvents.size());

if (!testEvents.isEmpty()) {
    try {
        insert testEvents;
        System.debug('✅ Creati ' + testEvents.size() + ' eventi di test per la settimana corrente.');
        System.debug('   Settimana dal ' + monday + ' al ' + monday.addDays(4));
    } catch (DmlException e) {
        System.debug('❌ Errore durante l\'inserimento degli eventi: ' + e.getMessage());
    }
}

