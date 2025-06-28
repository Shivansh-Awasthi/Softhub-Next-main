import { NextResponse } from 'next/server';

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    if (!email) {
        return NextResponse.json({ user: null, message: 'Email is required' }, { status: 400 });
    }
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/by-email?email=${encodeURIComponent(email)}`, {
            headers: { 'Content-Type': 'application/json' },
            cache: 'no-store',
        });
        if (!res.ok) {
            return NextResponse.json({ user: null, message: 'User not found' }, { status: 404 });
        }
        const data = await res.json();
        return NextResponse.json({ user: data.user || null });
    } catch (e) {
        return NextResponse.json({ user: null, message: 'Error fetching user' }, { status: 500 });
    }
}
