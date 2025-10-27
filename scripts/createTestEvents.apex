// Script per creare eventi di test
// 24 eventi al giorno dalle 8:30 alle 12:30 ogni 10 minuti per 10 giorni

List<Event> testEvents = new List<Event>();
Date startDate = Date.today();

// Titoli di esempio per gli eventi
List<String> eventTitles = new List<String>{
    'Appuntamento Cliente',
    'Riunione Team',
    'Demo Prodotto',
    'Consulenza',
    'Formazione',
    'Follow-up',
    'Presentazione',
    'Call Conference',
    'Revisione Progetto',
    'Planning',
    'Workshop',
    'Assistenza Tecnica'
};

// Locations di esempio
List<String> locations = new List<String>{
    'Sala Riunioni A',
    'Ufficio Principale',
    'Online - Teams',
    'Sede Cliente',
    'Sala Conferenze',
    'Online - Zoom',
    null  // Alcuni senza location
};

Integer eventCounter = 0;

// Crea eventi per i prossimi 10 giorni
for (Integer day = 0; day < 10; day++) {
    Date currentDate = startDate.addDays(day);
    
    // Solo giorni lavorativi (Lun-Ven)
    DateTime currentDateTime = DateTime.newInstance(currentDate, Time.newInstance(0, 0, 0, 0));
    String dayOfWeek = currentDateTime.format('E');
    
    if (dayOfWeek == 'Sat' || dayOfWeek == 'Sun') {
        continue; // Salta weekend
    }
    
    // Crea 24 eventi dalle 8:30 alle 12:30 (ogni 10 minuti)
    for (Integer slot = 0; slot < 24; slot++) {
        Integer startHour = 8;
        Integer startMinute = 30 + (slot * 10);
        
        // Gestisci overflow dei minuti
        if (startMinute >= 60) {
            startHour += startMinute / 60;
            startMinute = Math.mod(startMinute, 60);
        }
        
        DateTime startDateTime = DateTime.newInstance(
            currentDate,
            Time.newInstance(startHour, startMinute, 0, 0)
        );
        
        DateTime endDateTime = startDateTime.addMinutes(10);
        
        // Crea evento
        Event evt = new Event();
        Integer titleCount = eventTitles.size();
        Integer locationCount = locations.size();
        Integer titleIndex = Math.mod(eventCounter, titleCount);
        Integer locationIndex = Math.mod(eventCounter, locationCount);
        
        evt.Subject = eventTitles.get(titleIndex) + ' numero ' + String.valueOf(eventCounter + 1);
        evt.StartDateTime = startDateTime;
        evt.EndDateTime = endDateTime;
        evt.Location = locations.get(locationIndex);
        
        // Aggiungi descrizione ogni 3 eventi
        Integer remainder = Math.mod(eventCounter, 3);
        if (remainder == 0) {
            evt.Description = 'Descrizione dettagliata per ' + evt.Subject;
        }
        
        testEvents.add(evt);
        eventCounter++;
    }
}

// Inserisci eventi
try {
    insert testEvents;
    System.debug('✅ Creati ' + testEvents.size() + ' eventi di test con successo!');
    System.debug('📅 Dal ' + startDate + ' per i prossimi 10 giorni lavorativi');
    System.debug('🕐 Orario: 8:30 - 12:30 (slot da 10 minuti)');
} catch (Exception e) {
    System.debug('❌ Errore durante la creazione degli eventi: ' + e.getMessage());
}

