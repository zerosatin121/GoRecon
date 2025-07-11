# 🛠 Stage 1: Builder — compiles Go binary & installs tools
FROM golang:1.24 AS builder
WORKDIR /app

# Copy your application code
COPY . .

# Install subfinder & httpx — built statically
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \
    go install github.com/projectdiscovery/subfinder/v2/cmd/subfinder@latest && \
    go install github.com/projectdiscovery/httpx/cmd/httpx@latest

# Build your gorecon binary statically for Alpine
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \
    go build -o gorecon


# 🚀 Stage 2: Runtime — minimal Alpine with only needed tools
FROM alpine:latest
WORKDIR /app

# Copy gorecon binary from build stage
COPY --from=builder /app/gorecon .

# Copy subfinder and httpx binaries into container PATH
COPY --from=builder /go/bin/subfinder /usr/local/bin/
COPY --from=builder /go/bin/httpx /usr/local/bin/

# Copy any static assets like templates
COPY templates ./templates

# Ensure gorecon is executable
RUN chmod +x gorecon

EXPOSE 8080
CMD ["./gorecon"]
