import axios from "axios";
import { env } from "@/config";

const { BookingEngineUrl } = env();

const bookingEngineUrlHttp = axios.create({
  baseURL: BookingEngineUrl,
});

export default bookingEngineUrlHttp;
