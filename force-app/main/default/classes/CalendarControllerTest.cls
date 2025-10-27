/**
 * Test class per CalendarController
 */
@isTest
private class CalendarControllerTest {
    
    @testSetup
    static void setupTestData() {
        // Crea eventi di test
        List<Event> testEvents = new List<Event>();
        
        Date today = Date.today();
        
        // Evento oggi
        testEvents.add(new Event(
            Subject = 'Test Meeting',
            StartDateTime = DateTime.newInstance(today, Time.newInstance(10, 0, 0, 0)),
            EndDateTime = DateTime.newInstance(today, Time.newInstance(11, 0, 0, 0)),
            Description = 'Test Description',
            Location = 'Test Location'
        ));
        
        // Evento domani
        testEvents.add(new Event(
            Subject = 'Demo Test',
            StartDateTime = DateTime.newInstance(today.addDays(1), Time.newInstance(14, 0, 0, 0)),
            EndDateTime = DateTime.newInstance(today.addDays(1), Time.newInstance(15, 0, 0, 0))
        ));
        
        // Evento mese prossimo (non dovrebbe essere recuperato)
        testEvents.add(new Event(
            Subject = 'Future Event',
            StartDateTime = DateTime.newInstance(today.addMonths(1), Time.newInstance(10, 0, 0, 0)),
            EndDateTime = DateTime.newInstance(today.addMonths(1), Time.newInstance(11, 0, 0, 0))
        ));
        
        insert testEvents;
    }
    
    @isTest
    static void testGetEventsSuccess() {
        // Test recupero eventi nel mese corrente
        Date today = Date.today();
        Date startDate = today.toStartOfMonth();
        Date endDate = today.addMonths(1).toStartOfMonth().addDays(-1);
        
        Test.startTest();
        List<CalendarController.CalendarEvent> events = CalendarController.getEvents(startDate, endDate);
        Test.stopTest();
        
        // Verifica
        System.assertNotEquals(null, events, 'La lista eventi non deve essere null');
        System.assertEquals(2, events.size(), 'Devono essere recuperati 2 eventi nel mese corrente');
        
        // Verifica primo evento
        CalendarController.CalendarEvent firstEvent = events[0];
        System.assertEquals('Test Meeting', firstEvent.title, 'Il titolo deve corrispondere');
        System.assertEquals('Event', firstEvent.eventType, 'Il tipo deve essere Event');
        System.assertNotEquals(null, firstEvent.startDateTime, 'StartDateTime non deve essere null');
        System.assertNotEquals(null, firstEvent.endDateTime, 'EndDateTime non deve essere null');
    }
    
    @isTest
    static void testGetEventsNoResults() {
        // Test recupero eventi in un range dove non ci sono eventi
        Date futureDate = Date.today().addYears(1);
        Date startDate = futureDate.toStartOfMonth();
        Date endDate = futureDate.addMonths(1).toStartOfMonth().addDays(-1);
        
        Test.startTest();
        List<CalendarController.CalendarEvent> events = CalendarController.getEvents(startDate, endDate);
        Test.stopTest();
        
        // Verifica
        System.assertNotEquals(null, events, 'La lista eventi non deve essere null');
        System.assertEquals(0, events.size(), 'Non devono essere recuperati eventi');
    }
    
    @isTest
    static void testGetEventsWithNullSubject() {
        // Crea evento senza subject
        Event eventWithoutSubject = new Event(
            StartDateTime = DateTime.now(),
            EndDateTime = DateTime.now().addHours(1)
        );
        insert eventWithoutSubject;
        
        Date today = Date.today();
        Date startDate = today.toStartOfMonth();
        Date endDate = today.addMonths(1).toStartOfMonth().addDays(-1);
        
        Test.startTest();
        List<CalendarController.CalendarEvent> events = CalendarController.getEvents(startDate, endDate);
        Test.stopTest();
        
        // Verifica che l'evento senza subject abbia il testo di default
        Boolean foundEventWithoutSubject = false;
        for (CalendarController.CalendarEvent evt : events) {
            if (evt.title == '(Nessun oggetto)') {
                foundEventWithoutSubject = true;
                break;
            }
        }
        System.assert(foundEventWithoutSubject, 'Deve essere trovato un evento con subject di default');
    }
}


