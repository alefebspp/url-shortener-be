import { env } from "@/env";
import { Queue } from "bullmq";

export const incrementClickQueue = new Queue("shortlink-clicks", {
  connection: {
    url: env.REDIS_URL,
  },
});
