const PlantCard = ({ noteCount }) => {
  // Scale plant based on note count
  const stemHeight = Math.min(200, 80 + noteCount * 15);
  const leafPairs = Math.min(5, Math.max(1, Math.floor(noteCount / 2)));

  const leaves = [];
  for (let i = 0; i < leafPairs; i++) {
    const y = stemHeight - 20 - i * 28;
    // Left leaf
    leaves.push(
      <path
        key={`l-${i}`}
        d={`M60 ${y} C${38 - i * 3} ${y - 22}, ${28 - i * 2} ${y - 44}, 60 ${y - 18}`}
        fill="#6a9f5b"
        stroke="#4a7c59"
        strokeWidth="1.5"
        opacity="0.9"
      />
    );
    // Right leaf
    leaves.push(
      <path
        key={`r-${i}`}
        d={`M60 ${y - 12} C${82 + i * 3} ${y - 34}, ${92 + i * 2} ${y - 56}, 60 ${y - 30}`}
        fill="#6a9f5b"
        stroke="#4a7c59"
        strokeWidth="1.5"
        opacity="0.9"
      />
    );
  }

  const svgHeight = stemHeight + 30;

  return (
    <div className="grid-card card-plant">
      <div className="plant-illustration">
        <svg className="sprout-svg" viewBox={`0 0 120 ${svgHeight}`} width="120" height={svgHeight}>
          {/* Stem */}
          <line
            x1="60" y1={svgHeight}
            x2="60" y2={svgHeight - stemHeight}
            stroke="#4a7c59"
            strokeWidth="5"
            strokeLinecap="round"
          />
          {/* Leaves */}
          {leaves}
        </svg>
        <div className="soil-mound" />
      </div>
    </div>
  );
};

export default PlantCard;
