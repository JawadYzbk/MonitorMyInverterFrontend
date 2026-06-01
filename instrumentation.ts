declare global {
  var pingIntervalInitialized: boolean | undefined;
}

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    if (global.pingIntervalInitialized) {
      return;
    }
    global.pingIntervalInitialized = true;

    startPingWorker();
  }
}

function startPingWorker() {
  const frontendUrl = process.env.RENDER_EXTERNAL_URL || "https://monitormyinverterfrontend.onrender.com";

  console.log(`[Ping Worker] Starting background ping worker.`);
  console.log(`[Ping Worker] Frontend URL: ${frontendUrl}`);

  // Wait 1 minute after boot before first ping to let servers fully initialize
  setTimeout(() => {
    pingServices(frontendUrl);

    // Ping every 5 minutes (300,000 ms) to keep Render Free tier awake
    setInterval(() => {
      pingServices(frontendUrl);
    }, 5 * 60 * 1000);
  }, 60 * 1000);
}

async function pingServices(frontendUrl: string) {
  try {
    const frontendPingUrl = `${frontendUrl.replace(/\/$/, "")}/api/ping`;

    console.log(`[Ping Worker] Sending keep-alive pings...`);

    // Ping frontend
    fetch(frontendPingUrl)
      .then((res) => console.log(`[Ping Worker] Frontend ping response: ${res.status}`))
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : String(err);
        console.error(`[Ping Worker] Frontend ping failed:`, message);
      });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[Ping Worker] Error scheduling pings:`, message);
  }
}
