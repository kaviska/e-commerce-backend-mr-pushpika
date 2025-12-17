import { useState, useEffect } from 'react';

interface LocationState {
    city: string | null;
    country: string | null;
    loading: boolean;
    error: string | null;
}

export const useLocation = () => {
    const [location, setLocation] = useState<LocationState>({
        city: null,
        country: null,
        loading: true,
        error: null,
    });

    useEffect(() => {
        if (!navigator.geolocation) {
            setLocation(prev => ({ ...prev, loading: false, error: 'Geolocation not supported' }));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords;
                    // Using OpenStreetMap Nominatim API (Free, no key required for low usage)
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                    );
                    const data = await response.json();

                    const city = data.address.city || data.address.town || data.address.village || data.address.suburb;
                    const country = data.address.country_code?.toUpperCase();

                    setLocation({
                        city,
                        country,
                        loading: false,
                        error: null,
                    });
                } catch (error) {
                    setLocation(prev => ({ ...prev, loading: false, error: 'Failed to fetch address' }));
                }
            },
            (error) => {
                setLocation(prev => ({ ...prev, loading: false, error: error.message }));
            }
        );
    }, []);

    return location;
};
