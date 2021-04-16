'use strict'

import { Numeric } from 'd3-array';
import * as dp from './dataProcess';
import * as Html from './html';
import * as Interfaces from './interfaces';

import * as d3 from "d3";
import powerbi from "powerbi-visuals-api";
import { VisualSettings } from "./settings";
import ISelectionManager = powerbi.extensibility.ISelectionManager;

// Interfaces

export class BarChart {
    private _data: Interfaces.BarData[];
    private _settings: VisualSettings;
    private _dataPointSeries: Interfaces.DataPointSerie[];
    private _selectionManager: ISelectionManager;
    dimension: Interfaces.Dimension;
    container: HTMLElement = null;
    width: number;
    height: number;
    axisSpacing: number = 0;

    constructor(
        data: Interfaces.BarData[],
        parent: HTMLElement,
        settings: VisualSettings,
        dataPointSeries: Interfaces.DataPointSerie[],
        selectionManager: ISelectionManager) {

        this._data = data;
        this._settings = settings;
        
        // format data based on settings
        this.formatData();

        this._dataPointSeries = dataPointSeries;
        this._selectionManager = selectionManager;

        // initialize barchart dimensions
        this.dimension = {
            height: parent.offsetHeight,
            width: parent.offsetWidth
        };

        // set chart's parent to parent
        this.container = Html.createHTMLElement({
            element: 'div',
            attributes: [{ attr: 'class', value: 'visual-container' }]
        });

        // append the container to the parent element
        // remove previous children
        while (parent.firstChild != null) {
            parent.removeChild(parent.firstChild);
        }

        parent.appendChild(this.container);

        this.CreateVisualContainer();
    }

    public formatData() {
        if (this._settings.AxisSettings.XAxisCleanToggle) {
            // front tail
            let start = 1;
            let length = 0;
            for (let idx = 1; idx < this._data.length; ++idx) {
                let barData: Interfaces.BarData = this._data[idx];
                let valueSum = barData.data.reduce((a, b) => a + (b.value ?? 0) , 0);
                valueSum = isNaN(valueSum) ? 0 : valueSum;

                if (valueSum == 0) {
                    ++length;
                }
                else {
                    break;
                }
            }
            this._data.splice(start, length);

            // back tail
            for (let idx = this._data.length - 1; idx >= 1; --idx) {
                let barData: Interfaces.BarData = this._data[idx];
                let valueSum = barData.data.reduce((a, b) => a + (b.value ?? 0) , 0);
                valueSum = isNaN(valueSum) ? 0 : valueSum;

                if (valueSum == 0) {
                    this._data.pop();
                }
                else {
                    break;
                }
            }
            
            return;
        }
    }

