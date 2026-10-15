# Meme'd — Campaign Payout Tracker

A full-stack web application that helps brands manage influencer campaigns and budgets while allowing creators to submit social media posts and track view-based earnings.

## Features

### Brand
- Register and log in as a brand.
- Create and manage campaigns.
- Define view milestones and their payouts.
- Track campaign budgets, spending, and remaining balances.

### Creator
- Register and log in as a creator.
- Browse active campaigns.
- Submit social media post URLs.
- Track post views, earnings, and payout status.

### Technical Features
- JWT-based authentication.
- Role-based access control.
- MongoDB database with Mongoose.
- REST API built with Express and TypeScript.
- React-based frontend using Next.js and TypeScript.
- Milestone-based payout calculation and campaign budget protection.
- Automated tests for payout calculation and budget limits.

## Tech Stack

- **Frontend:** Next.js, React, TypeScript, Tailwind CSS
- **Backend:** Node.js, Express.js, TypeScript
- **Database:** MongoDB Atlas, Mongoose
- **Authentication:** JSON Web Tokens (JWT)
- **Testing:** Jest

## Prerequisites

Install the following before running the application:

- Node.js and npm
- Git
- A MongoDB Atlas account or a local MongoDB instance
- Visual Studio Code or another code editor

## Project Structure

```text
Meme-payout-tracker/
├── backend/
│   ├── src/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── utils/
│   │   └── server.ts
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   └── app/
│   └── package.json
├── .gitignore
└── README.md
```

## Setup and Installation

### Step 1: Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd Meme-payout-tracker
```

Replace `YOUR_GITHUB_REPOSITORY_URL` with the public GitHub repository URL.

### Step 2: Configure the backend

Open a terminal in the project root and run:

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` folder. Use `.env.example` as a template and fill in your own local configuration.

Example configuration (use the exact variable names expected by the backend code):

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=replace_with_a_long_random_secret
```

**Important:** The variable names above are examples. Match them to the variables used in your backend configuration. Never commit your real `.env` file, database password, or JWT secret.

### Step 3: Start the backend server

From the `backend` directory, run the development script:

```bash
npm run dev
```

If your `package.json` uses a different development script, use the script listed under `scripts`.

The backend is expected to run at:

`http://localhost:5000`

Health check:

`http://localhost:5000/health`

### Step 4: Configure the frontend

Open a second terminal in VS Code. From the project root, run:

```bash
cd frontend
npm install
```

If the frontend API URL is configured through an environment variable, create the required local environment file and set it to:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Use the actual variable name expected by your frontend code. If the API URL is currently hardcoded, the environment variable is optional until the code is updated.

### Step 5: Start the frontend

From the `frontend` directory, run:

```bash
npm run dev
```

Open the application in your browser:

`http://localhost:3000`

Keep both backend and frontend terminals running while using the application.

## How to Use the Application

1. Open the application at `http://localhost:3000`.
2. Create an account or log in.
3. Select the appropriate account role: brand or creator.
4. As a brand, create a campaign and configure its budget and payout milestones.
5. As a creator, browse active campaigns and submit a social media post URL.
6. View your submitted posts and earnings in the creator dashboard.
7. Update a submission's view count through the backend API to test milestone payouts and budget protection.

## Running Tests

Open a terminal in the `backend` directory and run:

```bash
npm test
```

This command assumes the backend `package.json` defines a `test` script. Confirm the available scripts in `backend/package.json` and update this section if necessary.

## API Overview

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/signup` | Register an account |
| POST | `/api/auth/login` | Log in |
| POST | `/api/campaigns` | Create a campaign |
| GET | `/api/campaigns` | Browse active campaigns |
| GET | `/api/campaigns/mine` | View the brand's campaigns |
| POST | `/api/submissions` | Submit a post |
| GET | `/api/submissions/mine` | View the creator's submissions |
| PATCH | `/api/submissions/:id/views` | Update post views and calculate payout |

Protected endpoints require a valid JWT access token in the `Authorization` header:

```text
Authorization: Bearer YOUR_ACCESS_TOKEN
```

## Assumptions and Limitations

- Campaigns define payout milestones using view thresholds and payout amounts.
- The highest eligible milestone determines the target payout.
- Payments are tracked by the application; this project does not directly transfer money.
- Payouts are limited by the campaign's remaining budget.
- View counts are updated through the API for demonstration and testing. They are not automatically verified against Instagram or YouTube.
- API access depends on authentication and role-based permissions.
- Configure MongoDB access and environment variables before starting the application.

## Deployment

Deploy the frontend and backend using hosting providers that support Next.js and Node.js applications. Configure production environment variables, MongoDB network access, and the production frontend API URL before deployment.

After deployment, add the public application URL here:

**Live Demo:** To be added

## Security

- Keep secrets in environment variables.
- Never commit `.env` files or real credentials.
- Use a strong JWT secret.
- Restrict production database access to trusted sources.
- Use HTTPS for deployed applications.

## License

This project was developed as a software engineering take-home assignment.