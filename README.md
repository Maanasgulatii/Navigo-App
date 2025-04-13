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
- **React Router:** Handles client-side routing for smooth navigation between pages.
- **EmailJS:** Sends reviews directly to email on the live site; no backend needed once hosted.
- **CSS:** Crafts a responsive, visually appealing design.
- **Node.js & Express:** Runs a local backend (`server.js`) to save reviews to `reviews.txt` when testing on your machine.
- **JavaScript (ES6+):** Core language for logic, from simulation in `Navigation.jsx` to form handling in `Review.jsx`.
- **HTML:** Structured via `index.html`, the entry point for the app.

---

## Installation

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
- Opens in your browser.
- Use a big screen for the best experience.

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
- If reviews.txt is missing, it's created with three columns: Name, Email, Review
- To test it, submit a review and it will be appended to the file automatically

---

## Pages
Navigo's interface splits into three key pages:

1. **Home**: The landing spot. A minimal, welcoming design. <br><br>
![Home page screenshot](https://raw.githubusercontent.com/MaanasGulatii/Navigo-App/main/screenshots/Home.png)<br><br>
2. **Navigation**: Input your start and end points, and watch. A black marker moves from start to finish on a map, showing distance, ETA, and petrol pumps. Last trip details stick around for review on the homepage.<br><br>
![Navigation page screenshot](https://raw.githubusercontent.com/MaanasGulatii/Navigo-App/main/screenshots/Nav1.png)<br><br>
![Navigation page screenshot](https://raw.githubusercontent.com/MaanasGulatii/Navigo-App/main/screenshots/Nav2.png)<br><br>
3. **Review**: If you have any thoughts or feedback, kindly enter your name (optional), email (optional), and your review of Navigo.<br><br>
![Review page screenshot](https://raw.githubusercontent.com/MaanasGulatii/Navigo-App/main/screenshots/Review.png)<br><br>

---

## Contact Us
Have thoughts, suggestions, or want to chat about Navigo? Click the "Contact Us" button and drop a mail. I'd like to hear about reviews, improvement ideas, and more.

---

## Live Demo
See Navigo in action: [Navigo](https://navigo-app.vercel.app/).
