# Chat realtime

Chat uses pusher-js with Laravel Reverb and Sanctum-authenticated private channels.
The API remains the source of truth: socket events invalidate React Query data.
A shared provider keeps subscriptions active across authenticated pages. Leaving the
authenticated layout disconnects them. Reconnection refreshes chat queries.

Online status uses the existing users.online presence channel, shared with the
legacy Laravel frontend. Initial membership and join/leave events update contacts
and conversation status. Multiple tabs count as one member; offline is shown only
when membership is known. When disconnected, status is unavailable until resynced.

Configure frontend public variables before starting Next.js or building for deployment:

- NEXT_PUBLIC_REVERB_APP_KEY: backend REVERB_APP_KEY (public key)
- NEXT_PUBLIC_REVERB_HOST: hostname reachable from the browser
- NEXT_PUBLIC_REVERB_PORT: WebSocket port (8080 locally, usually 443 behind HTTPS)
- NEXT_PUBLIC_REVERB_SCHEME: http locally, https for TLS

Never expose REVERB_APP_SECRET in frontend variables.

Local services:
- Laravel API: php artisan serve --host=127.0.0.1 --port=8000
- Reverb: php artisan reverb:start --host=127.0.0.1 --port=8080
- Next: npm run dev

The API endpoint POST /api/v1/broadcasting/auth uses the existing Bearer token.
Channel chat.{userId} only allows its owner. MessageSent and MessagesRead broadcast
immediately; these events do not require a queue worker.

While subscribed, queries reconcile every 30 seconds. If disconnected, unauthorized
or unconfigured, polling remains active every 3 seconds for the conversation and
5 seconds for contacts. Successful subscriptions refresh data to catch missed events.

To manually test: sign in as different users in separate browser profiles, open chat,
send messages both ways, then check unread counts and read receipts. For deployment,
use a supervised Reverb process and a WebSocket-capable TLS proxy; localhost settings
are only suitable for local testing.

Verification: Laravel ChatRealtimeTest covers authentication, channel ownership,
message broadcast targeting, and read receipts emitted only for newly read messages.
Browser verification used a real local Reverb connection with isolated HTTP fixtures.
