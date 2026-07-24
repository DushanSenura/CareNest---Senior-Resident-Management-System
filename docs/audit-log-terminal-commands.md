# CareNest Audit Log Terminal Commands

Open **Audit logs** and select **Dev mode**. Type a command at the
`carenest:audit$` prompt and press Enter. Up and Down arrows recall command
history. Typing ordinary text performs an instant search across all log fields.

| Command | Purpose | Example |
|---|---|---|
| `help` | Show the command list in the terminal | `help` |
| `list` or `all` | Display every audit event | `list` |
| `search <text>` | Search every field | `search medication` |
| `status <value>` | Find success, warning, or failed events | `status failed` |
| `category <name>` | Find events in a category | `category Security` |
| `actor <name>` | Find activity by a person or system actor | `actor Maya Perera` |
| `ip <address>` | Find activity from an IP address | `ip 192.168.1.42` |
| `id <audit-id>` | Find one audit event by ID | `id AUD-10042` |
| `tail <number>` | Display the newest number of events | `tail 20` |
| `stats` | Show totals by result status | `stats` |
| `export` | Download visible terminal events as a `.log` file | `export` |
| `clear` | Clear the terminal output | `clear` |
| `reset` | Remove filters and restore all events | `reset` |

## Quick search

You do not need to type `search`. Start typing a resident, staff member,
resource, action, IP address, audit ID, branch, or description to filter the
terminal immediately. Press Enter to keep that search active.

## Examples

```text
status failed
category Medication
actor Maya Perera
tail 10
search password
export
reset
```

Audit events are read-only. Terminal commands only search, display, summarize,
or export records; they cannot change or delete audit history.
