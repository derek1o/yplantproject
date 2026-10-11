# Y Plant Affricanaidd CIC - Interest Collection

A simple, public interest-collection site for the Digital Empowerment
Programme, a FREE creative digital programme for young people aged 12-18
in Newport & Aberdare, funded by BBC Children in Need.

**No accounts. No passwords. Just interests.**

## Stack

- Django 5
- SQLite (dev) / PostgreSQL (prod) via `dj-database-url`
- WhiteNoise for static files
- Vanilla JavaScript (no build step)

## Local Setup

```bash
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env             # then edit SECRET_KEY
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Visit http://127.0.0.1:8000

## Key Endpoints

| URL | Purpose |
| --- | --- |
| `/` | Home page |
| `/interest/` | Interest form |
| `/interest/ajax/` | JSON endpoint for the JS layer |
| `/interest/success/` | Thank-you page |
| `/admin/` | View submissions |

## How It Works

1. A young person (or parent) visits the site
2. Ticks the interests that appeal to them
3. Optionally leaves a name and email
4. Submits - done

The CIC receives an email notification with each submission, and can
view the full list in the admin panel.

## Deployment Notes

Before deploying:
- Set `DEBUG=False`
- Set a real `SECRET_KEY`
- Configure `ALLOWED_HOSTS`
- Set `DATABASE_URL` to a Postgres connection string
- Configure SMTP credentials for real emails
- Run `python manage.py collectstatic`

