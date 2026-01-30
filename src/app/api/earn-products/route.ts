import { NextResponse } from 'next/server';

const EXTERNAL_API_URL = 'https://earn-aggregator.vercel.app/api/v1/earn-products';

export async function GET() {
    try {
        const response = await fetch(EXTERNAL_API_URL, {
            headers: {
                'Content-Type': 'application/json',
            },
            // Cache for 5 minutes to reduce API calls
            next: { revalidate: 300 },
        });

        if (!response.ok) {
            throw new Error(`API responded with status: ${response.status}`);
        }

        const data = await response.json();

        return NextResponse.json(data, {
            headers: {
                'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
            },
        });
    } catch (error) {
        console.error('Failed to fetch earn products:', error);
        return NextResponse.json(
            { error: 'Failed to fetch earn products' },
            { status: 500 }
        );
    }
}
