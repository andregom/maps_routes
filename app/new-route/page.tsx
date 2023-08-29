'use client'

import { FormEvent, useEffect, useRef, useState } from 'react';
import { useMap } from '../hooks/useMaps';
import { DirectionsResponseData, FindPlaceFromTextResponseData } from '@googlemaps/google-maps-services-js';

export function NewRoutePage() {

    const mapContainerRef = useRef<HTMLDivElement>(null);
    const map = useMap(mapContainerRef);

    const [directionsResponseData, setdirectionsResponseData] = useState<DirectionsResponseData & { request: any }>();
    let hasANewRouteLoopStarted = false;

    async function searchPlaces(event: FormEvent) {
        event.preventDefault();
        const source = document.querySelector<HTMLInputElement>("input[name=source_place]")?.value;
        const destination = document.querySelector<HTMLInputElement>("input[name=destination_place]")?.value;

        const [sourceResponse, destinationResponse] = await Promise.all([
            fetch(`http://localhost:3001/api/places?text=${source}`),
            fetch(`http://localhost:3001/api/places?text=${destination}`)
        ]);

        console.table(sourceResponse);
        console.table(destinationResponse);
        
        const [sourcePlace, destinationPlace]: FindPlaceFromTextResponseData[] = await Promise.all([
            sourceResponse.json(),
            destinationResponse.json()
        ]);

        console.table(sourcePlace);
        console.table(destinationPlace);
        
        if (sourcePlace.status !== "OK") {
            console.error(sourcePlace);
            alert("Não foi possível encontrar o local de origem");
            return;
        }

        if (destinationPlace.status !== "OK") {
            console.error(destinationPlace);
            alert("Não foi possível encontrar o local de destino");
            return;
        }

        const queryParams = new URLSearchParams({
            originId: sourcePlace.candidates[0].place_id as string,
            destinationId: destinationPlace.candidates[0].place_id as string
        });

        const directionsResponse = await fetch(`http://localhost:3001/api/directions?${queryParams.toString()}`);
        console.log(`http://localhost:3001/api/directions?${queryParams.toString()}`);
        const directionsResponseData: DirectionsResponseData & { request: any } =
            await directionsResponse.json();
        setdirectionsResponseData(directionsResponseData);

        map?.removeAllRoutes();
        map?.addRouteWithIcons({
            routeId: "1",
            startMarkerOptions: {
                position: directionsResponseData.routes[0].legs[0].start_location,
            },
            endMarkerOptions: {
                position: directionsResponseData.routes[0].legs[0].end_location,
            },
            carMarkerOptions: {
                position: directionsResponseData.routes[0].legs[0].start_location,
            },
            directionsResponseData,
        });
        hasANewRouteLoopStarted = true;
        moveCar(directionsResponseData?.routes[0].legs[0].start_location ?? { lat: 0, lng: 0 });
    }

    const sleep = (interval: number) => new Promise(resolve => { setTimeout(resolve, interval) });

    async function createRoute() {
        hasANewRouteLoopStarted = true;
        const response = await fetch('http://localhost:3000/routes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: `${directionsResponseData?.routes[0].legs[0].start_address} - ${directionsResponseData?.routes[0].legs[0].end_address}`,
                source_id: directionsResponseData?.request.origin.place_id,
                destination_id: directionsResponseData?.request.destination.place_id,
            })
        });

        const route = await response.json();
        hasANewRouteLoopStarted = false;
        const { steps } = route.directions.routes[0].legs[0];

        while (!hasANewRouteLoopStarted) {
            for (const step of steps) {
                if (hasANewRouteLoopStarted) {
                    break;
                }

                console.log(directionsResponseData?.routes[0].legs[0].start_address);
                console.table(step);
                let pause = step.distance.value;
                pause = pause > 950 ? 950 : pause;

                await sleep(pause);
                moveCar(step.start_location);
                await sleep(pause);
                moveCar(step.end_location);

            }
        }
        hasANewRouteLoopStarted = false;
    }


    function moveCar(point: google.maps.LatLngLiteral) {
        map?.moveCar("1", {
            lat: point.lat,
            lng: point.lng,
        })
    }

    useEffect(() => {
        moveCar(directionsResponseData?.routes[0].legs[0].start_location ?? { lat: 0, lng: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [directionsResponseData])

    return (
        <div className="flex flex-row h-full" onSubmit={searchPlaces}>
            <div>
                <h1>Nova Rota</h1>
                <form className="flex flex-col">
                    <input name="source_place" placeholder="origem" />
                    <input name="destination_place" placeholder="destino" />
                    <button
                        type="submit"
                        className='bg-gray-200 p-2 m-5 rounded'
                    >Pesquisar</button>
                </form>
                {directionsResponseData && <ul>
                    <li>Origem: {directionsResponseData?.routes[0].legs[0].start_address}</li>
                    <li>Destino: {directionsResponseData?.routes[0].legs[0].end_address}</li>
                    <li>Distância: {directionsResponseData?.routes[0].legs[0].distance.text}</li>
                    <li>Duração: {directionsResponseData?.routes[0].legs[0].duration.text}</li>
                </ul>}
                <button
                    type="submit"
                    className="bg-blue-500 m-3 p-3 ml-10 text-white rounded"
                    onClick={createRoute}
                >Start Route</button>
            </div>
            <div id="map" className="h-full w-full" ref={mapContainerRef}></div>
        </div>
    )
}
export default NewRoutePage;