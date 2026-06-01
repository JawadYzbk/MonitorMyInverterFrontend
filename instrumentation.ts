declare global {
  var pingIntervalInitialized: boolean | undefined;
}

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    if (global.pingIntervalInitialized) {
      return;
    }

    if (process.env.DISABLE_PING_WORKER === "true") {
      console.log(`[Ping Worker] Disabled via environment variable.`);
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

  // Wait 1 minute after boot before first check to let servers fully initialize
  setTimeout(() => {
    runPingLifecycle(frontendUrl);

    // Check and potentially ping every 5 minutes (300,000 ms)
    setInterval(() => {
      runPingLifecycle(frontendUrl);
    }, 5 * 60 * 1000);
  }, 60 * 1000);
}

function runPingLifecycle(frontendUrl: string) {
  // Get current hour in UTC
  const currentUtcHour = new Date().getUTCHours();

  // Sleep Window: 8 PM (20:00) to 5 AM (05:00) UTC
  // Solar monitoring is off-peak during this night window.
  // Pausing pings allows Render Free tier to spin down and save computing hours.
  const isSleepWindow = currentUtcHour >= 20 || currentUtcHour < 5;

  if (isSleepWindow) {
    console.log(`[Ping Worker] Inside sleep window (Current UTC hour: ${currentUtcHour}). Skipping keep-alive ping to conserve computing hours.`);
    return;
  }

  pingServices(frontendUrl);
}

async function pingServices(frontendUrl: string) {
  try {
    const frontendPingUrl = `${frontendUrl.replace(/\/$/, "")}/api/ping`;

    console.log(`[Ping Worker] Sending keep-alive ping...`);

    // Ping frontend and consume response to prevent memory/socket leaks
    fetch(frontendPingUrl)
      .then(async (res) => {
        // Crucial: Consume response body to free socket and stream memory allocations in Node.js
        await res.text();
        console.log(`[Ping Worker] Frontend ping response: ${res.status}`);
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : String(err);
        console.error(`[Ping Worker] Frontend ping failed:`, message);
      });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[Ping Worker] Error scheduling pings:`, message);
  }
}
