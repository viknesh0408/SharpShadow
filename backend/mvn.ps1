if (-not $env:JAVA_HOME -or -not (Test-Path "$env:JAVA_HOME\bin\java.exe")) {
    $env:JAVA_HOME = "C:\Program Files\Microsoft\jdk-21.0.12.101-hotspot"
}
$env:JAVA_HOME = $env:JAVA_HOME.TrimEnd('\')
& "$PSScriptRoot\mvnw.cmd" $args
