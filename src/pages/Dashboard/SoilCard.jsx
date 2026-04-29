const SoilCard = ({ totalSeeds, density, streak }) => {
  // Health: 100% if streak > 5, drops 20% per missed day below 5
  const health = Math.max(0, Math.min(100, streak >= 5 ? 100 : streak * 20));

  return (
    <div className="grid-card card-soil">
      <h2 className="card-title">Soil</h2>
      <hr className="card-divider" />
      <div className="soil-stats">
        <p className="soil-stat">
          <strong>Total Seeds:</strong> <span>{totalSeeds}</span>
        </p>
        <p className="soil-stat">
          <strong>Density:</strong> <span>{density}</span>
        </p>
        <p className="soil-stat">
          <strong>Streak:</strong> <span>{streak}</span>
        </p>
      </div>
      <div className="soil-health">
        <svg
          className="heart-icon"
          viewBox="0 0 24 24"
          width="28"
          height="28"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
        <span className="health-percentage">{health}%</span>
      </div>
    </div>
  );
};

export default SoilCard;
