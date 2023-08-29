import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const url = request.nextUrl;
    const queryParams = new URLSearchParams({
        originId: url.searchParams.get('originId') as string,
        destinationId: url.searchParams.get('destinationId') as string,
    });
    console.log(`http://host.docker.internal:3000/directions?${queryParams.toString()}`);
    const response = await fetch(`http://host.docker.internal:3000/directions?${queryParams.toString()}`, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
        next: {
            revalidate: 600,
        }
    });
    console.log(response.status);
    return NextResponse.json(await response.json());
}