# Navigo-App

### Experience Navigo at its finest on a big screen—best enjoyed on your PC!

Navigo is your ultimate travel companion, blending smart route planning with real-time insights. Built from scratch and hosted live at [Navigo on Vercel](https://navigo-app.vercel.app/), this app brings navigation to life with a sleek, user-friendly interface.

---

## Features

Dive into what makes Navigo stand out:

- **Navigation Simulation:** Visualize your trip! Enter your start (black marker) and end (green marker) locations, and watch the black marker move along the route on the map. This simulation delivers real-time distance, ETA, and trip details—no live tracking, just a dynamic preview of your journey.
- **Petrol Pump Finder:** Navigo locates up to 20 major petrol stations along your route, strategically spaced for your convenience.
- **Real-Time Traffic Updates:** Get the latest traffic conditions on the route.
- **ETA Prediction:** Precise estimated arrival times, updated live as traffic shifts.
- **Distance Calculation:** Measure the exact distance between any two points, whether its for quick city trips or sprawling intercity drives.
- **Smart Fallback:** If an area's not mapped, Navigo snaps to the nearest available location using coordinates.
- **Last Trip Details:** Review your most recent route, distance, and ETA on the homepage for quick reference after each simulation.

---

## Technologies Used

Navigo's built with a robust, modern stack. Here's the full rundown:

- **React:** Powers the dynamic, component-driven frontend for a fluid user experience.
- **Vite:** A next-gen build tool, speeding up development and bundling the app into `dist/` for deployment.
- **React Router:** Handles client-side routing for smooth navigation between pages (`/`, `/navigate`, `/review`).
- **EmailJS:** Sends reviews directly to email on the live site; no backend needed once hosted.
- **CSS:** Crafts a responsive, visually appealing design.
- **Node.js & Express:** Runs a local backend (`server.js`) to save reviews to `reviews.txt` when testing on your machine.
- **JavaScript (ES6+):** Core language for logic, from simulation in `Navigation.jsx` to form handling in `Review.jsx`.
- **HTML:** Structured via `index.html`, the entry point for the React app.

---

## Installation

Ready to run Navigo locally? Here's a detailed guide:

### Clone the Repository
Grab the code from GitHub:
```bash
git clone https://github.com/MaanasGulatii/Navigo-App.git
cd Navigo-App
```

### Frontend Setup
Bring the app to life on http://localhost:5173:

Navigate to the frontend:
```bash
cd Frontend
```

Install dependencies (React, Vite, EmailJS, etc.):
```bash
npm install
```

Launch the development server:
```bash
npm run dev
```
- Opens in your browser—use a big screen for the full map experience!
- Check package.json's "scripts" for dev, build, etc.

### Backend Setup (Optional, Local Only)
For saving reviews to reviews.txt locally:

Open a new terminal and go to the backend:
```bash
cd ../backend
```

Install backend dependencies (Express, CORS):
```bash
npm install
```

Start the Node server on http://localhost:5000:
```bash
node server.js
```
- Auto-Generation: If reviews.txt is missing, it's created with headers (Name\tEmail\tReview).
- Test It: Submit a review at /review—it'll hit http://localhost:5000/api/reviews and append to the file.

### Local Notes
- Frontend: Runs standalone at http://localhost:5173. Pages like /navigate use the TomTom API (hardcoded key: Pywr1bWAgjQmnF9nQz7HrJih4GjzRJeO).
- Backend: Only active locally—Review.jsx tries fetch('http://localhost:5000/api/reviews') first, falling back to EmailJS if it's down.
- Hosted: On Vercel, the backend's skipped—reviews go straight to EmailJS (service_qdtvzmn, template_0meu18b, t63w7Un-ufMR8JE1G).

## Pages
Navigo's interface splits into three key pages—each with a purpose:

- **Home (/)**: The landing spot—a clean, welcoming intro to Navigo. Sets the stage for your journey with a minimalist design. (Screenshot: home.png coming soon!)
- **Navigation (/navigate)**: The powerhouse—input your start and end points, and watch the magic. A black marker moves from start to finish on a TomTom map, showing distance, ETA, traffic, and petrol pumps. Last trip details stick around for review. (Screenshot: navigation.png coming soon!)
- **Review (/review)**: Your voice matters! Enter your name (optional), email (optional), and feedback. Locally, it saves to reviews.txt via the backend; on Vercel, it emails me via EmailJS—quick and simple. (Screenshot: review.png coming soon!)

## Contact Us
Have thoughts, suggestions, or want to chat about Navigo? Click the "Contact Us" link (coming soon to the site)—it'll fire up your email client to maanasgulati@gmail.com. I'm all ears for reviews, improvement ideas, or just a hello—let's make Navigo even better together!

## Contribute
Love what Navigo offers? Take it for a spin at [Navigo on Vercel](https://navigo-app.vercel.app/) and share your feedback on the /review page—it's fast, easy, and helps shape the app's future. Every review fuels the journey!

## Live Demo
See Navigo in action: [Navigo on Vercel](https://navigo-app.vercel.app/). Open it on your PC's big screen for the full navigation glory—explore Home, Navigation, and Review today!

## Development Tips
- **API Keys**: Hardcoded for now (TomTom in Navigation.jsx, EmailJS in main.jsx/Review.jsx). For security, move to a .env file locally (e.g., VITE_API_KEY=your-key) and Vercel env vars later.
- **Backend Folder**: In the repo, backend/ sits outside Frontend/. Locally, you can move it inside Frontend/ if node server.js fails—update the README if you tweak this!
- **Vercel Hosting**: Deployed from Frontend/ with vercel.json (assumed auto-added)—no backend runs live.
