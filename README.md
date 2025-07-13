# GoRecon 🔍

A minimalist web-based reconnaissance dashboard for subdomain enumeration and port scanning.

## Overview

GoRecon is a lightweight Go application that provides a web interface for running reconnaissance scans using industry-standard tools like `subfinder` and `httpx`. It offers real-time logging and a clean dashboard to monitor scan progress.

## Features

- 🌐 **Web Dashboard** - Clean, responsive interface
- 🔍 **Subdomain Enumeration** - Powered by subfinder
- 🌐 **Port Scanning** - HTTP/HTTPS detection with httpx
- ⚡ **Real-time Logging** - Live scan progress updates
- 🎯 **Configurable Threading** - Adjustable scan intensity
- 📊 **Results Display** - Organized scan output

## Prerequisites

### Required Tools
- [subfinder](https://github.com/projectdiscovery/subfinder) - Subdomain enumeration
- [httpx](https://github.com/projectdiscovery/httpx) - HTTP probe

### Installation
```bash
# Install subfinder
go install -v github.com/projectdiscovery/subfinder/v2/cmd/subfinder@latest

# Install httpx
go install -v github.com/projectdiscovery/httpx/cmd/httpx@latest
```

## Quick Start

### Local Development
```bash
# Clone repository
git clone <repository-url>
cd GoRecon

# Install dependencies
go mod tidy

# Run application
go run gorecon.go
```

### Docker Deployment
```bash
# Build image
docker build -t gorecon .

# Run container
docker run -p 8080:8080 gorecon
```

## Usage

1. **Access Dashboard**: Navigate to `http://localhost:8080`
2. **Configure Scan**:
   - Enter target domain
   - Set thread count (1-100)
3. **Start Scan**: Click run to begin reconnaissance
4. **Monitor Progress**: View real-time logs and results

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Main dashboard |
| `/run` | GET | Start reconnaissance scan |
| `/logs` | GET | Retrieve scan logs |
| `/data` | GET | Get scan results |

### Run Scan
```
GET /run?domain=example.com&threads=50
```

## Architecture

```
GoRecon/
├── gorecon.go          # Main application
├── go.mod              # Dependencies
├── Dockerfile          # Container config
├── templates/
│   └── index.html      # Dashboard template
└── static/
    └── app.js          # Frontend logic
```

## Scan Process

1. **Subdomain Discovery**: Uses subfinder with specified thread count
2. **HTTP Probing**: httpx scans ports 80,443,3000,8080
3. **Result Processing**: Filters and formats output
4. **Dashboard Update**: Real-time progress display

## Configuration

### Environment Variables
- `PORT` - Server port (default: 8080)
- `GIN_MODE` - Gin framework mode (debug/release)

### Scan Parameters
- **Threads**: 1-100 (recommended: 20-50)
- **Ports**: 80,443,3000,8080
- **Timeout**: 10 seconds
- **Retries**: 2 attempts

## Security Considerations

⚠️ **Important**: This tool is for authorized security testing only.

- Use only on domains you own or have permission to test
- Respect rate limits and legal boundaries
- Monitor resource usage during scans
- Implement proper access controls in production

## Development

### Project Structure
```
├── gorecon.go          # Main application logic
├── go.mod              # Go module dependencies
├── go.sum              # Dependency checksums
├── Dockerfile          # Container configuration
├── templates/          # HTML templates
│   └── index.html      # Dashboard template
└── static/             # Static assets
    └── app.js          # Frontend JavaScript
```

### Dependencies
- **Gin**: Web framework
- **subfinder**: Subdomain enumeration
- **httpx**: HTTP probing

### Building
```bash
# Development
go run gorecon.go

# Production build
go build -o gorecon gorecon.go

# Docker build
docker build -t gorecon .
```

## Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open pull request

## License

[Add your license here]

---

**Built with ❤️ using Go and Gin** 