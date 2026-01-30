'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { PortfolioPosition } from '@/types';

const STORAGE_KEY = 'earn-aggregator-portfolio';

interface PortfolioContextType {
    positions: PortfolioPosition[];
    addPosition: (position: Omit<PortfolioPosition, 'id' | 'timestamp'>) => void;
    updatePosition: (id: string, updates: Partial<Omit<PortfolioPosition, 'id'>>) => void;
    removePosition: (id: string) => void;
    clearPortfolio: () => void;
}

const PortfolioContext = createContext<PortfolioContextType | null>(null);

function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function PortfolioProvider({ children }: { children: React.ReactNode }) {
    const [positions, setPositions] = useState<PortfolioPosition[]>([]);
    const [isHydrated, setIsHydrated] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                setPositions(JSON.parse(stored));
            }
        } catch (err) {
            console.error('Failed to load portfolio from localStorage:', err);
        }
        setIsHydrated(true);
    }, []);

    // Save to localStorage on changes
    useEffect(() => {
        if (isHydrated) {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
            } catch (err) {
                console.error('Failed to save portfolio to localStorage:', err);
            }
        }
    }, [positions, isHydrated]);

    const addPosition = useCallback((position: Omit<PortfolioPosition, 'id' | 'timestamp'>) => {
        const newPosition: PortfolioPosition = {
            ...position,
            id: generateId(),
            timestamp: Date.now(),
        };
        setPositions(prev => [...prev, newPosition]);
    }, []);

    const updatePosition = useCallback((id: string, updates: Partial<Omit<PortfolioPosition, 'id'>>) => {
        setPositions(prev =>
            prev.map(p => (p.id === id ? { ...p, ...updates } : p))
        );
    }, []);

    const removePosition = useCallback((id: string) => {
        setPositions(prev => prev.filter(p => p.id !== id));
    }, []);

    const clearPortfolio = useCallback(() => {
        setPositions([]);
    }, []);

    return (
        <PortfolioContext.Provider
            value={{
                positions,
                addPosition,
                updatePosition,
                removePosition,
                clearPortfolio,
            }}
        >
            {children}
        </PortfolioContext.Provider>
    );
}

export function usePortfolio() {
    const context = useContext(PortfolioContext);
    if (!context) {
        throw new Error('usePortfolio must be used within a PortfolioProvider');
    }
    return context;
}
