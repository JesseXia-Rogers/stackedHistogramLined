============================================
            stackedHistogramLined
               --dev manual--
============================================
Last updated: Feb 2, 2022
Contributors: Ben Xiao, Jesse Xia
Tools/frameworks: Typescript, D3 visual library, Powerbi API
Github repo link: tbd
Reporting to: Jim Zhao, NelyCarmen Codreanu

Description: A multi-purpose chart designed to display historical KPI data and presented in monthly report. 
Designed to provide the same functionality as regular PowerBi chart, with additional features (level indicators, growth selectors, etc.)

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Environment Setup:

requires:
    - node
    - VSCode (recommended)
    - Powerbi (browser version)
    - Edge (most browsers should work)

launch terminal, cd to working directory

install node.js if not already installed 

ensure node is installed, run node -v
    output should be v16.13.2 or higher

ensure npm is installed, run npm -v
    output should be v8.1.2 or higher

run npm install .

should now have access to pbiviz, run pbiviz -V to test
    output should be 4.0.4 or higher


~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Running:

repo should already contain everything needed to run

run pbiviz start to start webserver

go to powerbi, create new report

insert developer visual
(ensure developer mode is on, settings => developer => make sure enable developer mode is checked)

add data