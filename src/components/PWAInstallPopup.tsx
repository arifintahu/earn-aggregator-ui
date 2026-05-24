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
        <div style={{
            position: 'fixed', bottom: 16, left: 16, right: 16,
            zIndex: 9999, display: 'flex', justifyContent: 'center',
        }}>
            <div style={{
                width: '100%', maxWidth: 400, padding: 16,
                background: 'var(--bg-1, #131a1f)',
                border: '1px solid var(--border-2)',
                borderRadius: 'var(--radius-2)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.7)',
            }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    {/* App icon */}
                    <div style={{
                        flexShrink: 0, width: 44, height: 44, borderRadius: 12,
                        background: 'color-mix(in oklch, var(--accent-1) 18%, transparent)',
                        border: '1px solid color-mix(in oklch, var(--accent-1) 30%, transparent)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <svg width={22} height={22} fill="none" stroke="var(--accent-1)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                            <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-1)', margin: 0 }}>Install Earn Aggregator</p>
                        <p style={{ fontSize: 12, color: 'var(--text-3)', margin: '4px 0 0' }}>Add to your home screen for quick access to the best stablecoin yields.</p>
                    </div>

                    <button
                        onClick={handleDismiss}
                        aria-label="Dismiss"
                        style={{ all: 'unset', flexShrink: 0, cursor: 'pointer', color: 'var(--text-4)', padding: 4 }}
                    >
                        <svg width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" viewBox="0 0 24 24">
                            <path d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    <button onClick={handleDismiss} className="ea-btn" style={{ flex: 1, justifyContent: 'center' }}>
                        Not now
                    </button>
                    <button onClick={handleInstall} className="ea-btn ea-btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                        Install
                    </button>
                </div>
            </div>
        </div>
    );
}
