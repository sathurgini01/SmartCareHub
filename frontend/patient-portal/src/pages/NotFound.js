import React from 'react';

const NotFound = () => {
  return (
    <div className="not-found">
      <div className="card">
        <h1>404 - Page Not Found</h1>
        <p>The page you are looking for doesn't exist.</p>
        <button className="btn btn-primary">
          <a href="/" style={{ color: 'white', textDecoration: 'none' }}>
            Go Back Home
          </a>
        </button>
      </div>
    </div>
  );
};

export default NotFound;