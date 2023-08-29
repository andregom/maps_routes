import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const text = url.searchParams.get("text");
  const response = await fetch(`http://host.docker.internal:3000/places?text=${text}`, {
    next: {
        revalidate: 600,
    },
  });

    console.log(response?.url);
    console.log(response?.status);
    return NextResponse.json(await response.json());
}