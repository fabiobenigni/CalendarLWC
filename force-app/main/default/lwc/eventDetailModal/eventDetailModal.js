import { LightningElement, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class EventDetailModal extends NavigationMixin(LightningElement) {
    @api flowApiName; // Nome del Flow configurabile (opzionale)
    
    // Stato interno: dati evento
    _eventData;
    
    @api
    get eventData() {
        return this._eventData;
    }
    set eventData(value) {
        this._eventData = value;
    }
    
    get modalTitle() {
        return this._eventData?.title || 'Dettaglio Evento';
    }
    
    get iconName() {
        // Icona basata sul tipo di evento
        if (this._eventData?.eventType === 'ServiceAppointment') {
            return 'standard:service_appointment';
        } else if (this._eventData?.eventType === 'Task') {
            return 'standard:task';
        }
        return 'standard:event';
    }
    
    get startDateTime() {
        if (!this._eventData?.date) return '';
        return this.formatDateTime(this._eventData.date);
    }
    
    get endDateTime() {
        // Usa la data di fine reale dall'evento
        if (!this._eventData?.endDate) return '';
        return this.formatDateTime(this._eventData.endDate);
    }
    
    get location() {
        return this._eventData?.location || 'N/A';
    }
    
    get description() {
        return this._eventData?.description || '';
    }
    
    get ownerName() {
        return this._eventData?.ownerName || '';
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
    
    // URL per apertura in nuova scheda (fallback semplice e robusto)
    get recordUrl() {
        if (!this._eventData?.id) return undefined;
        const obj = this._eventData.eventType || 'Event';
        return `/lightning/r/${obj}/${this._eventData.id}/view`;
    }
    
    handleClose() {
        // Chiude il modal
        this.dispatchEvent(new CustomEvent('close'));
    }
    
    handleOpenRecord() {
        // Naviga al record Salesforce
        if (!this._eventData?.id) return;
        
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this._eventData.id,
                objectApiName: this._eventData.eventType || 'Event',
                actionName: 'view'
            }
        });
        
        // Chiude il modal dopo la navigazione
        this.handleClose();
    }
    
    handleLaunchFlow() {
        // Lancia il Flow configurato
        // TODO: Implementare il lancio del Flow in Step successivo
        console.log('Launch Flow:', this.flowApiName, 'for record:', this._eventData?.id);
        
        // Per ora mostra un placeholder
        alert(`Flow "${this.flowApiName}" sarà implementato nei prossimi step`);
    }
}

