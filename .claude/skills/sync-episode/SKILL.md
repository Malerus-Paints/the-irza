---
description: Sync an episode script's photos and revelations to the IRZA Supabase database
---

Sync the irza-studio episode identified by the tracker ID in $ARGUMENTS to the IRZA Supabase database.

Run the following command:

```!
cd "C:\Users\sir_d\OneDrive\Documents\irza-studio" && npm run sync-episode -- $ARGUMENTS
```

After the command completes, summarize concisely:
- Episode ID and title
- Photo path logged (or none)
- Each revelation: field name, value shown, state (REVEALED / PENDING REVIEW / ENCRYPTED / REDACTED)
- Whether this was a dry run or a live write

If the episode row didn't exist in the DB and was created, mention that and remind the user to link the exhibit_id from the IRZA app.

If there are errors, explain what went wrong and the likely fix.
