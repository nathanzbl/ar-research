# AR Menu Survey Web Application

A survey web app to study augmented reality menus' effects on consumer decision-making.

## Features

- **Device-Based Menu Assignment**: Mobile users see AR menu, desktop users are randomly assigned text-only or text+image menus
- **Multi-Step Survey Flow**: Screening, menu display, choice questions, experience ratings, demographics
- **Skip Logic**: Screens out non-BYU students and under-18 participants; conditional AR usage question
- **Split-Screen Layout**: Menu on left, questions on right
- **Admin Dashboard**: View responses, filter by condition, export to CSV

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL

## Setup

### Prerequisites

- Node.js 18+
- PostgreSQL 14+

### Database Setup

1. Create a PostgreSQL database:
```bash
createdb ar_menu_survey
```

2. The schema will be automatically created when the server starts.

### Server Setup

```bash
cd server
npm install
cp .env.example .env
# Edit .env with your database URL
npm run dev
```

### Client Setup

```bash
cd client
npm install
npm run dev
```

The app will be available at http://localhost:3000

## API Endpoints

### Survey
- `POST /api/survey/start` - Create session, return condition assignment
- `POST /api/survey/response` - Save individual response
- `POST /api/survey/complete` - Mark session complete
- `POST /api/survey/screen-out` - Mark session as screened out

### Admin
- `GET /api/admin/responses` - List all responses
- `GET /api/admin/stats` - Basic stats
- `GET /api/admin/export` - Download CSV

## Survey Flow

1. **Screening (Q1-Q2)**: Age verification and BYU student check
2. **Menu Display**: Shows appropriate menu based on device
3. **Menu Choice (Q3)**: Select from 16 Japanese food items
4. **Choice Influences (Q4-Q7)**: Price, flavor, experience factors
5. **Experience Ratings (Q8-Q10)**: Two Likert matrices + confidence slider
6. **Menu Perceptions (Q11-Q13)**: True/false questions
7. **Open Feedback (Q14-Q16)**: Text responses
8. **Demographics (Q17-Q19, Q25-Q26)**: Age, gender, major, AR experience

## Admin Dashboard

Access at http://localhost:3000/admin

Features:
- Response counts and completion rates
- Filter by condition type (AR, text-only, text+image)
- Export all data to CSV
