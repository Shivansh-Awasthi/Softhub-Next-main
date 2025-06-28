import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // Fetch all paid PS4 games from backend
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/apps/category/ps4`, {
            headers: { 'Content-Type': 'application/json' },
            cache: 'no-store',
        });
        if (!res.ok) {
            return NextResponse.json({ games: [], message: 'Failed to fetch games' }, { status: 500 });
        }
        const data = await res.json();
        // Filter only paid games (if not already filtered by backend)
        const paidGames = (data.apps || data.games || []).filter(game => game.isPaid);
        return NextResponse.json({ games: paidGames });
    } catch (e) {
        return NextResponse.json({ games: [], message: 'Error fetching games' }, { status: 500 });
    }
}
