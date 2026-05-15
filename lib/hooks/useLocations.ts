import { useState, useEffect } from 'react';
import { getLocationHierarchy } from '../api';

export interface LocationTaluka {
  id: number;
  name: string;
}

export interface LocationDistrict {
  id: number;
  name: string;
  talukas: LocationTaluka[];
}

export interface LocationState {
  id: number;
  name: string;
  districts: LocationDistrict[];
}

export function useLocations() {
  const [hierarchy, setHierarchy] = useState<LocationState[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoading(true);
        const data = await getLocationHierarchy();
        setHierarchy(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch locations');
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  const getStates = () => {
    return hierarchy.map(s => s.name);
  };

  const getDistricts = (stateNames: string[]) => {
    const districts = new Set<string>();
    hierarchy.forEach(state => {
      if (stateNames.includes(state.name)) {
        state.districts.forEach(d => districts.add(d.name));
      }
    });
    return Array.from(districts);
  };

  const getTalukas = (districtNames: string[]) => {
    const talukas = new Set<string>();
    hierarchy.forEach(state => {
      state.districts.forEach(d => {
        if (districtNames.includes(d.name)) {
          d.talukas.forEach(t => talukas.add(t.name));
        }
      });
    });
    return Array.from(talukas);
  };

  return {
    hierarchy,
    loading,
    error,
    getStates,
    getDistricts,
    getTalukas
  };
}
