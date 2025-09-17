# Bonzai Booking API – Dokumentation

## Bookings

### Hämta alla bokningar

**Method:** `GET`
**URL:** `/api/bookings`

**Beskrivning:** Returnerar alla bokningar i systemet.

---

### Hämta en specifik bokning

**Method:** `GET`
**URL:** `/api/bookings/{id}`

**Beskrivning:** Returnerar bokningen med det angivna boknings-ID\:t.

---

### Skapa en ny bokning

**Method:** `POST`
**URL:** `/api/bookings`

**Beskrivning:** Skapar en ny bokning baserat på uppgifter i request body.

**Body-exempel:**

```json
{"guestName": "nikki",
  "rooms": [
    { "type": "suite", "qty": 1 }
  ],
  "totalGuests": 1
}
```

---

### Ändra en bokning

**Method:** `PUT`
**URL:** `/api/bookings/{id}`

**Beskrivning:** Uppdaterar bokningen med det angivna ID\:t.

**Body-exempel:**

```json
{"guestName": "Nikkis ostfralla",
  "rooms": [
    { "type": "suite", "qty": 1 }
  ],
  "totalGuests": 1
}
```

---

### Ta bort en bokning

**Method:** `DELETE`
**URL:** `/api/bookings/{id}`

**Beskrivning:** Raderar en bokning med det angivna ID\:t.

---

## Databaser

### DynamoDB-tabeller som används:

* **RoomTypes**

  * Innehåller informati
