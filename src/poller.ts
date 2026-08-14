// SPDX-FileCopyrightText: 2026 Jacques Supcik <jacques@supcik.net>
//
// SPDX-License-Identifier: MIT

const urlParams = new URLSearchParams(window.location.search);
const targetUrl = urlParams.get("url");
const divWidth = urlParams.get("w") ?? "100%";
const divOffset = urlParams.get("o") ?? "0px";

const urlDisplay = document.getElementById("urlDisplay") as HTMLElement | null;
const statusDiv = document.getElementById("status") as HTMLElement | null;
const loader = document.getElementById("loader") as HTMLElement | null;
const mainContainer = document.getElementsByClassName("outerContainer")[0] as
  HTMLElement | undefined;

if (mainContainer) {
  mainContainer.style.width = divWidth;
  mainContainer.style.marginLeft = divOffset;
}

if (!urlDisplay || !statusDiv || !loader) {
  throw new Error("Missing required DOM elements for poller UI");
}

if (targetUrl) {
  urlDisplay.innerText = targetUrl;
  void startAutomaticMonitoring(targetUrl, statusDiv, loader);
} else {
  urlDisplay.innerText = "Missing '?url=' parameter";
  urlDisplay.style.color = "#ff453a";
  statusDiv.innerText = "Error: Please add ?url= to your address bar.";
}

async function startAutomaticMonitoring(
  url: string,
  statusElement: HTMLElement,
  loaderElement: HTMLElement,
): Promise<void> {
  const pollIntervalMs = 2000;
  let elapsedSeconds = 0;
  const updateElapsedTime = (): void => {
    const minutes = String(Math.floor(elapsedSeconds / 60)).padStart(2, "0");
    const seconds = String(elapsedSeconds % 60).padStart(2, "0");
    statusElement.innerText = `Connecting... ${minutes}:${seconds}`;
  };
  const timerId = window.setInterval(() => {
    elapsedSeconds += 1;
    updateElapsedTime();
  }, 1000);

  updateElapsedTime();
  loaderElement.style.display = "block";

  while (true) {
    try {
      // mode: 'no-cors' allows pinging hosts without requiring CORS on the target.
      await fetch(url, { method: "GET", mode: "no-cors" });

      window.clearInterval(timerId);
      statusElement.innerText = "Redirecting...";
      statusElement.style.color = "#34d399";
      loaderElement.style.display = "none";
      await new Promise<void>((resolve) => {
        window.setTimeout(resolve, 2000);
      });
      window.location.href = url;
      break;
    } catch {
      // Keep polling until the target becomes reachable.
    }

    await new Promise<void>((resolve) => {
      window.setTimeout(resolve, pollIntervalMs);
    });
  }
}
