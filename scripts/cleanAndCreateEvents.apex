// Script per eliminare eventi di test esistenti e ricrearne di nuovi
// UN SOLO evento per slot di 10 minuti dalle 8:30 alle 12:30
// Per i prossimi 3 settimane (solo giorni lavorativi)

// 1. Elimina tutti gli eventi di test esistenti
List<Event> existingEvents = [
    SELECT Id 
    FROM Event 
    WHERE (Subject LIKE 'Appuntamento%' 
        OR Subject LIKE 'Riunione%' 
        OR Subject LIKE 'Demo%'
        OR Subject LIKE 'Consulenza%'
        OR Subject LIKE 'Formazione%'
        OR Subject LIKE 'Follow-up%'
        OR Subject LIKE 'Presentazione%'
        OR Subject LIKE 'Call%'
        OR Subject LIKE 'Revisione%'
        OR Subject LIKE 'Planning%'
        OR Subject LIKE 'Workshop%'
        OR Subject LIKE 'Assistenza%')
];

if (!existingEvents.isEmpty()) {
    delete existingEvents;
    System.debug('🗑️  Eliminati ' + existingEvents.size() + ' eventi esistenti');
}

// 2. Crea nuovi eventi
List<Event> testEvents = new List<Event>();
Date today = Date.today();

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

// Genera eventi per i prossimi 21 giorni (3 settimane)
for (Integer day = 0; day < 21; day++) {
    Date currentDay = today.addDays(day);
    
    // Salta i weekend (Sabato e Domenica)
    DateTime dt = DateTime.newInstance(currentDay, Time.newInstance(0, 0, 0, 0));
    String dayName = dt.format('E');
    if (dayName == 'Sat' || dayName == 'Sun') {
        continue;
    }
    
    // Slot dalle 8:30 alle 12:30 ogni 10 minuti = 25 slot
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

System.debug('📅 Totale eventi da creare: ' + testEvents.size());

if (!testEvents.isEmpty()) {
    try {
        insert testEvents;
        System.debug('✅ Creati ' + testEvents.size() + ' eventi per le prossime 3 settimane');
        System.debug('   Dal ' + today + ' per 3 settimane (solo giorni lavorativi)');
    } catch (DmlException e) {
        System.debug('❌ Errore: ' + e.getMessage());
    }
}

