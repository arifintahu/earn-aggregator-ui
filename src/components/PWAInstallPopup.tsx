'use client';

import { useEffect, useState } from 'react';

const DISMISSED_KEY = 'pwa-install-dismissed';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallPopup() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (localStorage.getItem(DISMISSED_KEY)) return;

        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            // Show popup after a short delay so it doesn't appear instantly on load
            setTimeout(() => setVisible(true), 2000);
        };

        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            localStorage.setItem(DISMISSED_KEY, '1');
        }
        setVisible(false);
        setDeferredPrompt(null);
    };

    const handleDismiss = () => {
        localStorage.setItem(DISMISSED_KEY, '1');
        setVisible(false);
    };

    if (!visible) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 z-50 flex justify-center animate-fade-in">
            <div className="glass-card p-4 w-full max-w-sm">
                <div className="flex items-start gap-3">
                    {/* App icon */}
                    <div className="shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-crypto-green/30 to-crypto-green/10 flex items-center justify-center">
                        <svg className="w-7 h-7 text-crypto-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>

                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-white">Install Earn Aggregator</p>
                        <p className="text-xs text-gray-400 mt-0.5">Add to your home screen for quick access to the best stablecoin yields.</p>
                    </div>

                    {/* Close button */}
                    <button
                        onClick={handleDismiss}
                        className="shrink-0 text-gray-500 hover:text-white transition-colors"
                        aria-label="Dismiss"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex gap-2 mt-3">
                    <button onClick={handleDismiss} className="flex-1 btn-secondary text-sm py-2">
                        Not now
                    </button>
                    <button onClick={handleInstall} className="flex-1 btn-primary text-sm py-2">
                        Install
                    </button>
                </div>
            </div>
        </div>
    );
}
