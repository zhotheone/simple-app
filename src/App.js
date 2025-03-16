import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
  const [ratings, setRatings] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [filter, setFilter] = useState({});
  const [userId, setUserId] = useState(null);

  // Initialize Telegram Web App
  useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      const initData = window.Telegram.WebApp.initDataUnsafe;
      if (initData?.user) {
        setUserId(initData.user.id.toString());
      }
    }
  }, []);

  // Memoize fetchRatings to prevent recreation on every render
  const fetchRatings = useCallback(async () => {
    try {
      const response = await axios.get('https://simple-app-murex.vercel.app/api/ratings', {
        params: {
          userId,
          filter: JSON.stringify(filter),
          page: currentPage,
        },
      });
      setRatings(response.data.ratings);
      setTotalPages(response.data.totalPages);
      setTotalCount(response.data.totalCount);
    } catch (error) {
      console.error('Error fetching ratings:', error);
    }
  }, [userId, filter, currentPage]); // Dependencies of fetchRatings

  // Fetch ratings when userId, filter, or page changes
  useEffect(() => {
    if (userId) {
      fetchRatings();
    }
  }, [userId, filter, currentPage, fetchRatings]); // Include fetchRatings in dependency array

  const handleFilterChange = (key, value) => {
    setFilter((prev) => ({
      ...prev,
      [key]: value || undefined, // Remove filter if value is empty
    }));
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  if (!userId) {
    return <div>Loading...</div>;
  }

  return (
    <div className="app">
      <h1>Your Ratings ({totalCount})</h1>

      {/* Filter Controls */}
      <div className="filters">
        <select onChange={(e) => handleFilterChange('type', e.target.value)}>
          <option value="">All Types</option>
          <option value="movie">Movies</option>
          <option value="series">Series</option>
        </select>
        <input
          type="number"
          placeholder="Min Rating"
          min="1"
          max="10"
          onChange={(e) => handleFilterChange('minRating', parseInt(e.target.value, 10))}
        />
        <input
          type="number"
          placeholder="Year"
          onChange={(e) => handleFilterChange('year', parseInt(e.target.value, 10))}
        />
        <input
          type="text"
          placeholder="Genre"
          onChange={(e) => handleFilterChange('genre', e.target.value)}
        />
      </div>

      {/* Ratings List */}
      {ratings.length === 0 ? (
        <p>No ratings found. Start rating movies and series!</p>
      ) : (
        <div className="ratings-list">
          {ratings.map((rating) => (
            <div key={rating._id} className="rating-card">
              <h3>{rating.title}</h3>
              <p>Type: {rating.type}</p>
              <p>Rating: {rating.rating}/10</p>
              <p>Year: {rating.year}</p>
              <p>Genre: {rating.genre}</p>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default App;