# Inbox Workflow

## Scope and access

Inbox conversations belong to a company and optional branch. A user can only list or open conversations in the same tenant scope where they are a participant. Direct conversations use a canonical participant key to prevent duplicate threads.

Group participants have one of these roles: `owner`, `admin`, or `member`. Owners, group admins, users with `manage inbox`, and application admins may rename groups or manage participants.

## Listing and search

Conversation lists use server-side search, type/unread/archive filters, and pagination. Message search queries the full conversation instead of only messages loaded in the browser. Message history and shared attachments are paginated independently.

## Messages and read state

Message sending is optimistic in React and failed sends expose a retry action. Opening a conversation records unread messages with a bulk insert and updates the participant's latest read message. Users can mark a conversation unread.

Message edit and delete windows are configured in `config/chat.php`. Inbox managers and administrators may moderate messages outside those windows. Deletes remain soft deletes and sensitive mutations are recorded in `chat_activity_logs`.

## Realtime and presence

The Inbox subscribes once to the user's inbox channel and once to the selected conversation. Company presence channels provide online state, while `last_seen_at` remains the fallback. The UI exposes connected, connecting, and offline states.

## Attachments

New attachments use the private `local` disk under a company/conversation/message hierarchy. Images, PDF, Word, and Excel files are supported. React receives only authorized view/download routes; storage paths are never exposed.

Legacy attachments that still have `disk = public` remain accessible through authorized routes, but their old physical public copies should be relocated in a dedicated maintenance step.

## Participant preferences

Each participant can privately archive, pin, mute, and save a draft for a conversation. These preferences do not affect other participants.