    public CreateVisualContainer() {
        // checking for container existence
        if (this.container == null) {
            console.error('Chat container data is missing.')
            return;
        }

        // create title
        let Title = document.createElement('div');
        if (this._settings.LabelSettings.TitleToggle) {
            Title.setAttribute('class', 'title');
            Title.style.width = '100%';
            Title.innerHTML = this._settings.LabelSettings.TitleText;
            this.container.appendChild(Title);

            // change settings depending on legend potion in settings
            console.log(1)
            if (this._settings.AxisSettings.LegendPosition == 'bottom') { 
                Title.style.paddingBottom = '15px'; 
            }
        }

        // create legend container
        let LegendContainer = document.createElement('div');
        LegendContainer.setAttribute('class', 'legend-container');
        LegendContainer.style.width = '100%';
        LegendContainer.style.color = this._settings.LabelSettings.LegendColor;
        LegendContainer.style.fontFamily = this._settings.LabelSettings.LegendFontFamily;
        LegendContainer.style.fontSize = this._settings.LabelSettings.LegendFontSize + 'px';
        LegendContainer.innerHTML = 'Legend:'
        this.container.appendChild(LegendContainer);
        // change settings depending on legend potion in settings
        if (this._settings.AxisSettings.LegendPosition == 'top') { 
            LegendContainer.style.paddingBottom = '20px'; 
        }

        // append series to legend
        this._dataPointSeries.forEach((dataPoint, idx) => {
            let legend = document.createElement('div');
            legend.setAttribute('class', 'legend');
            LegendContainer.appendChild(legend);

            let legendColor = document.createElement('div');
            legendColor.setAttribute('class', 'legend-color');
            legendColor.style.height = 10 + 'px';
            legendColor.style.width = 10 + 'px';
            legendColor.style.backgroundColor = dataPoint.seriesColor;
            legend.appendChild(legendColor);
            
            let legendValue = document.createElement('div');
            legendValue.setAttribute('class', 'legend-value');
            legendValue.innerHTML = dataPoint.value.toString();
            legend.appendChild(legendValue);

            // add selection event listen to legend
            legend.addEventListener("click", () => {
                // handle click event to apply correspond selection
                this._selectionManager.select(dataPoint.selection);
            });
        });

        // get height of title and legend
        let TitleHeightSpace = Title.offsetHeight;
        let LegendHeightSpace = LegendContainer.offsetHeight;

        // create chart container
        let ChartContainer = document.createElement('div');
        ChartContainer.setAttribute('class', 'chart-container');
        ChartContainer.style.width = '100%';
        ChartContainer.style.height = (this.dimension.height - 15 - 
            (TitleHeightSpace + LegendHeightSpace)) + 'px';
        
        // change order depending on legend potion in settings
        if (this._settings.AxisSettings.LegendPosition == 'top') {
            this.container.appendChild(ChartContainer);
        }
        else {
            this.container.insertBefore(ChartContainer, LegendContainer);
        }
        
        // set axis spacing
        this.axisSpacing = Math.min(
            40,
            (ChartContainer.offsetWidth / 15)
        );
        
        // create chart container
        this.CreateChartContainer(ChartContainer);
    }

    public CreateChartContainer(ChartContainer: HTMLElement) {        
        // create y axis container
        let YAxisContainer = document.createElement('div');
        YAxisContainer.setAttribute('class', 'y-axis-container axis');
        YAxisContainer.style.height = ChartContainer.offsetHeight + 'px';
        YAxisContainer.style.width = this.axisSpacing + 'px';
        YAxisContainer.style.color = this._settings.LabelSettings.YAxisColor;
        YAxisContainer.style.fontFamily = this._settings.LabelSettings.YAxisFontFamily;
        YAxisContainer.style.fontSize = this._settings.LabelSettings.YAxisFontSize + 'px';
        ChartContainer.appendChild(YAxisContainer);
        
        // create y axis label
        let YAxisLabel = document.createElement('div');
        YAxisLabel.setAttribute('class', 'y-axis-label');
        YAxisLabel.innerHTML = this._settings.LabelSettings.YAxisText;
        YAxisContainer.appendChild(YAxisLabel);

        // create zero axis
        let ZeroAxis = document.createElement('div');
        ZeroAxis.setAttribute('class', 'zero-axis-container axis');
        ZeroAxis.style.height = (this.axisSpacing  * 1.5) + 'px';
        ZeroAxis.style.width = this.axisSpacing + 'px';
        // zero axis visual settings are shared with y axis
        ZeroAxis.style.color = this._settings.LabelSettings.YAxisValueColor;
        ZeroAxis.style.fontFamily = this._settings.LabelSettings.YAxisValueFontFamily;
        ZeroAxis.style.fontSize = this._settings.LabelSettings.YAxisValueFontSize + 'px';
        // append zero axis to y axis container
        YAxisContainer.appendChild(ZeroAxis);

        // create zero axis label
        let ZeroAxisLabel = document.createElement('div');
        ZeroAxisLabel.setAttribute('class', 'zero-axis-label');
        ZeroAxisLabel.innerHTML = '0'
        ZeroAxis.appendChild(ZeroAxisLabel);

        ZeroAxisLabel.style.right = (ZeroAxisLabel.offsetWidth * 1.5) +'px';

        // create bar container
        let DataContainer = document.createElement('div');
        DataContainer.setAttribute('class', 'data-container');
        DataContainer.style.height = (ChartContainer.offsetHeight - (this.axisSpacing  * 1.5)) + 'px';
        DataContainer.style.width  = (ChartContainer.offsetWidth - this.axisSpacing) + 'px';
        ChartContainer.appendChild(DataContainer);

        // create x Axis
        let XAxisContainer = document.createElement('div');
        XAxisContainer.setAttribute('class', 'x-axis-container axis');
        // set x axis container height to y axis width
        XAxisContainer.style.height = (this.axisSpacing  * 1.5) + 'px';
        XAxisContainer.style.width = (ChartContainer.offsetWidth - this.axisSpacing) + 'px';
        XAxisContainer.style.color = this._settings.LabelSettings.XAxisColor;
        XAxisContainer.style.fontFamily = this._settings.LabelSettings.XAxisFontFamily;
        XAxisContainer.style.fontSize = this._settings.LabelSettings.XAxisFontSize + 'px';
        ChartContainer.appendChild(XAxisContainer);

        // create x axis label
        let XAxisLabel = document.createElement('div');
        XAxisLabel.setAttribute('class', 'x-axis-label');
        XAxisLabel.innerHTML = this._settings.LabelSettings.XAxisText;
        XAxisContainer.appendChild(XAxisLabel);

        // create data Container
        this.CreateDataContainer(DataContainer, XAxisContainer);
    }

