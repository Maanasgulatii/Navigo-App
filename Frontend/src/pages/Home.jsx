import "./Home.css";
import { useState, useEffect } from "react";
import carAnimation from "../assets/car_animation.mp4";
import { useNavigate } from "react-router-dom";

function Home() {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [showTripDetails, setShowTripDetails] = useState(false);
  
  const colors = ["#E74C3C", "#3498DB", "#2ECC71", "#F39C12", "#9B59B6", "#1ABC9C", "#D35400"];
  const quotes = [
    "Travel slow. Someone is waiting for you at the other end.",
    "The best journeys are the ones that change you.",
    "A step outside is a step toward adventure.",
    "New places, new faces, new memories.",
    "The road is long, but the destination is worth it.",
    "Keep moving. The world is too big to stay in one place.",
    "Travel isn't a hobby, it's a way of life.",
    "Every journey begins with a single step.",
    "Go where you feel most alive.",
    "Not all who wander are lost, but some are just exploring.",
    "Life is short. Travel often.",
    "The world is full of shortcuts, but the long way is worth it.",
    "Discover places you've only dreamed of.",
    "Adventure is calling. Will you answer?",
    "Lost in travel, found in memories.",
  ];

  const navigate = useNavigate();

  // Get last trip details from localStorage
  const lastTrip = JSON.parse(localStorage.getItem('lastTrip')) || {
    start: "N/A",
    end: "N/A",
    distance: "N/A",
    time: "N/A"
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuoteIndex((prevIndex) => (prevIndex + 1) % quotes.length);
    }, 9000);
    return () => clearInterval(interval);
  }, []);

  const handleStartNavigation = () => {
    navigate("/navigate");
  };

  const toggleTripDetails = () => {
    setShowTripDetails(!showTripDetails);
  };

  return (
    <div className="home-container">
      <div className="trip-details-container">
        <div className="trip-details-header" onClick={toggleTripDetails}>
          Last trip details ▼
        </div>
        {showTripDetails && (
          <div className="trip-details-dropdown">
            <p>Start: {lastTrip.start}</p>
            <p>End: {lastTrip.end}</p>
            <p>Distance: {lastTrip.distance}</p>
            <p>Time Taken: {lastTrip.time}</p>
          </div>
        )}
      </div>

      <h1 className="title">
        Navi<span className="highlight">Go</span>
      </h1>
      
      <div className="car-animation-container">
        <video autoPlay loop muted className="car-animation">
          <source src={carAnimation} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      <button
        className="nav-button"
        onClick={handleStartNavigation}
      >
        Start Navigation
      </button>

      <div className="footer-links">
        <a href="#" className="footer-link" onClick={() => navigate("/review")}>Drop a Review</a>
        <span className="link-separator">|</span>
        <a href="https://mail.google.com/mail/?view=cm&fs=1&to=mgulati2708@gmail.com" target="_blank" className="footer-link">Contact Us</a>
      </div>

      <div className="quote-container" style={{ color: colors[currentQuoteIndex % colors.length] }}>
        "{quotes[currentQuoteIndex]}"
      </div>
    </div>
  );
}

export default Home;