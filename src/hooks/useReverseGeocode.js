import { useState, useCallback, useRef } from 'react';
import { reverseGeocode } from '../utils/geocode';

/**
 * 反地理编码 Hook
 * 自动根据经纬度获取城市和区信息
 * @returns {Object} { locationInfo, loading, error, fetchLocationInfo }
 */
export function useReverseGeocode() {
  const [locationInfo, setLocationInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const lastFetchRef = useRef(0);

  const fetchLocationInfo = useCallback(async (lat, lng) => {
    // Nominatim 限制：每秒最多 1 次请求
    const now = Date.now();
    if (now - lastFetchRef.current < 1000) {
      await new Promise(resolve => setTimeout(resolve, 1000 - (now - lastFetchRef.current)));
    }
    lastFetchRef.current = Date.now();

    setLoading(true);
    setError(null);

    try {
      const result = await reverseGeocode(lat, lng);
      setLocationInfo(result);
      return result;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { locationInfo, loading, error, fetchLocationInfo };
}
