@echo off
if "%JAVA_HOME%"=="" if exist "C:\Program Files\Microsoft\jdk-21.0.12.101-hotspot\bin\java.exe" set "JAVA_HOME=C:\Program Files\Microsoft\jdk-21.0.12.101-hotspot"
if "%JAVA_HOME:~-1%"=="\" set "JAVA_HOME=%JAVA_HOME:~0,-1%"
"%~dp0backend\mvnw.cmd" -f "%~dp0backend\pom.xml" %*
