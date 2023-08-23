import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
//   const response = NextResponse.next();
  const url = request.nextUrl;
  const text = url.searchParams.get("text");
  let cache: any;
  await fetch(`http://host.docker.internal:3000/places?text=${text}`, {
    method: "GET",
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
    next: {
        revalidate: 60,
    },
  })
    .then((response) => {
      console.log("Event sent", response);
      cache = response;
    })
    .catch((error) => {
      console.log("Fetching error: ", error);
      cache =  error
    });

    console.log(cache?.url);
    console.log(cache?.status);
    return NextResponse.json(await cache.json());
}