$port = 3000
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$prefix = "http://localhost:$port/"

$mimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".json" = "application/json"
    ".xml"  = "application/xml"
    ".txt"  = "text/plain"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".gif"  = "image/gif"
    ".svg"  = "image/svg+xml"
    ".ico"  = "image/x-icon"
    ".webp" = "image/webp"
    ".pdf"  = "application/pdf"
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($prefix)

try {
    $listener.Start()
} catch {
    Write-Host "ERROR: Could not start server on port $port." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Start-Process $prefix

Write-Host ""
Write-Host "  MIYA MIYA - Local Server Running" -ForegroundColor Yellow
Write-Host "  URL: $prefix" -ForegroundColor Cyan
Write-Host "  Press Ctrl+C to stop." -ForegroundColor DarkGray
Write-Host ""

while ($listener.IsListening) {
    try {
        $context  = $listener.GetContext()
        $request  = $context.Request
        $response = $context.Response
        $urlPath  = [System.Uri]::UnescapeDataString($request.Url.AbsolutePath)
        if ($urlPath -eq "/" -or $urlPath -eq "") { $urlPath = "/index.html" }
        $filePath = Join-Path $root ($urlPath.TrimStart("/").Replace("/", "\"))
        $filePath = [System.IO.Path]::GetFullPath($filePath)
        if (-not $filePath.StartsWith($root)) {
            $response.StatusCode = 403
            $response.Close()
            continue
        }
        if (Test-Path $filePath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $contentType = if ($mimeTypes.ContainsKey($ext)) { $mimeTypes[$ext] } else { "application/octet-stream" }
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $response.StatusCode = 200
            $response.ContentType = $contentType
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
            Write-Host "  200  $urlPath" -ForegroundColor Green
        } else {
            $bodyText = "<html><body style='font-family:sans-serif;padding:2rem;background:#F5F0E8'><h2 style='color:#17130F'>404 Not Found</h2><p><code>" + $urlPath + "</code></p><a href='/' style='color:#B08D57'>Back to Home</a></body></html>"
            $bytes = [System.Text.Encoding]::UTF8.GetBytes($bodyText)
            $response.StatusCode = 404
            $response.ContentType = "text/html; charset=utf-8"
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
            Write-Host "  404  $urlPath" -ForegroundColor Red
        }
        $response.OutputStream.Close()
    } catch [System.Net.HttpListenerException] {
        break
    } catch {
        Write-Host "  ERR  $_" -ForegroundColor DarkRed
        try { $response.StatusCode = 500; $response.Close() } catch {}
    }
}

$listener.Stop()
Write-Host "Server stopped." -ForegroundColor Yellow
