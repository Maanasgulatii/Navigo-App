import React from 'react';
function About() {   
  return (     
    <div style={{ 
      padding: '20px', 
      maxWidth: '800px', 
      margin: '0 auto', 
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#1a1a1a' // Added dark background color
    }}>       
      <h1 style={{ fontSize: '2.5em', color: '#4a90e2', marginBottom: '20px' }}>         
        🚗 About NaviGo       
      </h1>       
      <p style={{ fontSize: '1.4em', lineHeight: '1.6', color: '#F5F5DC' }}>         
        Welcome to <strong>NaviGo</strong>, your ultimate companion for seamless travel! Whether you're navigating the busy streets of a city or hitting the open road for an intercity adventure, NaviGo is designed to make every trip smooth, smart, and stress-free.       
      </p>       
      <h2 style={{ fontSize: '1.8em', color: '#4a90e2', marginTop: '30px' }}>What We Offer</h2>       
      <ul style={{ fontSize: '1.3em', lineHeight: '1.8', color: '#F5F5DC', listStyleType: 'none', paddingLeft: '0' }}>         
        <li style={{ marginBottom: '15px' }}>           
          <strong>🚦 Smart Route Planning:</strong> Enter your start and end locations, and NaviGo calculates the fastest route, complete with real-time distance and ETA updates—perfect for both quick city hops and long hauls.         
        </li>         
        <li style={{ marginBottom: '15px' }}>           
          <strong>🏁 Travel Simulation:</strong> Watch your journey come to life! A car icon moves from start to finish on the map, giving you a view of your progress, distance, and estimated arrival time.         
        </li>         
        <li style={{ marginBottom: '15px' }}>           
          <strong>⛽ Petrol Pump Finder:</strong> Never run low on fuel. NaviGo pinpoints up to 20 major petrol pumps along your route, spaced out for convenience, so you're always prepared.         
        </li>         
        <li style={{ marginBottom: '15px' }}>           
          <strong>📡 Live Traffic Updates:</strong> Stay ahead of the game with real-time traffic info. Avoid delays and keep your journey on track, no matter where you're headed.         
        </li>       
      </ul>     
    </div>   
  ); 
}  

export default About;
