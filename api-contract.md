# 🚗 DriveIT API — Contract

> **Version:** 1.2.0  
> **Base URL:** `http://localhost:8080/api/v1`  
> **Authentication:** JWT Bearer Token (`Authorization: Bearer <token>`)  
> **Format:** JSON  

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Brands](#2-brands)
3. [Cars](#3-cars)
4. [Comparator](#4-comparator)
5. [Reviews](#5-reviews)
6. [Likes](#6-likes)
7. [Publishers](#7-publishers)
8. [Users](#8-users)
9. [Admin](#9-admin)
10. [Data Models](#10-data-models)
11. [Error Codes](#11-error-codes)

---

## Roles & Permissions

| Action                            | `USER` | `PUBLISHER` | `ADMIN` |
|-----------------------------------|:------:|:-----------:|:-------:|
| Browse cars and specs             | ✅     | ✅          | ✅      |
| Compare cars                      | ✅     | ✅          | ✅      |
| Read reviews                      | ✅     | ✅          | ✅      |
| View publisher public profile     | ✅     | ✅          | ✅      |
| Like a review                     | ✅     | ❌          | ❌      |
| Publish reviews                   | ❌     | ✅          | ❌      |
| Edit / delete own reviews         | ❌     | ✅          | ✅      |
| Manage cars (CRUD)                | ❌     | ❌          | ✅      |
| Assign rank to a publisher        | ❌     | ❌          | ✅      |
| Delete any review                 | ❌     | ❌          | ✅      |

> **Note:** A `PUBLISHER` cannot like their own reviews. `PUBLISHER` and `ADMIN` roles cannot like any review.

---

## 1. Authentication

### POST `/auth/register`
Registers a new user. Default role is `USER`.

**Request:**
```json
{
  "username": "juangarcia",
  "email": "juan@email.com",
  "password": "Password123!"
}
```

**Response `201 Created`:**
```json
{
  "id": 1,
  "username": "juangarcia",
  "email": "juan@email.com",
  "role": "USER",
  "createdAt": "2025-06-05T10:00:00Z"
}
```

---

### POST `/auth/login`
Returns a JWT access token.

**Request:**
```json
{
  "email": "juan@email.com",
  "password": "Password123!"
}
```

**Response `200 OK`:**
```json
{
  "accessToken": "eyJhbGci...",
  "tokenType": "Bearer",
  "expiresIn": 86400
}
```

---

## 2. Brands

### GET `/brands`
Returns all available car brands.

**Response `200 OK`:**
```json
[
  { "id": 1, "name": "Toyota", "country": "Japan",  "logoUrl": "https://..." },
  { "id": 2, "name": "Seat",   "country": "Spain",  "logoUrl": "https://..." }
]
```

---

### GET `/brands/{id}/models`
Returns all models for a given brand.

**Response `200 OK`:**
```json
[
  { "id": 10, "name": "Corolla", "brandId": 1, "years": [2020, 2021, 2022, 2023] },
  { "id": 11, "name": "Yaris",   "brandId": 1, "years": [2019, 2020, 2021, 2022, 2023] }
]
```

---

## 3. Cars

### GET `/cars`
Returns a paginated, filtered list of cars.

**Query params:**

| Parameter  | Type    | Description                                              | Example     |
|------------|---------|----------------------------------------------------------|-------------|
| `brand`    | string  | Brand name                                               | `Toyota`    |
| `model`    | string  | Model name                                               | `Corolla`   |
| `year`     | integer | Manufacturing year                                       | `2023`      |
| `fuelType` | string  | `GASOLINE`, `DIESEL`, `ELECTRIC`, `HYBRID`, `PLUG_IN_HYBRID` | `ELECTRIC` |
| `minPrice` | decimal | Minimum price (€)                                        | `15000`     |
| `maxPrice` | decimal | Maximum price (€)                                        | `40000`     |
| `page`     | integer | Page number (0-indexed)                                  | `0`         |
| `size`     | integer | Items per page (max 50)                                  | `12`        |
| `sort`     | string  | Sort field and direction                                 | `price,asc` |

**Response `200 OK`:**
```json
{
  "content": [
    {
      "id": 42,
      "brand": "Toyota",
      "model": "Corolla",
      "version": "1.8 Hybrid Active Tech",
      "year": 2023,
      "price": 27500.00,
      "fuelType": "HYBRID",
      "horsepower": 122,
      "transmission": "AUTOMATIC",
      "imageUrl": "https://...",
      "averageRating": 4.3,
      "reviewCount": 17
    }
  ],
  "totalElements": 124,
  "totalPages": 11,
  "currentPage": 0,
  "pageSize": 12
}
```

---

### GET `/cars/{id}`
Returns the full technical spec sheet for a car.

**Response `200 OK`:**
```json
{
  "id": 42,
  "brand": "Toyota",
  "model": "Corolla",
  "version": "1.8 Hybrid Active Tech",
  "year": 2023,
  "price": 27500.00,
  "specs": {
    "engine": {
      "displacement": 1798,
      "horsepower": 122,
      "torque": 142,
      "fuelType": "HYBRID",
      "cylinders": 4,
      "consumption": 4.5,
      "emissions": 103
    },
    "dimensions": {
      "length": 4370,
      "width": 1780,
      "height": 1435,
      "wheelbase": 2640,
      "trunkCapacity": 361
    },
    "performance": {
      "acceleration0To100": 10.9,
      "topSpeed": 180
    },
    "transmission": "AUTOMATIC",
    "drivetrain": "FWD",
    "doors": 4,
    "seats": 5
  },
  "images": ["https://...", "https://..."],
  "averageRating": 4.3,
  "reviewCount": 17
}
```

---

### POST `/cars` 🔒 `ADMIN`
Creates a new car entry.

**Request:** *(same schema as `GET /cars/{id}` response, omitting `id`, `averageRating`, and `reviewCount`)*

**Response `201 Created`:** created car object.

---

### PUT `/cars/{id}` 🔒 `ADMIN`
Updates an existing car entry.

**Response `200 OK`:** updated car object.

---

### DELETE `/cars/{id}` 🔒 `ADMIN`

**Response `204 No Content`**

---

## 4. Comparator

### GET `/cars/compare`
Compares 2 to 4 cars side by side.

**Query params:**

| Parameter | Type   | Description                       |
|-----------|--------|-----------------------------------|
| `ids`     | string | Comma-separated car IDs (2–4)     |

**Example:** `GET /cars/compare?ids=42,55,78`

**Response `200 OK`:**
```json
{
  "cars": [
    {
      "id": 42,
      "brand": "Toyota",
      "model": "Corolla",
      "version": "1.8 Hybrid",
      "year": 2023,
      "price": 27500.00,
      "specs": { "...": "..." }
    },
    {
      "id": 55,
      "brand": "Seat",
      "model": "León",
      "version": "1.5 TSI FR",
      "year": 2023,
      "price": 29900.00,
      "specs": { "...": "..." }
    }
  ],
  "highlights": {
    "cheapest": 42,
    "mostPowerful": 55,
    "mostEfficient": 42
  }
}
```

---

## 5. Reviews

### GET `/cars/{carId}/reviews`
Returns paginated reviews for a car.

**Query params:** `page`, `size`, `sort` (default: `createdAt,desc`)

**Response `200 OK`:**
```json
{
  "content": [
    {
      "id": 101,
      "carId": 42,
      "publisher": {
        "id": 7,
        "username": "motorexperto",
        "rank": "GOLD",
        "totalLikes": 348
      },
      "rating": 5,
      "title": "Excellent hybrid for city driving",
      "body": "I have had it for 6 months and the fuel efficiency is incredible...",
      "pros": ["Low consumption", "Comfortable", "Reliable"],
      "cons": ["Boot a bit small", "High price"],
      "likeCount": 24,
      "likedByMe": false,
      "createdAt": "2025-03-12T09:30:00Z",
      "updatedAt": "2025-03-12T09:30:00Z"
    }
  ],
  "totalElements": 17,
  "totalPages": 2,
  "currentPage": 0,
  "averageRating": 4.3,
  "ratingDistribution": {
    "5": 8, "4": 6, "3": 2, "2": 1, "1": 0
  }
}
```

> `likedByMe` defaults to `false` for unauthenticated requests. A valid JWT is required to return the real value.

---

### POST `/cars/{carId}/reviews` 🔒 `PUBLISHER`
Publishes a review. A publisher may only submit one review per car.

**Request:**
```json
{
  "rating": 5,
  "title": "Excellent hybrid for city driving",
  "body": "I have had it for 6 months and the fuel efficiency is incredible...",
  "pros": ["Low consumption", "Comfortable"],
  "cons": ["Boot a bit small"]
}
```

**Response `201 Created`:** created review object.

---

### PUT `/reviews/{id}` 🔒 `PUBLISHER` (own reviews only)
Edits an existing review.

**Response `200 OK`:** updated review object.

---

### DELETE `/reviews/{id}` 🔒 `PUBLISHER` (author) or `ADMIN`

**Response `204 No Content`**

---

## 6. Likes

### POST `/reviews/{reviewId}/like` 🔒 `USER`
Likes a review. A `USER` may only like each review once.

- Not allowed if the authenticated user is the review author.
- Not allowed for `PUBLISHER` or `ADMIN` roles.

**Response `200 OK`:**
```json
{
  "reviewId": 101,
  "likeCount": 25,
  "likedByMe": true
}
```

**`409 Conflict`:** if the user has already liked this review.

---

### DELETE `/reviews/{reviewId}/like` 🔒 `USER`
Removes a like from a review.

**Response `200 OK`:**
```json
{
  "reviewId": 101,
  "likeCount": 24,
  "likedByMe": false
}
```

**`404 Not Found`:** if the user had not liked this review.

---

## 7. Publishers

### GET `/publishers`
Returns publishers sorted by reputation (total likes descending).

**Query params:** `page`, `size`, `rank` (optional filter by rank)

**Response `200 OK`:**
```json
{
  "content": [
    {
      "id": 7,
      "username": "motorexperto",
      "rank": "GOLD",
      "totalLikes": 348,
      "reviewCount": 42,
      "createdAt": "2024-01-10T00:00:00Z"
    }
  ],
  "totalElements": 30,
  "totalPages": 3,
  "currentPage": 0
}
```

---

### GET `/publishers/{id}`
Returns the public profile and stats of a publisher.

**Response `200 OK`:**
```json
{
  "id": 7,
  "username": "motorexperto",
  "rank": "GOLD",
  "totalLikes": 348,
  "reviewCount": 42,
  "createdAt": "2024-01-10T00:00:00Z"
}
```

---

### GET `/publishers/{id}/reviews`
Returns paginated reviews written by a publisher.

**Query params:** `page`, `size`, `sort` (default: `createdAt,desc`)

**Response:** paginated, same schema as `GET /cars/{carId}/reviews`.

---

## 8. Users

### GET `/users/me` 🔒 `USER | PUBLISHER`
Returns the authenticated user's profile.

**Response `200 OK` (role `USER`):**
```json
{
  "id": 1,
  "username": "juangarcia",
  "email": "juan@email.com",
  "role": "USER",
  "totalLikesGiven": 12,
  "createdAt": "2025-01-15T08:00:00Z"
}
```

**Response `200 OK` (role `PUBLISHER`):**
```json
{
  "id": 7,
  "username": "motorexperto",
  "email": "motor@email.com",
  "role": "PUBLISHER",
  "rank": "GOLD",
  "totalLikes": 348,
  "reviewCount": 42,
  "createdAt": "2024-01-10T00:00:00Z"
}
```

---

### GET `/users/me/reviews` 🔒 `PUBLISHER`
Returns the authenticated publisher's own reviews, paginated.

**Response:** paginated, same schema as `GET /cars/{carId}/reviews`.

---

### PUT `/users/me` 🔒 `USER | PUBLISHER`
Updates the authenticated user's profile (username, email, or password).

**Request:**
```json
{
  "username": "newusername",
  "email": "new@email.com",
  "password": "NewPassword123!"
}
```

**Response `200 OK`:** updated profile object.

---

## 9. Admin

### PATCH `/admin/users/{id}/role` 🔒 `ADMIN`
Changes a user's role (`USER` ↔ `PUBLISHER`).

**Request:**
```json
{
  "role": "PUBLISHER"
}
```

**Response `200 OK`:** updated profile with new role.

---

### PATCH `/admin/publishers/{id}/rank` 🔒 `ADMIN`
Manually assigns or updates a publisher's rank.

**Request:**
```json
{
  "rank": "GOLD"
}
```

**Response `200 OK`:**
```json
{
  "id": 7,
  "username": "motorexperto",
  "rank": "GOLD",
  "totalLikes": 348
}
```

---

### GET `/admin/users` 🔒 `ADMIN`
Returns a paginated list of all users with optional filters.

**Query params:** `page`, `size`, `role`, `search` (username or email)

**Response:** paginated list with `id`, `username`, `email`, `role`, `rank` (if applicable), `createdAt`.

---

## 10. Data Models

### Enums

```
FuelType:      GASOLINE | DIESEL | ELECTRIC | HYBRID | PLUG_IN_HYBRID
Transmission:  MANUAL | AUTOMATIC | SEMI_AUTOMATIC
Drivetrain:    FWD | RWD | AWD | 4WD
Role:          USER | PUBLISHER | ADMIN
PublisherRank: BRONZE | SILVER | GOLD | PLATINUM
```

### Publisher Ranks

| Rank       | Description                                              |
|------------|----------------------------------------------------------|
| `BRONZE`   | Default rank assigned when a user becomes a publisher    |
| `SILVER`   | Manually assigned by an admin                            |
| `GOLD`     | Manually assigned by an admin                            |
| `PLATINUM` | Manually assigned by an admin (highest rank)             |

> In future versions, ranks may be awarded automatically upon reaching like milestones.

### Business Rules

- Default role on registration is `USER`.
- Only `ADMIN` can promote a `USER` to `PUBLISHER` or revert them.
- Only `ADMIN` can assign ranks to publishers.
- A newly promoted `PUBLISHER` starts at rank `BRONZE`.
- A `PUBLISHER` may only submit **one review per car**.
- Only the review author (`PUBLISHER`) or an `ADMIN` can edit or delete a review.
- A `USER` may only give **one like per review**.
- `PUBLISHER` and `ADMIN` roles **cannot** like any review.
- `likeCount` and `totalLikes` are updated automatically when a like is added or removed.
- A car's `averageRating` is recalculated automatically when a review is created, edited, or deleted.
- All endpoints marked with 🔒 require a valid JWT token.

---

## 11. Error Codes

All errors return the following schema:

```json
{
  "timestamp": "2025-06-05T10:00:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Field 'rating' must be between 1 and 5",
  "path": "/api/v1/cars/42/reviews"
}
```

| Code  | Meaning                                                                        |
|-------|--------------------------------------------------------------------------------|
| `400` | Validation failed or invalid parameters                                        |
| `401` | Unauthenticated — token missing or expired                                     |
| `403` | Forbidden — insufficient role permissions                                      |
| `404` | Resource not found                                                             |
| `409` | Conflict — e.g. duplicate like, duplicate review for the same car              |
| `500` | Internal server error                                                          |

---

*Version 1.2.0 — Subject to change during development.*