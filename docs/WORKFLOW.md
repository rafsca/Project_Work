# API da realizzare

## API di autenticazione - Francesco

- POST /api/auth/register: Permette agli utenti generici di registrarsi fornendo le informazioni necessarie come nome, email e password. ✅

- POST /api/auth/admin/register: Permette agli utenti admin di registrarsi fornendo le informazioni necessarie come nome, email e password. ✅

  Implementare un controllo dell’email a fronte di una whitelist di indirizzi email abilitabili all’accesso come Admin. ✅

- POST /api/auth/login: Consente agli utenti di effettuare l'accesso utilizzando le proprie credenziali. ✅

- GET /api/auth/logout: Permette agli utenti di disconnettersi. ✅

- GET /api/auth/user: Restituisce le informazioni dell'utente attualmente autenticato (generico o Admin). ✅

### Fix auth

- Clean code ⚠️
- Gestione errori ⚠️
- Controller user ✅ controller token ⚠️

## API per la gestione dei prodotti - Peppe

- GET /api/products : Restituisce l'elenco completo dei prodotti disponibili nel catalogo. ✅

- Opzionale: implementare un sistema di paginazione per migliorare le performance dell’API ⚠️

- GET /api/products/:id: Restituisce i dettagli di un singolo prodotto (identificato dal suo ID). ✅

- POST /api/products: Permette agli utenti Admin di aggiungere un nuovo prodotto al catalogo. ✅

- PUT /api/products/:id: Consente agli utenti Admin di modificare le informazioni di un prodotto esistente. ✅

- DELETE /api/products/:id: Permette agli utenti Admin di eliminare un prodotto dal catalogo. ✅

### Fix products

- Clean code ⚠️
- Gestione errori ⚠️
- Controller products ⚠️

## API per la gestione del carrello - Raffaele

- GET /api/cart: Restituisce il contenuto attuale del carrello dell'utente. ✅

- POST /api/cart/add/:id: Aggiunge un prodotto al carrello dell'utente. ✅

- DELETE /api/cart/remove/:id: Rimuove un prodotto dal carrello dell'utente. ✅

- DELETE /api/cart/clear: Svuota il carrello dell'utente. ✅

### Fix cart

- Clean code ⚠️
- Gestione errori ⚠️

## API degli Ordini - Giuseppe attore

- GET /api/orders: Restituisce lo storico degli ordini dell'utente. ⚠️

- Opzionale: implementare un sistema di paginazione per migliorare le performance dell’API ⚠️

- POST /api/orders: Permette agli utenti di creare un nuovo ordine a partire dai prodotti presenti attualmente nel carrello, con l’aggiunta dei dati di spedizione necessari ⚠️
  -- Nome
  -- Cognome
  -- Indirizzo
  -- Cap
  -- Città
  -- Regione
  -- Stato

- GET /api/orders/:id: Restituisce i dettagli di un singolo ordine identificato dal suo ID. ⚠️

- PUT /api/orders/:id: Consente agli amministratori di aggiornare lo stato di un ordine esistente. ⚠️

- DELETE /api/orders/:id: Permette agli amministratori di cancellare un ordine. Suggerimento: modificare lo stato dell’ordine ⚠️

### Fix order

- Code refactoring ⚠️
- Clean code ⚠️
- Gestione errori ⚠️
- Order controller ⚠️
