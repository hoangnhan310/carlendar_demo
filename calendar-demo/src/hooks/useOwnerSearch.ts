/**
 * useOwnerSearch Hook - Mock implementation
 */

import { useState, useEffect } from 'react';
import apiClient from '../services/apiClient';
import type { OwnerOption } from '../types/api';

export const useOwnerSearch = () => {
  const [term, setTerm] = useState('');
  const [results, setResults] = useState<OwnerOption[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [hasQuery, setHasQuery] = useState(false);

  useEffect(() => {
    if (!term || term.length < 2) {
      setResults([]);
      setHasQuery(false);
      return;
    }

    setHasQuery(true);
    setIsFetching(true);

    const timeoutId = setTimeout(async () => {
      try {
        const response = await apiClient.get('/owners/search', {
          params: { term }
        });
        setResults(response.data.data || []);
      } catch (error) {
        console.error('Error searching owners:', error);
        setResults([]);
      } finally {
        setIsFetching(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [term]);

  return {
    term,
    setTerm,
    results,
    isFetching,
    hasQuery
  };
};
