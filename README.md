# ktom

ktom is a web application for managing personal finances and ledgers. Users can sign up, log in, and securely create, edit, view, and delete financial records ("Hisaab"), with optional encryption for privacy.

## Features

- User authentication (signup, login, logout)
- Create, edit, view, and delete Hisaab entries
- Optional encryption for sensitive records
- Dashboard for easy tracking
- Built with Node.js, Express, MongoDB, and EJS

## Getting Started

### Prerequisites

- Node.js
- MongoDB

### Installation

1. Clone the repository:
   ```
   git clone <repo-url>
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Set up environment variables in a `.env` file:
   ```
   MONGO_URI=<your-mongodb-uri>
   PORT=3000
   ```
4. Start the server:
   ```
   npm start
   ```

## Folder Structure

- `app.js` - Main application file
- `configs/db.js` - Database connection
- `models/user.js` - Mongoose user and Hisaab schema
- `views/` - EJS templates
- `public/` - Static assets

## Usage

- Visit `/signup` to create an account
- Log in at `/login`
- Access your dashboard at `/dashboard`
- Create new Hisaab entries at `/create`
- Edit or delete entries from the dashboard

## License

MIT
