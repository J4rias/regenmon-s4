'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { LanguageProvider } from '@/components/language-provider';

export default function Providers({ children }: { children: React.ReactNode }) {
    const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

    console.log("[v0] Privy App ID:", appId, "Type:", typeof appId, "Length:", appId?.length);

    const isValidAppId = appId && appId.trim().length > 0 && appId !== 'undefined';

    console.log("[v0] Is valid app ID:", isValidAppId);

    if (isValidAppId) {
        return (
            <LanguageProvider>
                <PrivyProvider
                    appId={appId}
                    config={{
                        loginMethods: ['email', 'google'],
                        appearance: {
                            theme: 'light',
                            accentColor: '#676FFF',
                            logo: '/images/regenmon-logo.png',
                        },
                        embeddedWallets: {
                            ethereum: {
                                createOnLogin: 'users-without-wallets',
                            },
                        },
                    }}
                >
                    {children}
                </PrivyProvider>
            </LanguageProvider>
        );
    }

    console.log("[v0] Rendering without Privy provider");
    return (
        <LanguageProvider>
            {children}
        </LanguageProvider>
    );
}
