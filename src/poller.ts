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
  loaderElement.style.display = "block";

  while (true) {
    try {
      // mode: 'no-cors' allows pinging hosts without requiring CORS on the target.
      await fetch(url, { method: "GET", mode: "no-cors" });

      statusElement.innerText = "Redirecting...";
      statusElement.style.color = "#ffffff";
      loaderElement.style.display = "none";
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
