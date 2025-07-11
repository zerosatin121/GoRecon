// main.go
package main

import (
    "bufio"
    "fmt"
    "log"
    "net/http"
    "os/exec"
    "strconv"
    "strings"
    "sync"
    "time"

    "github.com/gin-gonic/gin"
)

type ReconData struct {
    Domain      string
    Threads     int
    Subdomains  []string
    HttpxOutput []string
    Timestamp   string
    Scanning    bool
}

var data ReconData
var mu sync.Mutex
var logs []string
var logMu sync.Mutex

func appendLog(line string) {
    log.Println(line)
    logMu.Lock()
    defer logMu.Unlock()
    entry := fmt.Sprintf("%s ➜ %s", time.Now().Format("15:04:05"), line)
    logs = append(logs, entry)
    if len(logs) > 500 {
        logs = logs[len(logs)-500:]
    }
}

func main() {
    r := gin.Default()
    r.LoadHTMLGlob("templates/*")
    r.Static("/static", "./static")

    r.GET("/", func(c *gin.Context) {
        c.HTML(http.StatusOK, "index.html", nil)
    })
    r.GET("/run", runHandler)
    r.GET("/logs", logsHandler)
    r.GET("/data", dataHandler)

    appendLog("🌐 Gorecon dashboard ready at http://127.0.0.1:8080")
    r.Run(":8080")
}

func runHandler(c *gin.Context) {
    domain := c.Query("domain")
    threadStr := c.Query("threads")
    if domain == "" || threadStr == "" {
        c.String(http.StatusBadRequest, "Missing domain or threads")
        return
    }

    threads, err := strconv.Atoi(threadStr)
    if err != nil || threads < 1 {
        c.String(http.StatusBadRequest, "Invalid thread count")
        return
    }

    mu.Lock()
    data = ReconData{Domain: domain, Threads: threads, Scanning: true}
    mu.Unlock()

    appendLog(fmt.Sprintf("🎯 Starting scan for %s with %d threads", domain, threads))
    go runRecon(domain, threads)
    c.Status(http.StatusOK)
}

func logsHandler(c *gin.Context) {
    logMu.Lock()
    defer logMu.Unlock()
    c.String(http.StatusOK, strings.Join(logs, "\n"))
}

func dataHandler(c *gin.Context) {
    mu.Lock()
    defer mu.Unlock()
    c.JSON(http.StatusOK, data)
}

func runRecon(domain string, threads int) {
    var subs, httpxLines []string

    cmd := exec.Command("subfinder", "-d", domain, "-silent", "-t", fmt.Sprint(threads))
    subOut, err := cmd.StdoutPipe()
    if err != nil {
        appendLog("❌ subfinder pipe error: " + err.Error())
        return
    }
    if err := cmd.Start(); err != nil {
        appendLog("❌ Failed to start subfinder: " + err.Error())
        return
    }

    scanner := bufio.NewScanner(subOut)
    for scanner.Scan() {
        subs = append(subs, scanner.Text())
    }
    cmd.Wait()
    appendLog(fmt.Sprintf("📦 Subfinder found %d subdomains", len(subs)))

    httpx := exec.Command("httpx",
        "-t", fmt.Sprint(threads),
        "-p", "80,443,3000,8080", "-sc", "-ip", "-title", "-server",
        "-follow-redirects", "-random-agent", "-timeout", "10", "-retries", "2", "-silent")

    stdin, _ := httpx.StdinPipe()
    stdout, _ := httpx.StdoutPipe()
    httpx.Start()

    go func() {
        for _, sub := range subs {
            stdin.Write([]byte(sub + "\n"))
        }
        stdin.Close()
    }()

    sc := bufio.NewScanner(stdout)
    for sc.Scan() {
        httpxLines = append(httpxLines, sc.Text())
    }
    httpx.Wait()
    appendLog(fmt.Sprintf("🌐 httpx identified %d live hosts", len(httpxLines)))

    mu.Lock()
    data = ReconData{
        Domain:      domain,
        Threads:     threads,
        Subdomains:  subs,
        HttpxOutput: httpxLines,
        Timestamp:   time.Now().Format("02 Jan 2006 15:04:05"),
        Scanning:    false,
    }
    mu.Unlock()

    appendLog("✅ Scan finished for " + domain)
}
