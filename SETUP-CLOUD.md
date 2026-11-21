# One-time Lovable Cloud setup

The site reads and saves everything in the Lovable Cloud project from the repository
`project-migration-studio` (same account). The address and public key are in `source/cloud.json`.
They are safe to publish: they only allow what the database rules allow.

## 1. Create your staff account
Open `https://bigbusinessservice.com/#admin`, type your email and a password (8+ characters),
press **First time? Create the staff account**, confirm the email if one arrives.

## 2. Give that account the admin role
Without this step the dashboard refuses to change anything (that is the safety lock).
In Lovable: open the project, then Cloud, then Database / SQL, and run (change the email):

    insert into public.user_roles (user_id, role)
    select id, 'admin' from auth.users where email = 'YOUR-EMAIL-HERE'
    on conflict do nothing;

If you prefer, send Lovable this one message instead:
"Give the account YOUR-EMAIL-HERE the admin role in user_roles."

## 3. Sign in and copy the site into Cloud
Sign in at `/#admin`. The Overview shows **Copy my site into Cloud**. Press it once. It uploads your
photos and saves the Urus and all settings. After that every change is live on every device.

## Notes
- Listing photos are stored in the private bucket `big-autos-media-private` and shown with short-lived links.
- The logo and client-news photos are small and kept inside the record, because the database rules only let
  visitors read listing photos from storage.
- If the Cloud is ever unreachable, the site shows the last copy in `public/data/state.json`.
