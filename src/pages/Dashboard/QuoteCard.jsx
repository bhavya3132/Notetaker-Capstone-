import { useState, useEffect } from 'react';

const QUOTES = [
  "The roots of education are bitter, but the fruit is sweet. — Aristotle",
  "An investment in knowledge pays the best interest. — Benjamin Franklin",
  "The mind is not a vessel to be filled, but a fire to be kindled. — Plutarch",
  "Knowledge speaks, but wisdom listens. — Jimi Hendrix",
  "The only true wisdom is in knowing you know nothing. — Socrates",
  "Live as if you were to die tomorrow. Learn as if you were to live forever. — Gandhi",
  "In the middle of difficulty lies opportunity. — Albert Einstein",
  "The more that you read, the more things you will know. — Dr. Seuss",
  "It is not that I'm so smart. But I stay with the questions much longer. — Einstein",
  "To know that we know what we know, and to know that we do not know what we do not know, that is true knowledge. — Copernicus",
];

const QuoteCard = ({ userName }) => {
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    // Cycle quote every 5 hours based on system clock
    const getQuoteIndex = () => {
      return Math.floor(Date.now() / (5 * 60 * 60 * 1000)) % QUOTES.length;
    };

    setQuoteIndex(getQuoteIndex());

    // Check every minute if the 5-hour window has changed
    const interval = setInterval(() => {
      setQuoteIndex(getQuoteIndex());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid-card card-quote">
      <div className="quote-avatar">
        <span className="avatar-label">{userName}</span>
      </div>
      <p className="quote-text">{QUOTES[quoteIndex]}</p>
    </div>
  );
};

export default QuoteCard;
