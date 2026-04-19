# Lead Dashboard Project

A lightweight dashboard project that reads lead data from JSON and shows:

- KPI cards
- graphs (status + source + monthly pipeline value)
- leads table

## Project Structure

```text
lead-dashboard-project/
  index.html
  styles.css
  app.js
  data/
    leads.json
```

## Run

You can open `index.html` directly, but for JSON loading it is recommended to run a local server:

```bash
cd lead-dashboard-project
python3 -m http.server 8000
```

Then open: `http://localhost:8000`

## JSON Format

`data/leads.json` can be either:

```json
{ "leads": [ ... ] }
```

or directly:

```json
[ ... ]
```

Each lead item example:

```json
{
  "id": 1,
  "name": "Acme Corp",
  "owner": "Rajesh",
  "source": "Website",
  "status": "New",
  "value": 12000,
  "createdAt": "2026-04-01"
}
```
