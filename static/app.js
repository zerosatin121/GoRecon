document.getElementById("scanForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const domain = document.getElementById("domainInput").value.trim();
    const threads = document.getElementById("threadsInput").value.trim();
    if (!domain || !threads) return;

    fetch(`/run?domain=${encodeURIComponent(domain)}&threads=${threads}`)
        .then(() => {
            document.getElementById("statusText").innerText = `⏳ Scanning: ${domain}...`;
            document.getElementById("domainInput").disabled = true;
            document.getElementById("threadsInput").disabled = true;
        });
});

function updateLogs() {
    fetch("/logs")
        .then(res => res.text())
        .then(text => {
            document.getElementById("log-box").innerText = text;
        });
}

function updateData() {
    fetch("/data")
        .then(res => res.json())
        .then(data => {
            document.getElementById("threadStat").innerText = data.Threads || "--";
            document.getElementById("statusStat").innerText = data.Scanning ? "Scanning" : "Idle";

            document.getElementById("statusText").innerText = data.Scanning
                ? `⏳ Scanning: ${data.Domain}...`
                : `✅ Done: ${data.Domain} @ ${data.Timestamp}`;

            document.getElementById("domainInput").disabled = data.Scanning;
            document.getElementById("threadsInput").disabled = data.Scanning;

            document.getElementById("subList").innerHTML = data.Subdomains.length
                ? data.Subdomains.map(s => `<div>${s}</div>`).join("")
                : `<div class="text-gray-500">No subdomains found.</div>`;

            document.getElementById("httpxList").innerHTML = data.HttpxOutput.length
                ? data.HttpxOutput.map(line => `<div>${line}</div>`).join("")
                : `<div class="text-gray-500">No live hosts found.</div>`;
        });
}

// ⏱ Auto-refresh logs & data
setInterval(() => {
    updateLogs();
    updateData();
}, 2000);
