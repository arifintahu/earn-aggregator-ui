'use client';

import { useState, useEffect } from 'react';

interface HealthStatus {
    healthy: boolean;
    loading: boolean;
    error: string | null;
}

export function useApiHealth() {
    const [status, setStatus] = useState<HealthStatus>({
        healthy: false,
        loading: true,
        error: null,
    });

    useEffect(() => {
        const checkHealth = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_EARN_API_HOST}/health`);
                setStatus({
                    healthy: response.ok,
                    loading: false,
                    error: response.ok ? null : 'API unhealthy',
                });
            } catch {
                setStatus({
                    healthy: false,
                    loading: false,
                    error: 'Failed to reach API',
                });
            }
        };

        checkHealth();

        // Check health every 30 seconds
        const interval = setInterval(checkHealth, 30000);
        return () => clearInterval(interval);
    }, []);

    return status;
}
