import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import Navigation from "./pages/Navigation";
import Review from "./pages/Review"; // Import the Review component

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/navigate" element={<Navigation />} />
      <Route path="/review" element={<Review />} /> {/* Add the route for the Review page */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
