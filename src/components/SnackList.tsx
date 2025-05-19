import React, { useEffect, useState } from 'react'; // Adicione React aqui
import { fetchSnacks } from '../services/api';
import { SnackItem } from '../types/snacks';

export const SnackList = () => {
  const [snacks, setSnacks] = useState<SnackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSnacks = async () => {
      try {
        const data = await fetchSnacks();
        setSnacks(data);
      } catch (err) {
        setError('Failed to load snacks. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadSnacks();
  }, []);

  if (loading) return <div className="loading">Loading snacks...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="snack-grid">
      {snacks.map((snack) => (
        <div key={snack.id} className={`snack-card ${!snack.available ? 'unavailable' : ''}`}>
          <img src={snack.image} alt={snack.name} />
          <h3>{snack.name}</h3>
          <p>{snack.description}</p>
          <span>${snack.price.toFixed(2)}</span>
          {!snack.available && (
            <div className="unavailable-badge">Indisponível</div>
          )}
        </div>
      ))}
    </div>
  );
};