# Custom PBI Column Chart
**aka stackedHistogramLined**

A multi-purpose chart designed to display historical KPI data presented in monthly report. 
Designed to provide the same functionality as a regular PowerBi chart, with additional features (level indicators, growth selectors, etc.).

# Usage
Heyo!😃 If you're here, we're assuming that you have some development experience and are looking to use the code for some purpose. If you only need the chart, you can download the latest version by checking [stackedHistogramLined/dist](https://github.com/JesseXia-Rogers/stackedHistogramLined/tree/master/dist). You can find the user manual there as well.

The bulk of the visual is written in Typescript - while having a thorough understanding of the language will help, it won't be enough, since you'll need to understand both the PBI API and D3.js to do any sort of meaningful development. Fortunately, we have lots of helpful resources on both of those topics. In addition, having a working knowledge of Power BI will likely be helpful.

The code has also (in my opinion😄) been thoroughly commented, though it may still be difficult to understand for those with no technical background.

# Environment Setup
- Ensure node.js is installed (https://nodejs.org/en/)
- Go to the Microsoft Power BI documentation (https://docs.microsoft.com/en-us/power-bi/developer/visuals/environment-setup?tabs=windows#create-and-install-a-certificate), and follow their instructions to setup a certificate. Will be helpful to follow their instructions for setting up Power BI service for development as well.
- From terminal, run `npm i .` in project directory

# Running
- `pbiviz start` to start server
- Go to powerbi, create new report
- Insert developer visual (ensure developer mode is on, settings => developer => make sure enable developer mode is checked)
- Add data

Alternatively you can just import the custom visual directly, though using the built-in developer visual is generally more effective.

# Updating Code
- We're assuming that you already know how to use version control (if not, youtube has lots of tutorials 🤓). Since both myself and the original dev of this chart will be gone by the time any future devs are reading this, feel free to just copy the code and make a new repo. 
- When you're exporting the code to a file, run `pbiviz package` if it's not automatically updating when you run `pbiviz start`.
- Might sound kinda obvious but having the console open is super helpful during development, lets you print things etc.

# Resources
- PowerBI Visuals Documentation https://docs.microsoft.com/en-us/power-bi/developer/visuals/
- PowerBI Dev Camp https://www.powerbidevcamp.net/
- Typescript Handbook https://www.typescriptlang.org/docs/handbook/intro.html
- D3 documentation https://d3js.org/
- D3 videos https://www.youtube.com/watch?v=TOJ9yjvlapY&list=RDCMUCSJbGtTlrDami-tDGPUV9-w&start_radio=1&rv=TOJ9yjvlapY&t=0


Good luck! 😄
