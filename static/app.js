//step 1 :handles scans  button press (Form Submit)
document.getElementById("scanForm").addEventListener("submit", (e) => {
    e.preventDefault();// stop page frome reloading .....

    //step 2 ...
    //get two value from the input fields [domain abd threads no]
    const domain = document.getElementById("domainInput").value.trim();//domains
    const threads = document.getElementById("threadsInput").value.trim();//threads no

    // step 3 : basic input check...
    if (!domain || !threads) return;


    //step 4 : send scan request to go backend ..
    //js sends this to go lang....
    fetch(`/run?domain=${encodeURIComponent(domain)}&threads=${threads}`)
        .then(() => {
            //updated the ui scanning status .
            document.getElementById("statusText").innerText = `⏳ Scanning: ${domain}...`; // sets status of tool is scanning in the ui.
            document.getElementById("domainInput").disabled = true; // hides the doamin input .
            document.getElementById("threadsInput").disabled = true; // hodes theads input.
        });
});

// step 6 : fets logs from go and updates every 2 sc in ui.
function updateLogs() {
    fetch("/logs")
        .then(res => res.text())// logs come back as plain text.
        .then(text => {
            //updates the log in terminal ui
            document.getElementById("log-box").innerText = text;
        });
}

//step 7:: fetch scan results and sttatus.
function updateData() {
    fetch("/data")
        .then(res => res.json()) //json response : domain  threads , subdoains etc..
        .then(data => {
            //update neofetch-style banner value
            document.getElementById("threadStat").innerText = data.Threads || "--";
            document.getElementById("statusStat").innerText = data.Scanning ? "Scanning" : "Idle";
//update main status below the form
            document.getElementById("statusText").innerText = data.Scanning
                ? `⏳ Scanning: ${data.Domain}...`
                : `✅ Done: ${data.Domain} @ ${data.Timestamp}`;
//enable/disable inputs based on scan status 
            document.getElementById("domainInput").disabled = data.Scanning;
            document.getElementById("threadsInput").disabled = data.Scanning;
// render subdomains in the subfinder box 
            document.getElementById("subList").innerHTML = data.Subdomains.length
                ? data.Subdomains.map(s => `<div>${s}</div>`).join("")
                : `<div class="text-gray-500">No subdomains found.</div>`;
// render httpx results in its respective box
            document.getElementById("httpxList").innerHTML = data.HttpxOutput.length
                ? data.HttpxOutput.map(line => `<div>${line}</div>`).join("")
                : `<div class="text-gray-500">No live hosts found.</div>`;
        });
}

// ⏱ Auto-refresh logs & data
setInterval(() => {
    updateLogs(); //refresh log message
    updateData(); // refresh scan data 
}, 2000);// every 2 seconds.
