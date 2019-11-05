import { Document, Schema, model} from "mongoose";
import { GeolocationObj } from "../interfaces";

export interface GeolocationModel extends GeolocationObj, Document {}

export const GeolocationSchema = new Schema({
    city: String,
    country_code: String,
    country_name: String,
    domain: String,
    ip: String,
    latitude: Number,
    longitude: Number,
    region_code: String,
    region_name: String,
    type: String,
    zip: String,
});

const Geolocation = model<GeolocationModel>('Geolocation', GeolocationSchema);
export default Geolocation;
