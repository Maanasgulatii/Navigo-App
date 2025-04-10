import React, { useState } from "react";
import emailjs from '@emailjs/browser'; // Import EmailJS
import "./Review.css";

function Review() {
  const [review, setReview] = useState("");
  const [submittedMessage, setSubmittedMessage] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (review.trim()) {
      setSubmittedMessage(true);
      setReview(""); // Clear the review textarea
      setTimeout(() => setSubmittedMessage(false), 6000); // Extended to 6 seconds

      const name = document.getElementById("name").value || "Anonymous";
      const email = document.getElementById("email").value || "N/A";
      const newReview = { name, email, review };

      try {
        const response = await fetch('http://localhost:5000/api/reviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newReview),
        });

        if (response.ok) {
          console.log("Review saved to backend:", newReview);
        } else {
          // Backend failed, send via EmailJS
          sendEmail(newReview);
        }
      } catch (error) {
        // Backend offline, send via EmailJS
        sendEmail(newReview);
      }
    }
  };

  const sendEmail = (reviewData) => {
    const templateParams = {
      name: reviewData.name,
      email: reviewData.email,
      review: reviewData.review,
    };

    emailjs.send('service_qdtvzmn', 'template_0meu18b', templateParams, 't63w7Un-ufMR8JE1G')
      .then((result) => {
        console.log("Review emailed successfully:", result.text);
      }, (error) => {
        console.error("Failed to send email:", error.text);
        // Even if email fails, user still sees success message
      });
  };

  return (
    <div className="review-container">
      {submittedMessage && (
        <div className="submit-message">
          Thank you for using Navigo. Your response has been recorded.
        </div>
      )}
      <form className="review-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input type="text" id="name" name="name" autoComplete="off" />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input type="email" id="email" name="email" autoComplete="off" />
        </div>
        <div className="form-group">
          <label htmlFor="review">
            What do you think of NaviGo? <span className="required">*</span>
          </label>
          <textarea
            id="review"
            name="review"
            required
            value={review}
            onChange={(e) => setReview(e.target.value)}
            maxLength="1000"
            autoComplete="off"
          ></textarea>
          <div className="character-counter">{review.length}/1000</div>
        </div>
        <button type="submit" className="submit-button">Submit</button>
      </form>
    </div>
  );
}

export default Review;