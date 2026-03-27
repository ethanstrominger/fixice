# FixICE Donation Site

This project is a web application for North Shore LUCE fundraising and protest information. It allows users to:
- View protest and parking info
- Enter a donation amount and frequency
- Redirect to Givebutter with prefilled donation info
- Log donation intent to a PostgreSQL database (for admin tracking)

## Features
- Mobile-friendly, accessible HTML/CSS
- Collapsible info sections for easy navigation
- Donation form with amount and frequency (one-time, monthly, quarterly)
- Backend API for logging donations to PostgreSQL

## Local Development


### Prerequisites
- Node.js (v16+ recommended)
- npm
- PostgreSQL

### Identifying Your PostgreSQL User and Password
By default, PostgreSQL is installed with a user named `postgres` and the password `postgres` (user: `postgres`, password: `postgres`).

If you did not set a custom user or password during installation, try using these defaults. If you set a different user or password, use those values instead.

To check your PostgreSQL users, you can run:
```sh
psql -U postgres -c "\du"
```
If you need to reset the password for the `postgres` user, you can do so with:
```sh
psql -U postgres -c "ALTER USER postgres PASSWORD '<password>';"
```
Replace `postgres` with your desired password if needed.

### Setup
1. Clone this repository:
   ```sh
   git clone https://github.com/yourusername/fixice.git
   cd fixice
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Create a PostgreSQL user and database:
   
   If you do not already have a `postgres` user (the default superuser), create one:
   ```sh
   createuser -s postgres
   ```
   
   Then create the database:
   ```sh
   createdb fixice
   ```
   
   If you want to use a different username or password, update the `DATABASE_URL` in your `.env` file accordingly.

4. Start the server:
   ```sh
   node server.js
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment on Render.com
1. Push your code to GitHub.
2. On Render.com:
   - Create a new **Web Service** from your repo.
   - Use <a href="https://aiven.io/">Aiven</a> to provision a **PostgreSQL** database (instead of Render's managed database).
   - In Aiven, create a PostgreSQL service and note the connection details (host, port, database, user, password).
   - Set the `DATABASE_URL` environment variable in your Render service to the value provided by Aiven (format: `postgres://user:password@host:port/database`).
   - Deploy. The donations table will be created automatically.
   - For security, ensure your Aiven PostgreSQL allows connections from Render's IP addresses.

## API
### POST /api/log-donation
Logs a donation intent to the database.
- **Body:** `{ amount: number, frequency: string }`
- **Returns:** `{ success: true }` or `{ error: ... }`

## File Structure
- `dist/` – Static site files (HTML, CSS, JS)
- `server.js` – Express backend for API and static file serving
- `README.md` – This file

## Notes
- The backend auto-creates the `donations` table if it does not exist.
- For production, use Render’s managed PostgreSQL for persistent data.
- If donation logging fails, users are redirected to the North Shore LUCE Givebutter page.

## License
MIT
