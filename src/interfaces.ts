import { Request, Response } from "express"

export interface PromisifiedRequestHandler {
    (req: Request, res: Response): Promise<void>;
}

export interface PassportExtendedRequest extends Request {
    user: User;
}

export interface User {
    id: number;
    email: string;
    password: string;
}

export type GeolocationType = "IPv4" | "IPv6";
export interface GeolocationDto {
    ip: string;
    type: GeolocationType;
    country_name: string;
    country_code: string;
    region_code: string;
    region_name: string;
    city: string;
    zip: string;
    latitude: number;
    longitude: number;
}

export interface GeolocationObj extends GeolocationDto {
    domain: string;
}
