# GG LOOP Verification API Documentation
**Version**: 1.0  
**Level**: 5.0 - Verification Backbone  
**Date**: December 13, 2025

---

## Overview

The GG LOOP Verification API provides endpoints for submitting, reviewing, and managing verification proofs. This system ensures gameplay authenticity through a multi-layer verification process with fraud detection.

---

## API Endpoints

### 1. Submit Verification Proof
**POST** `/api/verification/submit-proof`

Submit a verification proof for review.

**Authentication**: Required (user session)

**Request Body**:
```json
{
  "sourceType": "match" | "stream" | "challenge",
  "sourceId": "string",
  "fileUrl": "string",
  "fileType": "string",
  "fileSizeBytes": number,
  "fileMetadata": object
}
```

**Response**:
```json
{
  "success": true,
  "proof": {
    "id": 123,
    "userId": "user-id",
    "status": "pending",
    "createdAt": "2025-12-13T12:00:00Z"
  }
}
```

---

### 2. Get Verification Queue
**GET** `/api/verification/queue`

Retrieve pending verification items.

**Authentication**: Admin only

**Query Parameters**:
- `status` (optional): Filter by status (pending, processing, completed)
- `priority` (optional): Filter by priority (1-4)
- `limit` (optional): Max items to return (default: 50)

**Response**:
```json
{
  "items": [
    {
      "id": 1,
      "itemType": "proof",
      "itemId": 123,
      "userId": "user-id",
      "status": "pending",
      "priority": 3,
      "dueBy": "2025-12-14T12:00:00Z",
      "createdAt": "2025-12-13T12:00:00Z"
    }
  ],
  "total": 10
}
```

---

### 3. Admin Review Verification Item
**POST** `/api/verification/review/:id`

Process admin review for a verification item.

**Authentication**: Admin only

**URL Parameters**:
- `id`: Verification queue item ID

**Request Body**:
```json
{
  "action": "approve" | "reject" | "flag",
  "notes": "string (optional)"
}
```

**Response**:
```json
{
  "success": true,
  "result": {
    "id": 1,
    "status": "completed",
    "reviewedBy": "admin-id",
    "reviewedAt": "2025-12-13T12:30:00Z"
  }
}
```

---

### 4. Get Verification Stats
**GET** `/api/verification/stats`

Retrieve verification system statistics.

**Authentication**: Admin only

**Response**:
```json
{
  "pending": 25,
  "approved": 150,
  "rejected": 10,
  "flagged": 5,
  "highRiskAlerts": 3
}
```

---

### 5. Bulk Action on Verification Items
**POST** `/api/verification/bulk-action`

Process multiple verification items at once.

**Authentication**: Admin only

**Request Body**:
```json
{
  "itemIds": [1, 2, 3],
  "action": "approve" | "reject"
}
```

**Response**:
```json
{
  "results": [
    { "itemId": 1, "success": true, "result": {...} },
    { "itemId": 2, "success": true, "result": {...} },
    { "itemId": 3, "success": false, "error": "Item not found" }
  ],
  "total": 3
}
```

---

### 6. Get Fraud Alerts
**GET** `/api/verification/fraud-alerts`

Retrieve active fraud detection alerts.

**Authentication**: Admin only

**Query Parameters**:
- `severity` (optional): Filter by severity (low, medium, high, critical)
- `limit` (optional): Max alerts to return (default: 50)

**Response**:
```json
{
  "alerts": [
    {
      "id": 1,
      "userId": "user-id",
      "detectionType": "rapid_submission",
      "riskScore": 85,
      "severity": "high",
      "status": "pending",
      "createdAt": "2025-12-13T12:00:00Z"
    }
  ],
  "total": 5
}
```

---

## Fraud Scoring Matrix

### Risk Score Ranges
- **0-30**: Low Risk (Green) - Normal user behavior
- **31-50**: Medium Risk (Yellow) - Slightly suspicious, monitor
- **51-70**: High Risk (Orange) - Requires review
- **71-100**: Critical Risk (Red) - Immediate admin attention

### Detection Types
1. **rapid_submission**: Too many proofs submitted in short time
2. **duplicate_file**: Same file submitted multiple times
3. **suspicious_metadata**: File metadata indicates tampering
4. **ip_mismatch**: IP address doesn't match user's typical location
5. **device_mismatch**: Device fingerprint doesn't match user's history
6. **behavioral_anomaly**: User behavior deviates from normal patterns

### Severity Levels
- **Low**: Risk score 0-30, informational only
- **Medium**: Risk score 31-50, flagged for review
- **High**: Risk score 51-70, requires admin action
- **Critical**: Risk score 71-100, immediate investigation

---

## Admin Usage Guide

### Dashboard Access
Navigate to `/admin/verification/dashboard` to view:
- Pending review count
- Approved/rejected/flagged totals
- High-risk fraud alerts
- Quick action links

### Reviewing Proofs
1. Go to `/admin/verification/review`
2. Select item from queue (sorted by priority)
3. Review proof details and metadata
4. Add notes (optional)
5. Choose action: Approve, Reject, or Flag

### Handling Fraud Alerts
1. Check FraudAlertBanner for high-risk alerts
2. Navigate to `/admin/verification/fraud-alerts`
3. Review detection type and risk score
4. Investigate user history
5. Take appropriate action (ban, flag, or clear)

### Bulk Actions
For processing multiple items:
1. Select items from queue
2. Use bulk action endpoint
3. All items processed with same action
4. Review results for any failures

---

## Sample Proof Payloads

### Match Proof
```json
{
  "sourceType": "match",
  "sourceId": "NA1_4567890123",
  "fileUrl": "https://storage.ggloop.io/proofs/match-screenshot.png",
  "fileType": "image/png",
  "fileSizeBytes": 245678,
  "fileMetadata": {
    "matchId": "NA1_4567890123",
    "champion": "Jinx",
    "result": "win",
    "duration": 1823,
    "timestamp": "2025-12-13T12:00:00Z"
  }
}
```

### Stream Proof
```json
{
  "sourceType": "stream",
  "sourceId": "stream-session-123",
  "fileUrl": "https://storage.ggloop.io/proofs/stream-clip.mp4",
  "fileType": "video/mp4",
  "fileSizeBytes": 5242880,
  "fileMetadata": {
    "sessionId": "stream-session-123",
    "duration": 120,
    "platform": "twitch",
    "timestamp": "2025-12-13T12:00:00Z"
  }
}
```

### Challenge Proof
```json
{
  "sourceType": "challenge",
  "sourceId": "challenge-456",
  "fileUrl": "https://storage.ggloop.io/proofs/challenge-data.json",
  "fileType": "application/json",
  "fileSizeBytes": 1024,
  "fileMetadata": {
    "challengeId": "challenge-456",
    "completed": true,
    "score": 95,
    "timestamp": "2025-12-13T12:00:00Z"
  }
}
```

---

## Error Codes

| Code | Message | Description |
|------|---------|-------------|
| 400 | Bad Request | Invalid request body or parameters |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Insufficient permissions (admin required) |
| 404 | Not Found | Verification item not found |
| 500 | Internal Server Error | Server-side error occurred |

---

## Rate Limits

- **User endpoints**: 100 requests per hour
- **Admin endpoints**: 1000 requests per hour
- **Bulk actions**: 10 requests per minute

---

## Next Steps

**Level 6**: Desktop Validator Integration
- Desktop app for real-time verification
- Session validation hooks
- Enhanced fraud detection with device fingerprinting

---

*For technical support, contact the GG LOOP development team.*
