import Redis from "ioredis";
import { REDIS_URL } from "@/config";

export default new Redis(REDIS_URL);
