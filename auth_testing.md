# Auth-Gated App Testing Playbook for Allô Québec

## Step 1: Create Test User & Session
```
mongosh --eval "
use('test_database');
var userId = 'test-user-' + Date.now();
var sessionToken = 'test_session_' + Date.now();
db.users.insertOne({
  user_id: userId,
  email: 'test.user.' + Date.now() + '@example.com',
  name: 'Marc Tremblay',
  picture: 'https://via.placeholder.com/150',
  created_at: new Date()
});
db.user_sessions.insertOne({
  user_id: userId,
  session_token: sessionToken,
  expires_at: new Date(Date.now() + 7*24*60*60*1000),
  created_at: new Date()
});
print('Session token: ' + sessionToken);
print('User ID: ' + userId);
"
```

## Step 2: Test Backend
```
curl -X GET "$REACT_APP_BACKEND_URL/api/auth/me" \
  -H "Authorization: Bearer $SESSION_TOKEN"

curl -X GET "$REACT_APP_BACKEND_URL/api/guides"
curl -X GET "$REACT_APP_BACKEND_URL/api/reminders" -H "Authorization: Bearer $SESSION_TOKEN"
curl -X POST "$REACT_APP_BACKEND_URL/api/chat" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SESSION_TOKEN" \
  -d '{"message":"Comment renouveler ma carte soleil?"}'
```

## Step 3: Browser
```
await page.context.add_cookies([{
    "name": "session_token",
    "value": "YOUR_SESSION_TOKEN",
    "domain": "your-app.com",
    "path": "/",
    "httpOnly": True,
    "secure": True,
    "sameSite": "None"
}]);
```

## Key endpoints
- POST /api/auth/session (exchange session_id)
- GET /api/auth/me
- POST /api/auth/logout
- POST /api/chat
- GET /api/chat/sessions
- GET /api/chat/sessions/{id}/messages
- GET/POST /api/reminders, DELETE /api/reminders/{id}
- GET /api/guides, GET /api/guides/{slug}
