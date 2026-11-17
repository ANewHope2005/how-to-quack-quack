# Tiny local web server for How to Quack Quack (no installation needed on Windows 10/11)
$port = 8765
$root = $PSScriptRoot
$mime = @{'.html'='text/html; charset=utf-8';'.css'='text/css; charset=utf-8';'.js'='text/javascript; charset=utf-8';'.json'='application/json; charset=utf-8';'.md'='text/markdown; charset=utf-8';'.woff2'='font/woff2';'.woff'='font/woff';'.ttf'='font/ttf';'.svg'='image/svg+xml';'.ico'='image/x-icon'}
$l = New-Object System.Net.HttpListener
$l.Prefixes.Add("http://localhost:$port/")
try { $l.Start() } catch { Write-Host "Port $port is busy. Close the other copy of this window and try again."; pause; exit }
Start-Process "http://localhost:$port/"
Write-Host "How to Quack Quack is running at http://localhost:$port/"
Write-Host "To stop: close this window (or press Ctrl+C)."
while ($l.IsListening) {
  $c = $l.GetContext()
  try {
    $p = [Uri]::UnescapeDataString($c.Request.Url.AbsolutePath)
    if ($p -eq '/') { $p = '/index.html' }
    $full = [IO.Path]::GetFullPath((Join-Path $root ($p.TrimStart('/') -replace '/','\')))
    if ($full.StartsWith($root) -and (Test-Path $full -PathType Leaf)) {
      $b = [IO.File]::ReadAllBytes($full)
      $ext = [IO.Path]::GetExtension($full).ToLower()
      $c.Response.ContentType = $(if ($mime[$ext]) { $mime[$ext] } else { 'application/octet-stream' })
      $c.Response.Headers.Add('Cache-Control','no-cache')
      $c.Response.ContentLength64 = $b.Length
      $c.Response.OutputStream.Write($b, 0, $b.Length)
    } else { $c.Response.StatusCode = 404 }
  } catch {}
  $c.Response.Close()
}
