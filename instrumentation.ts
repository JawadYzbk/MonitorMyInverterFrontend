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
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "https://monitormyinverter.onrender.com";

  console.log(`[Ping Worker] Starting background ping worker.`);
  console.log(`[Ping Worker] Frontend URL: ${frontendUrl}`);
  console.log(`[Ping Worker] Backend URL: ${backendUrl}`);

  // Wait 1 minute after boot before first ping to let servers fully initialize
  setTimeout(() => {
    pingServices(frontendUrl, backendUrl);

    // Ping every 5 minutes (300,000 ms) to keep Render Free tier awake
    setInterval(() => {
      pingServices(frontendUrl, backendUrl);
    }, 5 * 60 * 1000);
  }, 60 * 1000);
}

async function pingServices(frontendUrl: string, backendUrl: string) {
  try {
    const frontendPingUrl = `${frontendUrl.replace(/\/$/, "")}/api/ping`;
    const backendPingUrl = `${backendUrl.replace(/\/$/, "")}/ping`;

    console.log(`[Ping Worker] Sending keep-alive pings...`);

    // Ping frontend
    fetch(frontendPingUrl)
      .then((res) => console.log(`[Ping Worker] Frontend ping response: ${res.status}`))
      .catch((err: any) => console.error(`[Ping Worker] Frontend ping failed:`, err.message));

    // Ping backend
    fetch(backendPingUrl)
      .then((res) => console.log(`[Ping Worker] Backend ping response: ${res.status}`))
      .catch((err: any) => console.error(`[Ping Worker] Backend ping failed:`, err.message));
  } catch (err: any) {
    console.error(`[Ping Worker] Error scheduling pings:`, err.message);
  }
}
