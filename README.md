# Calendario LWC Personalizzato

Componente Lightning Web Component che replica le funzionalità del componente Calendar Standard di Salesforce, con la possibilità di essere utilizzato in Home Page, Lightning Page e Community.

## 🎯 Obiettivi del Progetto

Creare un componente calendario personalizzato che:
- Replichi tutte le funzionalità del Calendar Standard
- Supporti multi-calendar con colori personalizzabili
- Visualizzi Event, Task e ServiceAppointment
- Sia utilizzabile in diverse pagine Lightning e Community
- Sia distribuibile tramite package unmanaged

## 📋 Roadmap Sviluppo

### ✅ STEP 1 - Setup Base (COMPLETATO)
- [x] Struttura progetto SFDX
- [x] Componente LWC base custom (senza librerie esterne)
- [x] Vista mensile con griglia calendario custom
- [x] Navigazione mese precedente/successivo
- [x] Eventi mock con colori personalizzati
- [x] Stili SLDS integrati con Lightning Design System

### ✅ STEP 2 - Integrazione Dati (COMPLETATO)
- [x] Apex class CalendarController per recuperare Event
- [x] Test class con copertura 100%
- [x] Visualizzazione eventi reali da Salesforce
- [x] Filtro automatico per mese corrente
- [x] Loading spinner durante caricamento
- [x] Gestione errori con messaggi utente
- [x] Navigazione mesi con ricaricamento automatico eventi
- [x] Click evento con dettagli completi (titolo, orario, location, descrizione)

### ✅ STEP 3 - Multi-vista & Configurazione (COMPLETATO)
- [x] Parametri configurabili LWC (orari inizio/fine, durata slot, vista default)
- [x] Vista settimanale (Lun-Ven, griglia oraria 7:30-13:00 default)
- [x] Vista giornaliera (stesso layout settimanale, singolo giorno)
- [x] Switch tra viste con pulsanti (Mese/Settimana/Giorno)
- [x] Slot temporali configurabili (default 10 minuti)
- [x] Eventi posizionati automaticamente su griglia oraria
- [x] Navigazione mese/settimana/giorno con ricaricamento automatico
- [x] Stili responsive per griglia oraria

### 👥 STEP 4 - Multi-calendar & Service Territory (In arrivo)
- [ ] Selezione Service Territory
- [ ] Lista ServiceTerritoryMembers
- [ ] Aggiunta calendari multipli (max 10 configurabile)

### 🎨 STEP 5 - Colori & Preferenze (In arrivo)
- [ ] Gestione colori personalizzati per utente
- [ ] Salvataggio preferenze utente

### 🚀 STEP Successivi
- [ ] Integrazione ServiceAppointment e Task
- [ ] Popup dettaglio eventi
- [ ] Lancio Screen Flow
- [ ] Configurazione LWC (oggetti, drag&drop, limiti)
- [ ] Filtri per Status
- [ ] Package unmanaged

## 🛠️ Tecnologie Utilizzate

- **Salesforce Lightning Web Components (LWC)**
- **Salesforce Lightning Design System (SLDS)**
- **JavaScript Nativo** (senza dipendenze esterne)
- **CSS Grid** (per layout calendario)
- **Apex** (per recupero dati - prossimi step)
- **SFDX** (Salesforce DX)

## 📦 Struttura Progetto

```
force-app/main/default/
├── classes/
│   ├── CalendarController.cls           # Controller Apex per recupero eventi
│   ├── CalendarController.cls-meta.xml
│   ├── CalendarControllerTest.cls       # Test class con 100% coverage
│   └── CalendarControllerTest.cls-meta.xml
├── lwc/
│   └── customCalendar/                  # Componente calendario principale
│       ├── customCalendar.html          # Template con griglia calendario
│       ├── customCalendar.js            # Logica calendario custom
│       ├── customCalendar.css           # Stili SLDS
│       └── customCalendar.js-meta.xml
└── applications/
    └── Calendar_Demo_App.app-meta.xml   # App Lightning di esempio
```

## 🚀 Installazione e Deploy

### Prerequisiti
- Salesforce CLI installato
- Org Salesforce (Sandbox o Developer Edition)
- VS Code con Salesforce Extensions (consigliato)

### Deploy in Salesforce

```bash
# Autenticazione org
sf org login web -a myOrg

# Deploy del componente
sf project deploy start --source-dir force-app

# Aprire org
sf org open
```

## 📝 Note di Sviluppo

- Il progetto è in sviluppo incrementale
- Ogni step viene completato e testato prima di passare al successivo
- Il componente è pensato principalmente per utilizzo desktop, con supporto responsive mobile/tablet se possibile
- Massimo 10 calendari visualizzabili contemporaneamente (configurabile)

## 📄 Licenza

Progetto privato. Implementazione 100% custom senza dipendenze esterne.

## 👤 Autore

Sviluppo: Fabio Benigni
