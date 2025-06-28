import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/recent`, {
            headers: { 'Content-Type': 'application/json' },
            cache: 'no-store',
        });
        if (!res.ok) {
            return NextResponse.json({ users: [], message: 'Failed to fetch users' }, { status: 500 });
        }
        const data = await res.json();
        return NextResponse.json({ users: data.users || [] });
    } catch (e) {
        return NextResponse.json({ users: [], message: 'Error fetching users' }, { status: 500 });
    }
}
