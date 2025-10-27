/**
 * Controller Apex per il componente customCalendar
 * Gestisce il recupero di Eventi da Salesforce
 */
public with sharing class CalendarController {
    
    /**
     * Recupera gli eventi dell'utente corrente nel range di date specificato
     * @param startDate Data inizio range
     * @param endDate Data fine range
     * @return Lista di eventi con informazioni essenziali
     */
    @AuraEnabled(cacheable=true)
    public static List<CalendarEvent> getEvents(Date startDate, Date endDate) {
        List<CalendarEvent> calendarEvents = new List<CalendarEvent>();
        
        try {
            // Query eventi nel range di date
            List<Event> events = [
                SELECT Id, Subject, StartDateTime, EndDateTime, 
                       Description, Location, OwnerId, Owner.Name
                FROM Event
                WHERE StartDateTime >= :startDate 
                  AND StartDateTime <= :endDate
                  AND OwnerId = :UserInfo.getUserId()
                ORDER BY StartDateTime ASC
                LIMIT 1000
            ];
            
            // Trasforma eventi in formato per il calendario
            for (Event evt : events) {
                CalendarEvent calEvent = new CalendarEvent();
                calEvent.id = evt.Id;
                calEvent.title = evt.Subject != null ? evt.Subject : '(Nessun oggetto)';
                calEvent.startDateTime = evt.StartDateTime;
                calEvent.endDateTime = evt.EndDateTime;
                calEvent.description = evt.Description;
                calEvent.location = evt.Location;
                calEvent.ownerName = evt.Owner.Name;
                calEvent.color = '#1589EE'; // Colore default, sarà configurabile in Step successivi
                calEvent.eventType = 'Event';
                
                calendarEvents.add(calEvent);
            }
            
            System.debug('Eventi recuperati: ' + calendarEvents.size());
            
        } catch (Exception e) {
            System.debug('Errore recupero eventi: ' + e.getMessage());
            throw new AuraHandledException('Errore nel recupero degli eventi: ' + e.getMessage());
        }
        
        return calendarEvents;
    }
    
    /**
     * Classe wrapper per rappresentare un evento nel calendario
     */
    public class CalendarEvent {
        @AuraEnabled public String id { get; set; }
        @AuraEnabled public String title { get; set; }
        @AuraEnabled public DateTime startDateTime { get; set; }
        @AuraEnabled public DateTime endDateTime { get; set; }
        @AuraEnabled public String description { get; set; }
        @AuraEnabled public String location { get; set; }
        @AuraEnabled public String ownerName { get; set; }
        @AuraEnabled public String color { get; set; }
        @AuraEnabled public String eventType { get; set; }
    }
}


