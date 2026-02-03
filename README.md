# Bread Journal

A web application for tracking and rating your homemade bread. Upload photos, rate your breads on different aspects, and keep a journal of your baking journey.

## Features

- Upload photos of your bread
- Rate bread on 5 aspects (Crust, Crumb, Taste, Texture, Appearance) on a scale of 1-10
- Add notes and recipe details
- View all your breads in a gallery
- Sort by date or rating
- Filter by bread type
- Edit and delete bread entries

## Technology Stack

- **Frontend**: React with Vite
- **Backend**: Node.js with Express
- **Database**: SQLite
- **Image Storage**: Local filesystem

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm

### Installation

1. Install backend dependencies:
```bash
cd server
npm install
```

2. Install frontend dependencies:
```bash
cd client
npm install
```

### Running the Application

1. Start the backend server (from the `server` directory):
```bash
npm start
```
The server will run on http://localhost:3000

2. In a new terminal, start the frontend dev server (from the `client` directory):
```bash
npm run dev
```
The frontend will run on http://localhost:5173

3. Open your browser and navigate to http://localhost:5173

## Usage

1. Fill out the form to add a new bread entry:
   - Enter a name for your bread
   - Optionally specify the bread type (e.g., Sourdough, Baguette)
   - Select the bake date
   - Upload a photo
   - Rate your bread on 5 aspects using the sliders
   - Add optional notes and recipe details

2. View your breads in the gallery below the form

3. Use the controls to sort by date or rating, and filter by bread type

4. Click "Edit" on any bread card to update it

5. Click "Delete" to remove a bread entry

## Project Structure

```
Bread/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── BreadForm.jsx
│   │   │   ├── BreadCard.jsx
│   │   │   ├── BreadGallery.jsx
│   │   │   └── RatingInput.jsx
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   └── package.json
├── server/                 # Express backend
│   ├── src/
│   │   ├── database/
│   │   │   ├── db.js
│   │   │   └── schema.sql
│   │   ├── routes/
│   │   │   └── breads.js
│   │   ├── uploads/        # Uploaded images
│   │   └── server.js
│   └── package.json
└── README.md
```

## Future Enhancements

- User authentication
- Social features (friends, sharing)
- Multiple rating contributors
- Export functionality
- Cloud image storage
- Mobile app

## License

ISC
