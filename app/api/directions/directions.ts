import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const url = new URL(request.url);
    const queryParams = new URLSearchParams({
        originId: url.searchParams.get('originId') as string,
        destinationId: url.searchParams.get('destinationId') as string,
    });
    const response = await fetch(`http://localhost:3000/directions?${queryParams.toString()}`, {
        next: {
            revalidate: 3000,
        }
    });
    return NextResponse.json(await response.json());
}