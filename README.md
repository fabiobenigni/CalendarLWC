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

### 🔄 STEP 2 - Integrazione Dati (In arrivo)
- [ ] Apex class per recuperare Event
- [ ] Visualizzazione eventi reali da Salesforce
- [ ] Filtro date range

### 📅 STEP 3 - Multi-vista (In arrivo)
- [ ] Vista giornaliera
- [ ] Vista settimanale
- [ ] Switch tra viste

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
├── lwc/
│   └── customCalendar/             # Componente calendario principale
│       ├── customCalendar.html     # Template con griglia calendario
│       ├── customCalendar.js       # Logica calendario custom
│       ├── customCalendar.css      # Stili SLDS
│       └── customCalendar.js-meta.xml
└── applications/
    └── Calendar_Demo_App.app-meta.xml  # App Lightning di esempio
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
