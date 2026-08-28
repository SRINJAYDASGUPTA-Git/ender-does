#!/usr/bin/env bash
set -e

RESULTS_DIR="allure-results"
REPORT_DIR="allure-report"
PDF_DIR="reports"

rm -rf "$RESULTS_DIR" "$REPORT_DIR"
mkdir -p "$PDF_DIR"

dotnet test ender-does-backend-NET.Tests.csproj \
    -- xUnit.ReporterSwitch=allure

DOTNET_RESULTS="bin/Debug/net10.0/allure-results"

if [ ! -d "$DOTNET_RESULTS" ]; then
    echo "❌ Allure results were not generated."
    exit 1
fi

cp -r "$DOTNET_RESULTS/." "$RESULTS_DIR/"

allure generate --single-file $RESULTS_DIR --clean -o $REPORT_DIR

allure open allure-report

echo "✅ Allure HTML report generated."

# PDF generation goes here

echo "📄 Report: $REPORT_DIR"