    public CreateDataContainer(DataContainer: HTMLElement, XAxisContainer: HTMLElement) {
        // tick count from settings
        let yAxisTickCount = this._settings.AxisSettings.YAxisCount;
        // get max y value
        if (this._settings.AxisSettings.YMaxValue < dp.DataNumeric.topRounded && 
            this._settings.AxisSettings.YMaxValue != 0) {
            // custom y max value can't be smaller than top rounded for best results
            DataContainer.innerHTML = `
                Y Max Value cannot be samller than: ${dp.DataNumeric.topRounded}.
                Set to 0 for default value.
            `;
            return;
        }
        let yMaxValue: number = Math.max(dp.DataNumeric.topRounded, this._settings.AxisSettings.YMaxValue);

        // step interval is the interval value between ticks
        let stepInterval = yMaxValue / (yAxisTickCount - 1);
        // amount of intervals required
        let stepIntervalCount = Math.ceil(dp.DataNumeric.topRounded / stepInterval);
        // get height and width of axis container
        let height = DataContainer.offsetHeight;
        let width = DataContainer.offsetWidth;  

        // get y axis height per interval
        let yAxisContainerHeight = height / stepIntervalCount;
        // get pixels per one unit
        let yAxisNormalizedHeight = yAxisContainerHeight / stepInterval; 

        // create y axis
        for (let count = stepIntervalCount; count >= 1; --count) {
            // create y axis induvidual interval
            let yAxisTickContainer = document.createElement('div');
            yAxisTickContainer.setAttribute('class', 'y-axis-tick');
            yAxisTickContainer.style.height = yAxisContainerHeight + 'px';
            yAxisTickContainer.style.width = '100%';
            DataContainer.appendChild(yAxisTickContainer);

            // create horizontal grid line
            let horizontalGrid = document.createElement('div');
            horizontalGrid.setAttribute('class', 'horz-grid-line');
            horizontalGrid.style.width = '100%';
            yAxisTickContainer.appendChild(horizontalGrid);

            // create y tick value
            let yAxisTickValue = document.createElement('div');
            yAxisTickValue.setAttribute('class', 'y-axis-tick-value');
            yAxisTickValue.style.color = this._settings.LabelSettings.YAxisValueColor;
            yAxisTickValue.style.fontFamily = this._settings.LabelSettings.YAxisValueFontFamily;
            yAxisTickValue.style.fontSize = this._settings.LabelSettings.YAxisValueFontSize + 'px';
            yAxisTickValue.innerHTML = (count * stepInterval).toString();
            horizontalGrid.appendChild(yAxisTickValue);

            let yAxisTickValueWidth = yAxisTickValue.offsetWidth;
            let yAxisTickValueHeight = yAxisTickValue.offsetHeight;
            yAxisTickValue.style.left = (-1 * (yAxisTickValueWidth + 3)) + 'px';
            yAxisTickValue.style.top = (yAxisTickValueHeight / -2) + 'px';
        }

        // get axis space (spacing between bars)
        const xAxisSpacing = this._settings.AxisSettings.XAxisBarWhiteSpace;
        // get number of intervals (number of bars)
        let xAxisCount = this._data.length;
        // total spacing needed for spacing
        let xAxisTotalSpacing = xAxisCount * xAxisSpacing;
        // the left over width for bar spacing
        let xAxisWidth = (width - xAxisTotalSpacing) / xAxisCount;

        // check for minimum x axis width
        if (xAxisWidth < 1) {
            DataContainer.innerHTML = 'Width is too small.';
            return;
        }

        // check if data is valid
        if (this._data.length == 0) {
            DataContainer.innerHTML = 'Bar data is missing.';
            console.error('Bar data is missing.');
            return;
        }

        // create bar for each entry of this._data
        let growthPosition1: Interfaces.Position = null;
        let growthPosition2: Interfaces.Position = null;
        this._data.forEach((elem: Interfaces.BarData, idx) => {
            // get sum of the bar
            let sum = elem.data.reduce((a, b) => a + (b.value ?? 0), 0);
            // get height of bar based from sum
            let barHeight = sum * yAxisNormalizedHeight;

            // create bar container (contains subars)
            let bar = document.createElement('div');
            bar.setAttribute('class', 'bar');
            bar.style.height = barHeight + 'px';
            bar.style.width = xAxisWidth + 'px';
            bar.style.left = (idx * (xAxisWidth + xAxisSpacing)) + 'px';
            DataContainer.appendChild(bar);

            // create total label
            let barTotalLabel = document.createElement('div');
            barTotalLabel.setAttribute('class', 'bar-total-label');
            if (this._settings.LabelSettings.LabelToggle) {
                barTotalLabel.innerHTML = this.nFormatter(sum, 0);
                barTotalLabel.style.color =this._settings.LabelSettings.LabelColor;
                barTotalLabel.style.fontFamily =this._settings.LabelSettings.LabelFontFamily;
                barTotalLabel.style.fontSize = this._settings.LabelSettings.LabelFontSize + 'px';
                barTotalLabel.style.backgroundColor = this._settings.LabelSettings.LabelBackgroundColor;
            }
            bar.append(barTotalLabel);

            barTotalLabel.style.top = (-1 * barTotalLabel.offsetHeight) + 'px'

            // iterate through sub bars
            // O(1) since list length is constant or very small
            elem.data.forEach((entry: Interfaces.RegionValue, idx) => {
                // get sub bar height based from sub bar value
                let subBarHeight = (entry.value / sum) * barHeight;

                // create sub bar
                let subBar = document.createElement('div');
                subBar.setAttribute('class', 'sub-bar');
                subBar.setAttribute('data-region', entry.region);
                subBar.setAttribute('data-value', entry.value.toString());
                subBar.style.height = subBarHeight + 'px';
                subBar.style.width = xAxisWidth + 'px';
                // set color from data point series from settings
                subBar.style.backgroundColor = this._dataPointSeries[idx].seriesColor;
                bar.appendChild(subBar);
            });

            // get bar label total bounds (position relative to the)
            let barBounds = barTotalLabel.getBoundingClientRect();
            let barLeft = barBounds.left;
            let barRight = barBounds.right;
            let barBotCenterPosX = (barLeft + barRight) / 2;
            let barTopCenterPosX = barBotCenterPosX;
            let barTopCenterPosY = barBounds.y;

            // create x axis
            let xAxis = document.createElement('div');
            xAxis.setAttribute('class', 'x-axis');
            xAxis.style.height = this.axisSpacing + 'px';
            xAxis.style.top = '0';
            xAxis.style.transformOrigin = 'top right';
            xAxis.style.transform = 'rotate(-45deg)';
            xAxis.style.color = this._settings.LabelSettings.XAxisValueColor;
            xAxis.style.fontSize = this._settings.LabelSettings.XAxisValueFontSize+ 'px';
            xAxis.style.fontFamily = this._settings.LabelSettings.XAxisValueFontFamily;
            XAxisContainer.appendChild(xAxis);

            // create x axis label
            let xAxisLabel = document.createElement('div');
            xAxisLabel.setAttribute('class', 'x-axis-value');
            xAxisLabel.innerHTML = elem.column;
            xAxis.appendChild(xAxisLabel)

            // offset the label after inheriting dimensions from xAxis
            xAxis.style.left = (barBotCenterPosX - DataContainer.getBoundingClientRect().x - xAxisLabel.offsetWidth) + 'px';

            // set growth selectors
            let firstGrowthSelected: string = this._settings.GrowthSettings.Selector1;
            let secondGrowthSelected: string = this._settings.GrowthSettings.Selector2;

            if (firstGrowthSelected == '') {
                firstGrowthSelected = this._data[0].column;
            }
            if (secondGrowthSelected == '') {
                secondGrowthSelected = this._data[this._data.length - 1].column;
            }
            
            if (firstGrowthSelected != secondGrowthSelected) {
                if (elem.column == firstGrowthSelected) {
                    growthPosition1 = {
                        x: barTopCenterPosX,
                        y: barTopCenterPosY,
                        index: idx
                    }
                }
    
                if (elem.column == secondGrowthSelected) {
                    growthPosition2 = {
                        x: barTopCenterPosX,
                        y: barTopCenterPosY,
                        index: idx
                    }
                }
            }
            else {
                console.error('Cannot choose same growth selector.');
                DataContainer.innerHTML = 'Cannot choose same growth selector.';
            }
        });

        // create threshold line
        let thresholdLineHeight = yAxisNormalizedHeight * dp.Threshold;
        let thresholdBorderHeight = this._settings.ThresholdSettings.ThresholdLineThickness;

        // check if border height is valid
        if (thresholdBorderHeight < 1) {
            DataContainer.innerHTML = 'Threshold Height needs to be greater than 1.';
            console.error('Threshold Height needs to be greater than 1.');
            return;
        }

        let thresholdBorderColor = this._settings.ThresholdSettings.ThresholdLineColor;
        let thresholdBorderType = this._settings.ThresholdSettings.ThresholdLineType;
        let thresholdLine = document.createElement('div');
        thresholdLine.setAttribute('class', 'threshold-line');
        thresholdLine.style.height = 5 + 'px';
        thresholdLine.style.width = '100%';
        thresholdLine.style.top = (height - thresholdLineHeight - thresholdBorderHeight / 2) + 'px';
        thresholdLine.style.borderTop = `${thresholdBorderHeight}px ${thresholdBorderType} ${thresholdBorderColor}`;
        DataContainer.appendChild(thresholdLine);

        // check if first growth selector are valid
        if (!growthPosition1) {
            DataContainer.innerHTML = 'First growth selector invalid.';
            console.error('First growth selector invalid.');
            return;
        }
        // check if second growth selector are valid
        if (!growthPosition2) {
            DataContainer.innerHTML = 'Second growth selector invalid.';
            console.error('Second growth selector invalid.');
            return;
        }

        // check if first growth position is larger
        if (growthPosition1.index >= growthPosition2.index) {
            DataContainer.innerHTML = 'First growth selector needs to be before the second.';
            console.error('First growth selector needs to be before the second.');
            return;
        }

        // constant offset
        let paddingOffset: number = 2;
        let linePaddingOffset: number = 4;

        // create growth line
        let growthValue1 = this._data[growthPosition1.index].data
            .reduce((a, b) => a + (b.value ?? 0), 0);

        let growthValue2 = this._data[growthPosition2.index].data
            .reduce((a, b) => a + (b.value ?? 0), 0);

        // get the growth value
        let growthPercentage = (1 - growthValue2 / growthValue1) * 100;
        let growthIsNegative: boolean = growthPercentage < 0; // negative implies growth1 < growth2

        // set growthVertLineHeight and growthLineWidth from settings
        let growthVertLineHeight = this._settings.GrowthSettings.LineOffsetHeight;
        if (growthVertLineHeight < 1) {
            DataContainer.innerHTML = 'Growth Line Height too small.';
            console.error('Growth Line Height too small.');
            return
        }

        let growthLineWidth = this._settings.GrowthSettings.LineSize;
        let growthLineColor = this._settings.GrowthSettings.LineColor;

        // create right rowth vertical lines
        let growthVertLine1 = document.createElement('div');
        growthVertLine1.setAttribute('class', 'grow-line');
        growthVertLine1.style.left = (growthPosition1.x - growthLineWidth / 2) + 'px';
        growthVertLine1.style.width = growthLineWidth + 'px';
        growthVertLine1.style.backgroundColor = growthLineColor;
        this.container.appendChild(growthVertLine1);

        // create left growth vertical lines
        let growthVertLine2 = document.createElement('div');
        growthVertLine2.setAttribute('class', 'grow-line');
        growthVertLine2.style.left = (growthPosition2.x - growthLineWidth / 2) + 'px';
        growthVertLine2.style.width = growthLineWidth + 'px';
        growthVertLine2.style.backgroundColor = growthLineColor;
        this.container.appendChild(growthVertLine2);

        // set the vertical growth line height
        let growthTargetY = 0;
        
        let growthHeightDelta: number = Math.abs(growthPosition1.y - growthPosition2.y);
        if (growthIsNegative) {
            // first growth < second growth
            growthTargetY = growthPosition1.y - growthVertLineHeight - growthHeightDelta;
            growthVertLine1.style.height = (growthVertLineHeight + growthHeightDelta) + 'px';
            growthVertLine1.style.top = (growthTargetY - linePaddingOffset) + 'px';

            growthVertLine2.style.height = growthVertLineHeight + 'px';
            growthVertLine2.style.top = (growthPosition2.y - growthVertLineHeight - linePaddingOffset) + 'px';
        }
        else {
            // first growth >= second growth
            growthTargetY = growthPosition2.y - growthVertLineHeight - growthHeightDelta;
            growthVertLine1.style.height = growthVertLineHeight + 'px';
            growthVertLine1.style.top = (growthPosition1.y - growthVertLineHeight - linePaddingOffset) + 'px';

            growthVertLine2.style.height = (growthVertLineHeight + growthHeightDelta) + 'px';
            growthVertLine2.style.top = (growthTargetY - linePaddingOffset) + 'px';
        }
        
        if (this._settings.GrowthSettings.ArrowToggle) {
            let growthTriangleHeight = this._settings.GrowthSettings.ArrowHeight;
            let growthTriangleWidth = this._settings.GrowthSettings.ArrowWidth;
            let growthTriangleBorderSide = `${growthTriangleWidth}px solid transparent`;
            let growthTriangleBorderTop = `${growthTriangleHeight}px solid ${growthLineColor}`;

            // create left growth triangle
            let growthTriangle1 = document.createElement('div');
            growthTriangle1.setAttribute('class', 'triangle-down');
            growthTriangle1.style.top = (growthPosition1.y - growthTriangleHeight) + 'px';
            growthTriangle1.style.left = (growthPosition1.x -growthTriangleWidth) + 'px';
            growthTriangle1.style.borderRight = growthTriangleBorderSide;
            growthTriangle1.style.borderLeft = growthTriangleBorderSide;
            growthTriangle1.style.borderTop = growthTriangleBorderTop;
            this.container.appendChild(growthTriangle1);

            // create right growth triangle
            let growthTriangle2 = document.createElement('div');
            growthTriangle2.setAttribute('class', 'triangle-down');
            growthTriangle2.style.top = (growthPosition2.y - growthTriangleHeight) + 'px';
            growthTriangle2.style.left = (growthPosition2.x - growthTriangleWidth) + 'px';
            growthTriangle2.style.borderRight = growthTriangleBorderSide;
            growthTriangle2.style.borderLeft = growthTriangleBorderSide;
            growthTriangle2.style.borderTop = growthTriangleBorderTop;
            this.container.appendChild(growthTriangle2);
        }


        // create horizontal growth vertical lines
        let growthHorzLine = document.createElement('div');
        growthHorzLine.setAttribute('class', 'grow-line');
        growthHorzLine.style.left = (growthPosition1.x - growthLineWidth / 2) + 'px';
        growthHorzLine.style.height = growthLineWidth + 'px';
        // set the width to be the distance from growth2 to growth1
        growthHorzLine.style.width = (growthPosition2.x - growthPosition1.x) + 'px';
        // set top offset to align with growth1 and growth2 vertical line height
        growthHorzLine.style.top = (growthTargetY - linePaddingOffset) + 'px';
        growthHorzLine.style.backgroundColor = growthLineColor;
        this.container.appendChild(growthHorzLine);

        // get growth value display settings from settings
        let growthValueHeight = this._settings.GrowthSettings.LabelHeight;
        let growthValueWidth = this._settings.GrowthSettings.LabelWidth;
        
        // get middle position between growth1 and growth2
        let growthPosXAvg = (growthPosition1.x + growthPosition2.x) / 2

        // create growth value container
        let growthValue = document.createElement('div');
        growthValue.setAttribute('class', 'grow-value');
        growthValue.style.height = growthValueHeight + 'px';
        growthValue.style.width = growthValueWidth + 'px';
        // offset top and left to center it on the line
        growthValue.style.top = (growthTargetY - paddingOffset - linePaddingOffset - growthValueHeight / 2) + 'px';
        growthValue.style.backgroundColor = this._settings.GrowthSettings.LabelBackgroundColor;
        let borderThickness = this._settings.GrowthSettings.LineSize
        let borderColor = this._settings.GrowthSettings.LineColor;
        growthValue.style.border = `${borderThickness}px solid ${borderColor}`;
        // border affects the position
        growthValue.style.left = (growthPosXAvg - borderThickness -(growthValueWidth / 2) ) + 'px';
        this.container.appendChild(growthValue);

        // create growth value text
        let growthValueText = document.createElement('div');
        growthValueText.setAttribute('class', 'growth-value-text');
        growthValueText.style.color = this._settings.GrowthSettings.FontColor;
        growthValueText.style.fontSize = this._settings.GrowthSettings.FontSize + 'px';
        growthValueText.innerHTML = Math.round(growthPercentage * 10) / 10 + '%';
        growthValue.appendChild(growthValueText);

    }


