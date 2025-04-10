import React, { useEffect, useRef, useState, useCallback } from "react";
import "./Navigation.css";
import tt from "@tomtom-international/web-sdk-maps";
import "@tomtom-international/web-sdk-maps/dist/maps.css";
import "@tomtom-international/web-sdk-services";
import petrolIcon from "../assets/petrol.png";

function Navigation() {
  const mapElement = useRef();
  const [map, setMap] = useState(null);
  const [startLocation, setStartLocation] = useState(null);
  const [endLocation, setEndLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [startInput, setStartInput] = useState("");
  const [endInput, setEndInput] = useState("");
  const [startSuggestions, setStartSuggestions] = useState([]);
  const [endSuggestions, setEndSuggestions] = useState([]);
  const [showStartDropdown, setShowStartDropdown] = useState(false);
  const [showEndDropdown, setShowEndDropdown] = useState(false);
  const [distance, setDistance] = useState(""); // Total distance
  const [eta, setEta] = useState(""); // Total ETA
  const [distanceCovered, setDistanceCovered] = useState("0.0"); // Distance covered
  const [routeCalculated, setRouteCalculated] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [showRoutes, setShowRoutes] = useState(false);
  const [showCoordinates, setShowCoordinates] = useState(false);
  const [showPetrolPumps, setShowPetrolPumps] = useState(false);
  const [alternativeRoutes, setAlternativeRoutes] = useState([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
  const [petrolPumpsMessage, setPetrolPumpsMessage] = useState("");
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentMarker, setCurrentMarker] = useState(null);
  const [animationFrame, setAnimationFrame] = useState(null);
  const [tripDetails, setTripDetails] = useState(null);

  const API_KEY = "60f8il4AxIDGKgxt6hJGwBD31V37dnwd";

  useEffect(() => {
    try {
      const startData = localStorage.getItem("startLocation");
      const endData = localStorage.getItem("endLocation");
      if (startData && endData) {
        setStartLocation(JSON.parse(startData));
        setEndLocation(JSON.parse(endData));
      }
    } catch (error) {
      setErrorMessage("Error loading location data.");
      setIsLoading(false);
    }
  }, []);

  const calculateRoute = useCallback(async (start, end, mapInstance, fetchAlternatives = false) => {
    if (!mapInstance) {
      console.error("Map instance not available for route calculation.");
      setLocationError("Map not ready. Please try again.");
      return null;
    }
  
    try {
      const response = await fetch(
        `https://api.tomtom.com/routing/1/calculateRoute/${start.lat},${start.lon}:${end.lat},${end.lon}/json?key=${API_KEY}&traffic=true&maxAlternatives=${fetchAlternatives ? 2 : 0}&computeTravelTimeFor=all`
      );
      if (!response.ok) throw new Error(`Routing API failed: ${response.status}`);
      const data = await response.json();
  
      if (!data.routes || !Array.isArray(data.routes) || data.routes.length === 0) {
        throw new Error("No valid routes returned from API");
      }
  
      if (fetchAlternatives) {
        setAlternativeRoutes(data.routes.slice(0, 3));
      }
  
      const validIndex = Math.min(selectedRouteIndex, data.routes.length - 1);
      if (!data.routes[validIndex] || !data.routes[validIndex].legs) {
        throw new Error("Selected route has no legs data");
      }
  
      const routeGeoJson = {
        type: 'FeatureCollection',
        features: [{
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: data.routes[validIndex].legs[0].points.map(point => [point.longitude, point.latitude])
          }
        }]
      };
  
      const altRoutesGeoJson = {
        type: 'FeatureCollection',
        features: fetchAlternatives && showRoutes ? data.routes.filter((_, idx) => idx !== validIndex).map(route => ({
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: route.legs[0].points.map(point => [point.longitude, point.latitude])
          }
        })) : []
      };
  
      if (mapInstance.getSource('route')) {
        mapInstance.getSource('route').setData(routeGeoJson);
      } else {
        mapInstance.addSource('route', { type: 'geojson', data: routeGeoJson });
        mapInstance.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          paint: { 'line-color': '#4a90e2', 'line-width': 6 }
        });
      }
  
      if (fetchAlternatives && showRoutes) {
        if (mapInstance.getSource('alternative-routes')) {
          mapInstance.getSource('alternative-routes').setData(altRoutesGeoJson);
        } else {
          mapInstance.addSource('alternative-routes', { type: 'geojson', data: altRoutesGeoJson });
          mapInstance.addLayer({
            id: 'alternative-routes',
            type: 'line',
            source: 'alternative-routes',
            paint: { 'line-color': '#888888', 'line-width': 4, 'line-dasharray': [2, 2] }
          });
        }
      } else if (mapInstance.getSource('alternative-routes')) {
        mapInstance.removeLayer('alternative-routes');
        mapInstance.removeSource('alternative-routes');
      }
  
      const bounds = new tt.LngLatBounds();
      routeGeoJson.features[0].geometry.coordinates.forEach(point => bounds.extend(point));
      mapInstance.fitBounds(bounds, { padding: 50 });
  
      const summary = data.routes[validIndex].summary;
      const travelTimeInSeconds = summary.travelTimeInSeconds;
      const distanceKm = (summary.lengthInMeters / 1000).toFixed(1);
      const hours = Math.floor(travelTimeInSeconds / 3600);
      const minutes = Math.round((travelTimeInSeconds % 3600) / 60);
      setDistance(distanceKm);
      setEta(hours > 0 ? `${hours} hr ${minutes} min` : `${minutes} min`);
      setLocationError("");
  
      if (showPetrolPumps) {
        await fetchPetrolPumps(mapInstance, data.routes[validIndex]);
      }
  
      return data.routes[validIndex];
    } catch (error) {
      console.error("Error calculating route:", error);
      setLocationError("Failed to calculate route. Please try again.");
      return null;
    }
  }, [API_KEY, selectedRouteIndex, showRoutes, showPetrolPumps]);

  const fetchPetrolPumps = async (mapInstance, route, retries = 3, delay = 2000) => {
    try {
      if (!mapInstance) {
        setPetrolPumpsMessage("Map not available to display petrol pumps.");
        return;
      }

      const points = route.legs[0].points;
      const samplePoints = [];
      const step = Math.floor(points.length / 5);
      for (let i = 0; i < points.length && samplePoints.length < 5; i += step) {
        samplePoints.push(points[i]);
      }
      if (samplePoints.length < 5 && points.length > 0) {
        samplePoints.push(points[points.length - 1]);
      }

      let allPetrolPumps = [];
      let rateLimitHit = false;

      for (const point of samplePoints) {
        let attempt = 0;
        while (attempt < retries) {
          try {
            const response = await fetch(
              `https://api.tomtom.com/search/2/poiSearch/petrol%20station.json?key=${API_KEY}&lat=${point.latitude}&lon=${point.longitude}&radius=20000&categorySet=7315&limit=20`
            );
            if (!response.ok) {
              if (response.status === 429) {
                rateLimitHit = true;
                break;
              }
              if (attempt < retries - 1) {
                await new Promise(resolve => setTimeout(resolve, delay));
                attempt++;
                continue;
              }
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (data.results && data.results.length > 0) {
              allPetrolPumps = allPetrolPumps.concat(data.results);
            }
            break;
          } catch (err) {
            if (attempt === retries - 1) throw err;
            await new Promise(resolve => setTimeout(resolve, delay));
            attempt++;
          }
        }
      }

      const uniquePetrolPumps = Array.from(
        new Map(allPetrolPumps.map(station => [`${station.position.lat},${station.position.lon}`, station])).values()
      );

      const maxPumps = 20;
      let selectedPumps = [];
      if (uniquePetrolPumps.length > maxPumps) {
        const stepSize = Math.floor(uniquePetrolPumps.length / maxPumps);
        for (let i = 0; i < uniquePetrolPumps.length && selectedPumps.length < maxPumps; i += stepSize) {
          selectedPumps.push(uniquePetrolPumps[i]);
        }
        while (selectedPumps.length < maxPumps && i < uniquePetrolPumps.length) {
          selectedPumps.push(uniquePetrolPumps[i]);
          i += 1;
        }
      } else {
        selectedPumps = uniquePetrolPumps;
      }

      if (mapInstance.getLayer('petrol-pumps')) mapInstance.removeLayer('petrol-pumps');
      if (mapInstance.getSource('petrol-pumps')) mapInstance.removeSource('petrol-pumps');

      if (selectedPumps.length > 0) {
        const petrolPumpsGeoJson = {
          type: 'FeatureCollection',
          features: selectedPumps.map(station => ({
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [station.position.lon, station.position.lat]
            },
            properties: {
              name: station.poi?.name || 'Petrol Pump'
            }
          }))
        };

        if (rateLimitHit) {
          mapInstance.addSource('petrol-pumps', { type: 'geojson', data: petrolPumpsGeoJson });
          mapInstance.addLayer({
            id: 'petrol-pumps',
            type: 'circle',
            source: 'petrol-pumps',
            paint: {
              'circle-radius': 5,
              'circle-color': '#00FF00'
            }
          });
          setPetrolPumpsMessage("API rate limit reached; showing available pumps as green dots.");
        } else {
          mapInstance.loadImage(petrolIcon, (error, image) => {
            if (error) {
              console.error("Error loading petrol icon:", error);
              setPetrolPumpsMessage("Failed to load petrol pump icons.");
              return;
            }
            if (!mapInstance.hasImage('petrol-pump-icon')) {
              mapInstance.addImage('petrol-pump-icon', image);
            }

            mapInstance.addSource('petrol-pumps', { type: 'geojson', data: petrolPumpsGeoJson });
            mapInstance.addLayer({
              id: 'petrol-pumps',
              type: 'symbol',
              source: 'petrol-pumps',
              layout: {
                'icon-image': 'petrol-pump-icon',
                'icon-size': 0.3,
                'icon-allow-overlap': true
              }
            });
          });
          setPetrolPumpsMessage("");
        }
      } else {
        setPetrolPumpsMessage("No petrol pumps available along the route.");
      }
    } catch (error) {
      console.error("Error fetching petrol pumps:", error);
      setPetrolPumpsMessage(`Error fetching petrol pumps: ${error.message}.`);
    }
  };

  const animateMarker = (route, start, end, mapInstance) => {
    const points = route.legs[0].points.map(p => [p.longitude, p.latitude]);
    const totalDistance = route.summary.lengthInMeters / 1000; // in km
    const totalTime = totalDistance * 30000; // 30 seconds per km for slower speed
    const stepTime = 50; // 50ms per frame for smoothness
    const totalSteps = Math.floor(totalTime / stepTime); // Number of steps
    const pointsPerStep = points.length / totalSteps;
    let step = 0;

    if (currentMarker) currentMarker.remove();
    const marker = new tt.Marker()
      .setLngLat([start.lon, start.lat])
      .addTo(mapInstance);
    setCurrentMarker(marker);

    const moveMarker = () => {
      if (!isNavigating || step >= totalSteps) {
        if (step >= totalSteps) {
          const traffic = route.summary.trafficDelayInSeconds > 300 ? "High" : route.summary.trafficDelayInSeconds > 100 ? "Moderate" : "Low";
          setTripDetails({
            distance: totalDistance.toFixed(1),
            hours: Math.floor(route.summary.travelTimeInSeconds / 3600),
            minutes: Math.round((route.summary.travelTimeInSeconds % 3600) / 60),
            traffic
          });
          setIsNavigating(false);
          marker.setLngLat([start.lon, start.lat]); // Return to start
        }
        if (animationFrame) cancelAnimationFrame(animationFrame);
        setAnimationFrame(null);
        return;
      }

      const pointIndex = Math.min(Math.floor(step * pointsPerStep), points.length - 1);
      marker.setLngLat(points[pointIndex]);
      mapInstance.panTo(points[pointIndex]);

      const progress = pointIndex / (points.length - 1);
      const currentDistance = (totalDistance * progress).toFixed(1);
      setDistanceCovered(currentDistance);

      step++;
      setAnimationFrame(requestAnimationFrame(moveMarker));
    };

    setAnimationFrame(requestAnimationFrame(moveMarker));
  };

  const stopNavigation = () => {
    if (isNavigating) {
      let currentTripDetails = null;
      const currentDistance = parseFloat(distanceCovered);
      let timeoutId = null; // To track the timeout
  
      if (alternativeRoutes.length > 0 && alternativeRoutes[selectedRouteIndex]) {
        const route = alternativeRoutes[selectedRouteIndex];
        // Calculate time based on distanceCovered at 30 km/hr
        const timeInHours = currentDistance / 30; // Time in hours
        const totalTimeInSeconds = timeInHours * 3600; // Convert to seconds
        const hours = Math.floor(totalTimeInSeconds / 3600);
        const minutes = Math.round((totalTimeInSeconds % 3600) / 60);
        const traffic = route.summary.trafficDelayInSeconds > 300 ? "High" : route.summary.trafficDelayInSeconds > 100 ? "Moderate" : "Low";
  
        currentTripDetails = {
          distance: currentDistance,
          hours,
          minutes,
          traffic
        };
  
        // Ensure the blue route remains displayed
        if (map) {
          const routeGeoJson = {
            type: 'FeatureCollection',
            features: [{
              type: 'Feature',
              geometry: {
                type: 'LineString',
                coordinates: route.legs[0].points.map(point => [point.longitude, point.latitude])
              }
            }]
          };
          if (map.getSource('route')) {
            map.getSource('route').setData(routeGeoJson);
          }
        }
  
        // Show current details immediately
        setTripDetails(currentTripDetails);
  
        // After 10 seconds, switch to full trip details from the start (API data) and ensure it sticks
        timeoutId = setTimeout(() => {
          const fullDistance = (route.summary.lengthInMeters / 1000).toFixed(1);
          const fullTimeInSeconds = route.summary.travelTimeInSeconds;
          const fullHours = Math.floor(fullTimeInSeconds / 3600);
          const fullMinutes = Math.round((fullTimeInSeconds % 3600) / 60);
          const fullTraffic = route.summary.trafficDelayInSeconds > 300 ? "High" : route.summary.trafficDelayInSeconds > 100 ? "Moderate" : "Low";
  
          const finalTripDetails = {
            distance: fullDistance,
            hours: fullHours,
            minutes: fullMinutes,
            traffic: fullTraffic
          };
          setTripDetails(finalTripDetails); // Set final details
        }, 10000); // 10000 ms = 10 seconds
      } else {
        // Fallback if no route data is available
        const timeInHours = currentDistance / 30; // Time in hours
        const totalTimeInSeconds = timeInHours * 3600; // Convert to seconds
        const hours = Math.floor(totalTimeInSeconds / 3600);
        const minutes = Math.round((totalTimeInSeconds % 3600) / 60);
  
        currentTripDetails = {
          distance: currentDistance,
          hours,
          minutes,
          traffic: "Unknown"
        };
  
        setTripDetails(currentTripDetails);
  
        // After 10 seconds, keep the fallback details (no route to calculate full details)
        timeoutId = setTimeout(() => {
          setTripDetails(currentTripDetails); // No change, just to be explicit
        }, 10000);
      }
  
      setIsNavigating(false);
      if (currentMarker) {
        currentMarker.setLngLat([startLocation.lon, startLocation.lat]); // Return to start
      }
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
        setAnimationFrame(null);
      }
  
      // Cleanup to ensure no other updates interfere (though none should with current code)
      return () => {
        if (timeoutId) clearTimeout(timeoutId);
      };
    }
  };

  useEffect(() => {
    if (!startLocation || !endLocation) {
      setIsLoading(false);
      return;
    }

    const newMap = tt.map({
      key: API_KEY,
      container: mapElement.current,
      center: [startLocation.lon, startLocation.lat],
      zoom: 13,
    });

    newMap.addControl(new tt.FullscreenControl());
    newMap.addControl(new tt.NavigationControl());
    newMap.addControl(new tt.GeolocateControl({ positionOptions: { enableHighAccuracy: true }, trackUserLocation: true }));

    const startMarker = new tt.Marker()
      .setLngLat([startLocation.lon, startLocation.lat])
      .setPopup(new tt.Popup().setHTML(`<b>Start:</b> ${startLocation.address || 'Start Location'}`))
      .addTo(newMap);

    new tt.Marker({ color: '#00cc00' })
      .setLngLat([endLocation.lon, endLocation.lat])
      .setPopup(new tt.Popup().setHTML(`<b>Destination:</b> ${endLocation.address || 'End Location'}`))
      .addTo(newMap);

    newMap.on('load', async () => {
      setMap(newMap);
      if (routeCalculated) {
        const route = await calculateRoute(startLocation, endLocation, newMap);
        if (route && isNavigating) {
          animateMarker(route, startLocation, endLocation, newMap);
          startMarker.remove();
        }
      }
      setIsLoading(false);
    });

    return () => {
      newMap.remove();
      setMap(null);
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [startLocation, endLocation, routeCalculated, calculateRoute, API_KEY, isNavigating]);

  useEffect(() => {
    if (routeCalculated && map && startLocation && endLocation && !isNavigating) {
      calculateRoute(startLocation, endLocation, map, showRoutes);
      const interval = setInterval(() => {
        calculateRoute(startLocation, endLocation, map, showRoutes);
      }, 300000); // 5 minutes
      return () => clearInterval(interval);
    }
    // Add logic to save trip details when route is calculated on navigation start
    if (routeCalculated && map && startLocation && endLocation && isNavigating) {
      (async () => {
        const routeData = await calculateRoute(startLocation, endLocation, map, showRoutes);
        if (routeData) {
          const summary = routeData.summary;
          const distanceKm = (summary.lengthInMeters / 1000).toFixed(1);
          const travelTimeInSeconds = summary.travelTimeInSeconds;
          const hours = Math.floor(travelTimeInSeconds / 3600);
          const minutes = Math.round((travelTimeInSeconds % 3600) / 60);
          const eta = hours > 0 ? `${hours} hr ${minutes} min` : `${minutes} min`;

          // Save trip details to localStorage
          const tripDetails = {
            start: startLocation.address,
            end: endLocation.address,
            distance: `${distanceKm} km`,
            time: eta
          };
          localStorage.setItem('lastTrip', JSON.stringify(tripDetails));
        }
      })();
    }
  }, [routeCalculated, map, startLocation, endLocation, calculateRoute, showRoutes, isNavigating]);

  const handleShowRoutes = () => {
    if (!routeCalculated) {
      setLocationError("Enter the start and end location first");
      return;
    }
    const newShowRoutes = !showRoutes;
    setShowRoutes(newShowRoutes);
    if (map && alternativeRoutes.length > 0) {
      if (!newShowRoutes) {
        if (map.getLayer('alternative-routes')) map.removeLayer('alternative-routes');
        if (map.getSource('alternative-routes')) map.removeSource('alternative-routes');
        
        if (map.getSource('route') && alternativeRoutes[selectedRouteIndex]) {
          const routeGeoJson = {
            type: 'FeatureCollection',
            features: [{
              type: 'Feature',
              geometry: {
                type: 'LineString',
                coordinates: alternativeRoutes[selectedRouteIndex].legs[0].points.map(point => [point.longitude, point.latitude])
              }
            }]
          };
          
          map.getSource('route').setData(routeGeoJson);
          const bounds = new tt.LngLatBounds();
          routeGeoJson.features[0].geometry.coordinates.forEach(point => bounds.extend(point));
          map.fitBounds(bounds, { padding: 50 });
          
          const summary = alternativeRoutes[selectedRouteIndex].summary;
          const travelTimeInSeconds = summary.travelTimeInSeconds;
          const distanceKm = (summary.lengthInMeters / 1000).toFixed(1);
          const hours = Math.floor(travelTimeInSeconds / 3600);
          const minutes = Math.round((travelTimeInSeconds % 3600) / 60);
          setDistance(distanceKm);
          setEta(hours > 0 ? `${hours} hr ${minutes} min` : `${minutes} min`);
          if (isNavigating) {
            animateMarker(alternativeRoutes[selectedRouteIndex], startLocation, endLocation, map);
          }
        }
      } else {
        calculateRoute(startLocation, endLocation, map, true);
      }
    }
  };

  const handleSelectRoute = (index) => {
    setSelectedRouteIndex(index);
    if (map && alternativeRoutes.length > 0) {
      const routeGeoJson = {
        type: 'FeatureCollection',
        features: [{
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: alternativeRoutes[index].legs[0].points.map(point => [point.longitude, point.latitude])
          }
        }]
      };
      map.getSource('route').setData(routeGeoJson);
      const bounds = new tt.LngLatBounds();
      routeGeoJson.features[0].geometry.coordinates.forEach(point => bounds.extend(point));
      map.fitBounds(bounds, { padding: 50 });

      const summary = alternativeRoutes[index].summary;
      const travelTimeInSeconds = summary.travelTimeInSeconds;
      const distanceKm = (summary.lengthInMeters / 1000).toFixed(1);
      const hours = Math.floor(travelTimeInSeconds / 3600);
      const minutes = Math.round((travelTimeInSeconds % 3600) / 60);
      setDistance(distanceKm);
      setEta(hours > 0 ? `${hours} hr ${minutes} min` : `${minutes} min`);
      setDistanceCovered("0.0");

      if (isNavigating) {
        animateMarker(alternativeRoutes[index], startLocation, endLocation, map);
      }

      if (showRoutes) {
        const altRoutesGeoJson = {
          type: 'FeatureCollection',
          features: alternativeRoutes.filter((_, idx) => idx !== index).map(route => ({
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: route.legs[0].points.map(point => [point.longitude, point.latitude])
            }
          }))
        };
        if (map.getSource('alternative-routes')) {
          map.getSource('alternative-routes').setData(altRoutesGeoJson);
        } else {
          map.addSource('alternative-routes', { type: 'geojson', data: altRoutesGeoJson });
          map.addLayer({
            id: 'alternative-routes',
            type: 'line',
            source: 'alternative-routes',
            paint: { 'line-color': '#888888', 'line-width': 4, 'line-dasharray': [2, 2] }
          });
        }
      }
    }
  };

  const handleShowCoordinates = () => {
    if (!routeCalculated) {
      setLocationError("Enter the start and end location first");
      return;
    }
    setShowCoordinates(!showCoordinates);
  };

  const handleShowPetrolPumps = async () => {
    if (!routeCalculated) {
      setLocationError("Enter the start and end location first");
      return;
    }
    const newShowPetrolPumps = !showPetrolPumps;
    setShowPetrolPumps(newShowPetrolPumps);
    if (newShowPetrolPumps && map && alternativeRoutes.length > 0) {
      await fetchPetrolPumps(map, alternativeRoutes[selectedRouteIndex]);
    } else if (map) {
      if (map.getLayer('petrol-pumps')) map.removeLayer('petrol-pumps');
      if (map.getSource('petrol-pumps')) map.removeSource('petrol-pumps');
      setPetrolPumpsMessage("");
    }
  };

  const searchLocations = async (query, isStart) => {
    if (!query || query.length < 2) {
      if (isStart) setStartSuggestions([]);
      else setEndSuggestions([]);
      return;
    }
    const response = await fetch(
      `https://api.tomtom.com/search/2/search/${encodeURIComponent(query)}.json?key=${API_KEY}&limit=5`
    );
    const data = await response.json();
    const suggestions = data.results.map(result => ({
      id: result.id,
      name: result.poi?.name || result.address.freeformAddress,
      address: result.address.freeformAddress,
      position: result.position
    }));
    if (isStart) {
      setStartSuggestions(suggestions);
      setShowStartDropdown(true);
    } else {
      setEndSuggestions(suggestions);
      setShowEndDropdown(true);
    }
  };

  const handleStartInputChange = (e) => {
    setStartInput(e.target.value);
    searchLocations(e.target.value, true);
  };

  const handleEndInputChange = (e) => {
    setEndInput(e.target.value);
    searchLocations(e.target.value, false);
  };

  const handleSelectLocation = (suggestion, isStart) => {
    const location = {
      lat: suggestion.position.lat,
      lon: suggestion.position.lon,
      address: suggestion.address
    };
    if (isStart) {
      setStartLocation(location);
      setStartInput(suggestion.address);
      localStorage.setItem("startLocation", JSON.stringify(location));
      setShowStartDropdown(false);
    } else {
      setEndLocation(location);
      setEndInput(suggestion.address);
      localStorage.setItem("endLocation", JSON.stringify(location));
      setShowEndDropdown(false);
    }
    setRouteCalculated(false);
  };

  const handleKeyDown = (e, isStart) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (isStart) setShowStartDropdown(false);
      else setShowEndDropdown(false);
      handleStartNavigation();
    }
  };

  const handleStartNavigation = async () => {
    setLocationError("");
    if (!startInput || !endInput) {
      setLocationError("Please enter both start and end locations.");
      return;
    }

    setRouteCalculated(false);
    setShowRoutes(false);
    setShowCoordinates(false);
    setShowPetrolPumps(false);
    setSelectedRouteIndex(0);
    setAlternativeRoutes([]);
    setDistance("");
    setEta("");
    setDistanceCovered("0.0");
    setPetrolPumpsMessage("");
    setTripDetails(null);
    if (map) {
      if (map.getLayer('alternative-routes')) map.removeLayer('alternative-routes');
      if (map.getSource('alternative-routes')) map.removeSource('alternative-routes');
      if (map.getLayer('petrol-pumps')) map.removeLayer('petrol-pumps');
      if (map.getSource('petrol-pumps')) map.removeSource('petrol-pumps');
    }

    const searchAndSetLocation = async (query, isStart) => {
      const response = await fetch(
        `https://api.tomtom.com/search/2/search/${encodeURIComponent(query)}.json?key=${API_KEY}&limit=1`
      );
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        const location = {
          lat: data.results[0].position.lat,
          lon: data.results[0].position.lon,
          address: data.results[0].address.freeformAddress
        };
        if (isStart) {
          setStartLocation(location);
          localStorage.setItem("startLocation", JSON.stringify(location));
        } else {
          setEndLocation(location);
          localStorage.setItem("endLocation", JSON.stringify(location));
        }
        return location;
      }
      return null;
    };

    const [newStart, newEnd] = await Promise.all([searchAndSetLocation(startInput, true), searchAndSetLocation(endInput, false)]);
    if (!newStart || !newEnd) {
      setLocationError("Unable to find locations.");
      return;
    }
    setRouteCalculated(true);
    setIsNavigating(true);
  };

  return (
    <div className="navigation-container">
      <div className="navigation-header">
        <h1>NaviGo Navigation</h1>
        <button className="back-button" onClick={() => window.location.href = "/"}>Back to Home</button>
      </div>
      {isLoading ? (
        <div className="loading">Loading map...</div>
      ) : errorMessage ? (
        <div className="error-message">{errorMessage}</div>
      ) : (
        <div className="navigation-content">
          <div className="map-container" ref={mapElement}></div>
          <div className="info-panel">
            <div className="location-textboxes">
              <div className="location-input-group">
                <label htmlFor="start-location">Start Location</label>
                <input
                  id="start-location"
                  type="text"
                  value={startInput}
                  onChange={handleStartInputChange}
                  onKeyDown={(e) => handleKeyDown(e, true)}
                  onFocus={() => startSuggestions.length > 0 && setShowStartDropdown(true)}
                  onBlur={() => setTimeout(() => setShowStartDropdown(false), 200)}
                  placeholder="Enter start location"
                  autoComplete="off"
                />
                {showStartDropdown && startSuggestions.length > 0 && (
                  <div className="location-dropdown">
                    {startSuggestions.map((suggestion) => (
                      <div
                        key={suggestion.id}
                        className="dropdown-item"
                        onClick={() => handleSelectLocation(suggestion, true)}
                      >
                        {suggestion.address}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="location-input-group">
                <label htmlFor="end-location">End Location</label>
                <input
                  id="end-location"
                  type="text"
                  value={endInput}
                  onChange={handleEndInputChange}
                  onKeyDown={(e) => handleKeyDown(e, false)}
                  onFocus={() => endSuggestions.length > 0 && setShowEndDropdown(true)}
                  onBlur={() => setTimeout(() => setShowEndDropdown(false), 200)}
                  placeholder="Enter end location"
                  autoComplete="off"
                />
                {showEndDropdown && endSuggestions.length > 0 && (
                  <div className="location-dropdown">
                    {endSuggestions.map((suggestion) => (
                      <div
                        key={suggestion.id}
                        className="dropdown-item"
                        onClick={() => handleSelectLocation(suggestion, false)}
                      >
                        {suggestion.address}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="start-button-container">
              {isNavigating ? (
                <button className="stop-button" onClick={stopNavigation}>Stop</button>
              ) : (
                <button className="start-button" onClick={handleStartNavigation}>Start</button>
              )}
            </div>
            {locationError && <div className="location-error">{locationError}</div>}
            {routeCalculated && !locationError && (
              <div className={`route-info-details ${showRoutes || showCoordinates || showPetrolPumps ? 'scrollable' : ''}`}>
                {tripDetails ? (
                  <div className="trip-summary">
                    Your trip from "{startLocation?.address || 'Start'}" to "{endLocation?.address || 'End'}" is over. Here are the details:<br/>
                    Distance covered: {tripDetails.distance} km<br/>
                    Time taken: {tripDetails.hours > 0 ? `${tripDetails.hours} hours ` : ''}{tripDetails.minutes} minutes<br/>
                    Traffic: {tripDetails.traffic}
                    {showCoordinates && (
                      <>
                        <br/>
                        Start: "{startLocation?.address || 'Start'}" at {startLocation.lat.toFixed(4)}, {startLocation.lon.toFixed(4)}<br/>
                        End: "{endLocation?.address || 'End'}" at {endLocation.lat.toFixed(4)}, {endLocation.lon.toFixed(4)}
                      </>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="route-info-item">
                      <span className="route-info-label">From:</span>
                      <span className="route-info-value">{startLocation?.address || ''}</span>
                    </div>
                    <div className="route-info-item">
                      <span className="route-info-label">To:</span>
                      <span className="route-info-value">{endLocation?.address || ''}</span>
                    </div>
                    <div className="route-info-item" style={{ display: 'flex', flexWrap: 'wrap' }}>
                      <span className="route-info-label">Distance:</span>
                      <span className="route-info-value" style={{ marginRight: '20px' }}>{distance} km</span>
                      <span className="route-info-label">Distance Covered:</span>
                      <span className="route-info-value">{distanceCovered} km</span>
                    </div>
                    <div className="route-info-item">
                      <span className="route-info-label">Estimated Time of Arrival:</span>
                      <span className="route-info-value">{eta}</span>
                    </div>
                    {showCoordinates && (
                      <div className="route-info-item">
                        <span className="route-info-label">Coordinates:</span>
                        <span className="route-info-value">
                          Start: {startLocation.lat.toFixed(4)}, {startLocation.lon.toFixed(4)}<br/>
                          End: {endLocation.lat.toFixed(4)}, {endLocation.lon.toFixed(4)}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
            <div className="additional-buttons">
              <button className="additional-button" onClick={handleShowRoutes}>
                {showRoutes ? "Hide" : "Show"} all available routes
              </button>
              {showRoutes && alternativeRoutes.length > 1 && (
                <div className="route-options">
                  {alternativeRoutes.slice(0, 3).map((route, index) => (
                    <button
                      key={index}
                      className={`route-option ${index === selectedRouteIndex ? 'selected' : ''}`}
                      onClick={() => handleSelectRoute(index)}
                    >
                      Route {index + 1}: {(route.summary.lengthInMeters / 1000).toFixed(1)} km
                    </button>
                  ))}
                </div>
              )}
              <button className="additional-button" onClick={handleShowCoordinates}>
                {showCoordinates ? "Hide" : "Show"} coordinates
              </button>
              <button className="additional-button" onClick={handleShowPetrolPumps}>
                {showPetrolPumps ? "Hide" : "Show"} Petrol Pumps
              </button>
              {petrolPumpsMessage && (
                <div className="ev-stations-message">{petrolPumps功效Message}</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Navigation;