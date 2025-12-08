import { Worker } from "bullmq";
import * as shortLinkRepository from "@/features/short-link/repository/drizzle-short-link.repository";
import { redis } from "@/lib/redis";
import { env } from "@/env";

export const shortLinkClicksWorker = new Worker(
  "shortlink-clicks",
  async (job) => {
    const { id, code } = job.data;

    console.log("WORKER DATA:", job.data);

    const redisKey = `shortlink-clicks:${code}`;

    const clicks = Number(await redis.get(redisKey));

    await shortLinkRepository.update({
      id,
      data: { clicks },
    });

    return { id, clicks };
  },
  {
    concurrency: 10,
    connection: {
      url: env.REDIS_URL,
    },
  }
);

shortLinkClicksWorker.on("ready", () => {
  console.log("🚀 Worker shortlink-clicks READY");
});

shortLinkClicksWorker.on("completed", (job) => {
  console.log("✅ Job concluído:", job.name, job.data);
});

shortLinkClicksWorker.on("failed", (job, err) => {
  console.error("❌ Job falhou:", job?.id, job?.data, err);
});

shortLinkClicksWorker.on("error", (err) => {
  console.error("❌ Worker error:", err);
});