    private getRange(): Interfaces.Range {
        // get range of all bars
        let min = 0;
        let max = 0;

        this._data.forEach((elem, idx) => {
            let sum = 0;
            elem.data.forEach(entry => {
                sum += entry.value;
            })

            // assume first entry is min/max
            if (idx == 0) {
                min = sum;
                max = sum;
            }

            min = (sum < min) ? sum : min;
            max = (sum > max) ? sum : max;
        });

        return { min: min, max: max, value: 0 };
    }

    private nFormatter(num, digits): string {
        // converts 15,000 to 15k and etc
        var si = [
            { value: 1, symbol: "" },
            { value: 1E3, symbol: "k" },
            { value: 1E6, symbol: "M" },
            { value: 1E9, symbol: "G" },
            { value: 1E12, symbol: "T" },
            { value: 1E15, symbol: "P" },
            { value: 1E18, symbol: "E" }
        ];
        var rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
        var i;
        for (i = si.length - 1; i > 0; i--) {
            if (num >= si[i].value) {
                break;
            }
        }
        return (num / si[i].value).toFixed(digits).replace(rx, "$1") + si[i].symbol;
    }

    public getStandardDeviation(array) {
        const n = array.length;
        const mean = array.reduce((a, b) => a + b) / n;
        return Math.sqrt(array.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n);
    }
}