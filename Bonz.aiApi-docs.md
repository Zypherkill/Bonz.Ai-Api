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
**Response-exempel:**
```json
{
    "PK": "8d8accf8",
    "guestName": "nikki",
    "rooms": [
        {
            "type": "suite",
            "qty": 1
        }
    ],
    "totalGuests": 1,
    "totalPrice": 1500,
    "createdAt": "2025-09-17T12:28:34.204Z",
    "updatedAt": "2025-09-17T12:28:34.204Z",
    "numberOfRooms": 1,
    "status": "confirmed"
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

**Response-exempel:**

```json
{
    "totalPrice": 1000,
    "totalGuests": 1,
    "updatedAt": "2025-09-17T12:29:53.214Z",
    "guestName": "Nikkis ostfralla",
    "numberOfRooms": 1,
    "status": "confirmed",
    "rooms": [
        {
            "type": "suite",
            "qty": 1
        }
    ],
    "createdAt": "2025-09-17T12:27:53.002Z",
    "PK": "121db7be"
}
```

---

### Ta bort en bokning

**Method:** `DELETE`
**URL:** `/api/bookings/{id}`

**Beskrivning:** Raderar en bokning med det angivna ID\:t.

---

### Databaser

DynamoDB-tabeller som används:

## RoomTypes

Innehåller information om olika rumstyper som kan bokas.

Nyckel: PK (Partition Key, typ: String).

## Bookings

Innehåller alla skapade bokningar.

Nyckel: PK (Partition Key, typ: String).
