import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

export const useTherapists = () => {
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTherapists = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.specialization) params.append('specialization', filters.specialization);
      if (filters.language) params.append('language', filters.language);
      if (filters.maxFee) params.append('maxFee', filters.maxFee);
      if (filters.rating) params.append('rating', filters.rating);

      const res = await api.get(`/therapists?${params.toString()}`);
      setTherapists(res.data);
    } catch (err) {
      console.error('Error fetching therapists:', err);
      setError(err.response?.data?.message || 'Failed to fetch therapist directory.');
    } finally {
      setLoading(false);
    }
  }, []);

  return { therapists, loading, error, fetchTherapists };
};
