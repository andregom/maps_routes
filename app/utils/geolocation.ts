import { rejects } from "assert";
import { error } from "console";
import { resolve } from "path";

export function getCurrentPosition(
    options?: PositionOptions
): Promise<{ lat: number; lng: number }> {
    return new Promise((resolve, rejects) => {
        navigator.geolocation.getCurrentPosition(
            (position) => 
                resolve({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                }),
            (error) => rejects(error),
            options
        )
    })
}