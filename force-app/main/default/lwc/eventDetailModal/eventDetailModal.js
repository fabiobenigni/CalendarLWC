import { LightningElement, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class EventDetailModal extends NavigationMixin(LightningElement) {
    @api eventData;
    @api flowApiName; // Nome del Flow configurabile (opzionale)
    
    get modalTitle() {
        return this.eventData?.title || 'Dettaglio Evento';
    }
    
    get iconName() {
        // Icona basata sul tipo di evento
        if (this.eventData?.eventType === 'ServiceAppointment') {
            return 'standard:service_appointment';
        } else if (this.eventData?.eventType === 'Task') {
            return 'standard:task';
        }
        return 'standard:event';
    }
    
    get startDateTime() {
        if (!this.eventData?.date) return '';
        return this.formatDateTime(this.eventData.date);
    }
    
    get endDateTime() {
        // Usa la data di fine reale dall'evento
        if (!this.eventData?.endDate) return '';
        return this.formatDateTime(this.eventData.endDate);
    }
    
    get location() {
        return this.eventData?.location || 'N/A';
    }
    
    get description() {
        return this.eventData?.description || '';
    }
    
    get ownerName() {
        return this.eventData?.ownerName || '';
    }
    
    get showFlowButton() {
        // Mostra il pulsante Flow solo se è configurato
        return !!this.flowApiName;
    }
    
    formatDateTime(date) {
        const options = {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Intl.DateTimeFormat('it-IT', options).format(date);
    }
    
    handleClose() {
        // Chiude il modal
        this.dispatchEvent(new CustomEvent('close'));
    }
    
    handleOpenRecord() {
        // Naviga al record Salesforce
        if (!this.eventData?.id) return;
        
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.eventData.id,
                objectApiName: this.eventData.eventType || 'Event',
                actionName: 'view'
            }
        });
        
        // Chiude il modal dopo la navigazione
        this.handleClose();
    }
    
    handleLaunchFlow() {
        // Lancia il Flow configurato
        // TODO: Implementare il lancio del Flow in Step successivo
        console.log('Launch Flow:', this.flowApiName, 'for record:', this.eventData?.id);
        
        // Per ora mostra un placeholder
        alert(`Flow "${this.flowApiName}" sarà implementato nei prossimi step`);
    }
}

