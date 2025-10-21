import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');

    if (!query) {
        return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    try {
        // Simulate fetching search results from a database or external API
        const results = await fetchSearchResults(query);
        return NextResponse.json(results);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch search results' }, { status: 500 });
    }
}

async function fetchSearchResults(query: string) {
    // Placeholder for actual search logic
    // This should be replaced with real data fetching logic
    return [
        { id: 1, title: 'Result 1', description: 'Description for result 1' },
        { id: 2, title: 'Result 2', description: 'Description for result 2' },
        { id: 3, title: 'Result 3', description: 'Description for result 3' },
    ];
}