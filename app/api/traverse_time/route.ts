
import { NextRequest, NextResponse } from "next/server";
import { Client, TravelMode } from "@googlemaps/google-maps-services-js";


const getData = async (start: string, end: string, mode: TravelMode) => {
  const client = new Client({});
  const response = await client.distancematrix({
    params: {
      origins: [start],
      destinations: [end],
      mode,
      key: process.env.GOOGLE_MAPS_API_KEY!
    },
  });
  return response.data;
}

export async function GET(
  req: NextRequest
) {
  const { searchParams } = req.nextUrl;
  const start = searchParams.get('start') || "Angel, London";
  const end = searchParams.get('end') || "Tower Bridge, London";
  const mode: TravelMode = searchParams.get('mode') as TravelMode || TravelMode.transit;
  const endpointData = await getData(start, end, mode);
  return NextResponse.json(endpointData);
}