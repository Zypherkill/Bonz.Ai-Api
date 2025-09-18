# Bonzai Booking API – Dokumentation

## Bookings
** Länk ---> https://4rwf69xlx2.execute-api.eu-north-1.amazonaws.com/api/bookings **

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
{"guestName": "Nikki Fransman",
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
    "guestName": "Nikki Fransman",
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
{"guestName": "Nikki Fransman",
  "rooms": [
    { "type": "suite", "qty": 1 }
  ],
  "totalGuests": 1
}
```

**Response-exempel:**

```json
{
    "PK": "e72507b9",
    "guestName": "Nikki Fransman",
    "rooms": [
        {
            "type": "suite",
            "qty": 2
        }
    ],
    "totalGuests": 1,
    "totalPrice": 1500,
    "createdAt": "2025-09-17T12:52:52.531Z",
    "updatedAt": "2025-09-17T12:54:06.443Z",
    "numberOfRooms": 2,
    "status": "confirmed"
}
```

---

### Ta bort en bokning

**Method:** `DELETE`
**URL:** `/api/bookings/{id}`

**Beskrivning:** Raderar en bokning med det angivna ID\:t.

---

## Databaser

DynamoDB-tabeller som används:

### RoomTypes

Innehåller information om olika rumstyper som kan bokas.

### Bookings

Innehåller alla skapade bokningar.
