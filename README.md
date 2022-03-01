# Multipurpose Custom PBI Column Chart
aka stackedHistogramLined

A multi-purpose chart designed to display historical KPI data presented in monthly report. 
Designed to provide the same functionality as a regular PowerBi chart, with additional features (level indicators, growth selectors, etc.).

# Environment Setup
- Ensure node.js is installed https://nodejs.org/en/
- From terminal, run `npm install .` in project directory
- Check pbiviz version, running command `pbiviz -V` should output 4.0.4 or higher

# Running
- `pbiviz start` to start server
- Go to powerbi, create new report
- Insert developer visual (ensure developer mode is on, settings => developer => make sure enable developer mode is checked)
- Add data
