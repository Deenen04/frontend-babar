# Dashboard API Requirements

## Current Implementation
The dashboard currently uses existing APIs from `api.json`:
- `GET /api/calls` - For total calling minutes and live calls
- `GET /api/appointments` - For appointments booked by AI
- `GET /api/reminders` - For reminders list

## Recommended Dashboard-Specific APIs

### 1. Dashboard Summary API
**Endpoint:** `GET /api/dashboard/summary`

**Purpose:** Get aggregated dashboard metrics in a single request for better performance.

**Response:**
```json
{
  "total_calling_minutes": 1250,
  "appointments_booked_by_ai": 45,
  "active_reminders_count": 12,
  "live_calls_count": 3,
  "last_updated": "2024-01-15T10:30:00Z"
}
```

### 2. Dashboard Live Data API
**Endpoint:** `GET /api/dashboard/live-data`

**Purpose:** Get real-time dashboard data including live calls and recent reminders.

**Query Parameters:**
- `limit` (optional): Number of items to return for each section (default: 10)

**Response:**
```json
{
  "live_calls": [
    {
      "id": "uuid",
      "patient_id": "uuid",
      "phone_number": "string",
      "call_type": "incoming|outgoing",
      "transcript": "string",
      "start_time": "timestamp"
    }
  ],
  "recent_reminders": [
    {
      "id": "uuid",
      "title": "string",
      "priority": "high|medium|low",
      "reminder_type": "prescription|callback|followup",
      "patient_phone": "string",
      "due_date": "date"
    }
  ],
  "appointments_today": [
    {
      "id": "uuid",
      "patient_phone": "string",
      "appointment_date": "date",
      "start_time": "time",
      "status": "string"
    }
  ]
}
```

### 3. Dashboard Analytics API
**Endpoint:** `GET /api/dashboard/analytics`

**Purpose:** Get dashboard analytics data for charts and trends.

**Query Parameters:**
- `period`: "day|week|month|year" (default: "month")
- `start_date`: Start date for analytics (optional)
- `end_date`: End date for analytics (optional)

**Response:**
```json
{
  "calling_minutes_trend": [
    {"date": "2024-01-01", "minutes": 120},
    {"date": "2024-01-02", "minutes": 95}
  ],
  "appointments_trend": [
    {"date": "2024-01-01", "count": 5},
    {"date": "2024-01-02", "count": 8}
  ],
  "reminders_by_priority": {
    "high": 3,
    "medium": 12,
    "low": 25
  },
  "call_outcomes": {
    "successful": 85,
    "failed": 15,
    "pending": 5
  }
}
```

## Benefits of Dedicated Dashboard APIs

1. **Performance:** Single API call instead of multiple parallel requests
2. **Consistency:** Centralized data aggregation logic
3. **Caching:** Easier to implement caching at the API level
4. **Real-time Updates:** Can implement WebSocket or Server-Sent Events for live data
5. **Analytics:** Built-in analytics calculations and trends

## Implementation Priority

1. **High Priority:** `/api/dashboard/summary` - Immediate performance improvement
2. **Medium Priority:** `/api/dashboard/live-data` - Better UX for real-time features
3. **Low Priority:** `/api/dashboard/analytics` - For future dashboard enhancements
