'use strict'

import * as dp from './dataProcess';
import * as Html from './html';
import * as Interfaces from './interfaces';

import * as d3 from 'd3';
import powerbi from 'powerbi-visuals-api';
import { LayoutSettings, VisualSettings } from './settings';
import ISelectionManager = powerbi.extensibility.ISelectionManager;
import { group, local, stack } from 'd3';

// type
type Selection<T extends d3.BaseType> = d3.Selection<T, any, any, any>;

export class D3Visual {
    private _settings: VisualSettings;
    private _dataPointSeries: Interfaces.DataPointSerie[];
    private _selectionManager: ISelectionManager;
    dimension: Interfaces.Dimension;
    parent: HTMLElement = null;
    container: HTMLElement = null;
    svg: Selection<SVGElement>;
    legend: Selection<SVGElement>;

    constructor(
        parent: HTMLElement,
        settings: VisualSettings,
        dataPointSeries: Interfaces.DataPointSerie[],
        selectionManager: ISelectionManager) {

        if (parent == null) {
            console.error('Can not create d3 visual without parent node.');
            return;
        }

        // append the container to the parent element
        // remove previous children
        parent.innerHTML = null;

        // initiate settings
        this.parent = parent;
        this._settings = settings;
        this._dataPointSeries = dataPointSeries;
        this._selectionManager = selectionManager;

        // initialize barchart dimensions
        this.dimension = {
            height: parent.offsetHeight,
            width: parent.offsetWidth
        };

        // init svg and legend
        this.svg = null;
        this.legend = null;

        this.CreateVisualContainer();
    }

    public CreateVisualContainer() {
        // gets settings
        const LAYOUT_SETTINGS = this._settings.LayoutSettings;
        // const AXIS_LABEL_SETTINGS = this._settings.AxisLabelSettings;
        const X_AXIS_SETTINGS = this._settings.XAxisSettings;
        const Y_AXIS_SETTINGS = this._settings.YAxisSettings;
        const DATA_LABEL_SETTINGS = this._settings.DataLabelSettings;
        const LEGEND_SETTINGS = this._settings.LegendSettings;
        const THRESHOLD_SETTINGS = this._settings.ThresholdSettings;
        const PRIMARY_GROWTH_SETTINGS = this._settings.PrimaryGrowthSettings;
        const PRIMARY_LABEL_SETTINGS = this._settings.PrimaryLabelSettings;
        const PRIMARY_LINE_SETTINGS = this._settings.PrimaryLineSettings;
        const SECONDARY_GROWTH_SETTINGS = this._settings.SecondaryGrowthSettings;
        const SECONDARY_LABEL_SETTINGS = this._settings.SecondaryLabelSettings;
        const SECONDARY_LINE_SETTINGS = this._settings.SecondaryLineSettings;
        const SECONDARY_Y_AXIS = this._settings.SecondaryYAxis;

        // create visual container
        this.container = document.createElement('div');
        this.container.setAttribute('class', 'visual-container');
        this.container.style.width = '100%';
        this.container.style.height = '100%'; // padding compensation
        this.parent.appendChild(this.container);

        // get legend svg
        let legendSelector = document.createElement('div');
        legendSelector.setAttribute('class', 'legend-selector');
        legendSelector.style.height = this.container.offsetHeight + 'px';
        this.container.appendChild(legendSelector);

        let legendSvg = d3.select(legendSelector)
            .append('svg')
            .classed('legend-svg', true)
            .attr('width', '100%')
            .attr('height', this.container.offsetHeight)
            .style('position', 'absolute');

        // get svg by selecting container
        let svgSelector = document.createElement('div');
        svgSelector.setAttribute('class', 'svg-selector');
        svgSelector.style.height = this.container.offsetHeight + 'px';
        this.container.appendChild(svgSelector)

        let svg = d3.select(svgSelector)
            .append('svg')
            .classed('visual-svg', true);

        this.svg = svg;

        // get and set svg attr
        let xPadding = LAYOUT_SETTINGS.ChartXMargin;
        let yPadding = LAYOUT_SETTINGS.ChartYMargin;

        let width = svgSelector.offsetWidth - xPadding;
        let height = svgSelector.offsetHeight - yPadding;
        let marginTop = 40;

        if (LEGEND_SETTINGS.LegendPosition == 'bottom') {
            height = this.dimension.height - yPadding;
            marginTop = 20;
        }

        svg.attr('width', width)
            .attr('height', height)
            .style('margin-top', `${marginTop}px`)
            .attr('overflow', 'visible');

        // removes capacity if 0 or toggled off
        // capacity is assumed to always be the first column
        let hasCapacity = true;
        if (!X_AXIS_SETTINGS.CapacityToggle || !this.getSum(0)) {
            hasCapacity = false;
            dp.D3Data.shift();
        }

        // set x axis values
        let x = d3.scaleBand()
            .domain(dp.D3Data.map(data => data.sharedAxis))
            .range([0, width])
            .padding(LAYOUT_SETTINGS.XAxisBarWhiteSpace);

        // set x axis
        let xAxis = d3.axisBottom(x);

        // set x axis g
        let xAxisG = svg.append('g')
            .classed('x-axis-g', true);

        // create x axis attr call
        let setXAxisGAttr = g => {
            g.selectAll('.domain').remove();
            g.selectAll('line').remove();
            g.selectAll('text')
                .attr('transform', `rotate(-${X_AXIS_SETTINGS.AxisLabelAngle})`)
                .style('text-anchor', X_AXIS_SETTINGS.AxisLabelAngle ? 'end' : 'middle')
                .style('fill', X_AXIS_SETTINGS.FontColor)
                .style('font-family', X_AXIS_SETTINGS.FontFamily)
                .style('font-size', X_AXIS_SETTINGS.FontSize);
        }

        // set y axis value
        let y0 = d3.scaleLinear()
            .domain([0, 500])
            .range([height, 0]);

        // set y axis
        let yAxis = d3.axisLeft(y0)
            .tickSize(-width)
            .tickFormat(data => {
                // formats y-axis labels with appropriate units
                return nFormatter(parseInt(data.toString()), 3, Y_AXIS_SETTINGS.DisplayUnits);
            });

        // set y axis g
        let yAxisG = svg.append('g')
            .classed('y-axis-g', true);

        // create y axis attr call
        let setYAxisGAttr = _ => {
            d3.selectAll('.domain').remove();
            d3.selectAll('line')
                .attr('stroke-dasharray', '1,3')
                .attr('stroke', 'grey')
                .attr('stroke-width', +Y_AXIS_SETTINGS.ToggleGridLines)
                .style('fill', Y_AXIS_SETTINGS.FontColor)
                .style('font-family', Y_AXIS_SETTINGS.FontFamily)
                .style('font-size', Y_AXIS_SETTINGS.FontSize);
        }

        let minVal = SECONDARY_Y_AXIS.MinValue;
        let maxVal = SECONDARY_Y_AXIS.MaxValue;

        let y1 = d3.scaleLinear()
            .domain([minVal, maxVal])
            .range([height, 0]);


        let secondaryYAxis = d3.axisRight(y1)
            .tickFormat(data => {
                return nFormatter(parseInt(data.toString()), 3, SECONDARY_Y_AXIS.DisplayUnits);
            });

        let secondaryYAxisG = svg.append('g')
            .classed('y-axis-g', true)
            .attr('transform', `translate(${width}, 0)`);

        // render x axis
        xAxisG.attr('transform', `translate(0, ${height})`)
            .call(xAxis)
            .call(setXAxisGAttr);

        // render y axis
        yAxisG.call(yAxis.ticks(Y_AXIS_SETTINGS.TickCount))
            .call(setYAxisGAttr);
        d3.select('line')
            .filter((d, i) => i == 0)
            .remove();
        // d3.select('line')
        //     .filter(function (d, i) {console.log(d, i); return i == 0})
        //     .remove();
        if (SECONDARY_Y_AXIS.ToggleOn) {
            secondaryYAxisG.call(secondaryYAxis.ticks(SECONDARY_Y_AXIS.TickCount))
                .call(setYAxisGAttr);
        }

        // hide origin label
        // values are mostly hard-coded in, not sure if there's a better way
        svg.append('rect')
            .attr('width', Y_AXIS_SETTINGS.FontSize)
            .attr('height', Y_AXIS_SETTINGS.FontSize)
            .attr('fill', '#ffffff')
            .attr('y', height - 6)
            .attr('x', -Y_AXIS_SETTINGS.FontSize);

        // generate stack
        let serieStack = d3.stack().keys(dp.Series);
        let stackData = serieStack(dp.D3Data);
        // console.log(stackData)

        // create legend
        let legendRectHeight = 15;
        let legendHorizontalPadding = 30;

        let legend = legendSvg.selectAll('.legend')
            .data(stackData)
            .enter()
            .append('g')
            .classed('legend', true);

        let legendWidth = 0;

        // true width gets actual width of chart 
        // useful for secondary growth indicator and legend
        let trueWidth = width + xPadding;

        // calculates text width for each name based on font size and family
        dp.Series.forEach(serieName => {
            // gets width
            let nameWidth = this.getTextWidth(serieName, LEGEND_SETTINGS);

            // calculates legend width
            legendWidth += nameWidth + legendHorizontalPadding;
        });

        // checks if legend exceeds chart borders
        legendWidth = legendWidth > trueWidth ? trueWidth : legendWidth;

        // currwidth determines current horizontal position of legend labels
        let currWidth = 0;
        // row for legend wrapping, determines what row to place label on
        let row = 0;

        // displays legend based on selected position
        // left: starting top left, display vertically
        if (LEGEND_SETTINGS.LegendPosition == 'left') {

            // places each legend label
            legend.attr('transform', (_, i) => {

                // displays each label below previous label
                let n = dp.Series.length;
                return 'translate(0,' + (i % n * legendRectHeight) + ')';
            });

        } else {
            // bottom: display at bottom center of chart
            if (LEGEND_SETTINGS.LegendPosition == 'bottom') {
                // centers legend
                let centerOffset = (trueWidth - legendWidth) / 2;
                currWidth = centerOffset;
            }

            // top: starting top left, display horizontally
            // places each legend label
            legend.attr('transform', serie => {
                let nameWidth = this.getTextWidth(serie.key, LEGEND_SETTINGS);

                // allows legend wrapping
                if (currWidth + nameWidth + legendHorizontalPadding > trueWidth) {
                    // increments row if legend exceeds chart borders
                    row++;
                    // resets width
                    currWidth = 0;
                }
                // displays each label at current width, height is determined using the row
                let t = 'translate(' + currWidth + ',' + row * legendRectHeight + ')';

                // increments width
                currWidth += nameWidth + legendHorizontalPadding;
                return t;
            });
        }

        // adds squares for serie colours
        let legendColor = legend.append('rect')
            .attr('width', 10)
            .attr('height', 10)
            .attr('y', 0)
            .attr('fill', d => this._dataPointSeries[d.index].seriesColor);

        // adds legend text
        let legendText = legend.append('text')
            .attr('x', 15)
            .attr('y', 10)
            .style('fill', LEGEND_SETTINGS.FontColor)
            .style('font-family', LEGEND_SETTINGS.FontFamily)
            .style('font-size', LEGEND_SETTINGS.FontSize)
            .text(d => d.key);

        // places legend at bottom of chart
        let legendMargin = LEGEND_SETTINGS.LegendMargin;
        if (LEGEND_SETTINGS.LegendPosition == 'bottom') {
            legendColor.attr('y', legendSelector.offsetHeight - legendMargin - 10);
            legendText.attr('y', legendSelector.offsetHeight - legendMargin);
        }

        // hover info text
        let hoverInfoDiv = d3.select('body')
            .append('div')
            .classed('hoverInfoDiv', true)
            .style('opacity', 0)
            .style('position', 'absolute')
            .style('top', 0)
            .style('color', '#fff')
            .style('font-size', '11px')
            .on('mouseover', function () {
                let selected = d3.select(this);
                selected.style('display', 'none');
            });

        let displayUnits = DATA_LABEL_SETTINGS.DisplayUnits;
        let displayDigits = DATA_LABEL_SETTINGS.DisplayDigits;

        // iterate through each serie stack
        stackData.forEach((serie, idx) => {
            // create bar
            let bar = svg.selectAll('.bar')
                .enter()
                .data(serie)
                .join('rect')
                .classed('bar', true)
                .attr('fill', this._dataPointSeries[serie.index].seriesColor)
                .attr('width', x.bandwidth())
                .attr('x', data => x(data.data.sharedAxis.toString()))
                .attr('serie', dp.Series[idx])
                .attr('xIdx', (_, i) => i);

            // create label on each bar
            let barLabel = null;
            let serieFontColor = this._dataPointSeries[serie.index].seriesFontColor;

            if (DATA_LABEL_SETTINGS.BarLabelToggle) {
                barLabel = svg.selectAll('.label')
                    .data(serie)
                    .enter()
                    .append('text')
                    .attr('width', x.bandwidth())
                    .attr('height', DATA_LABEL_SETTINGS.BarLabelFontSize)
                    .attr('fill', serieFontColor != '#000000' ? serieFontColor : DATA_LABEL_SETTINGS.BarLabelColor)
                    .attr('font-size', DATA_LABEL_SETTINGS.BarLabelFontSize)
                    .attr('font-family', DATA_LABEL_SETTINGS.FontFamily)
                    .attr('text-anchor', 'middle')
                    .attr('dominant-baseline', 'middle');

                if (LAYOUT_SETTINGS.ChartType == 'clustered') {
                    barLabel.attr('x', data => x(data.data.sharedAxis.toString()));
                } else {
                    // adds offset to account for bar positions
                    barLabel.attr('x', data => x(data.data.sharedAxis.toString()) + x.bandwidth() / 2);
                }
            }

            let yMax = Y_AXIS_SETTINGS.YMaxValue;

            // draws bars & bar labels for clustered chart
            if (LAYOUT_SETTINGS.ChartType == 'clustered') {
                // find local max
                let localRange = this.getRange().max;

                // set primary y axis min/max values
                y0.domain([0, yMax ? yMax : localRange]);
                yAxisG.call(yAxis)
                    .call(setYAxisGAttr);

                // set bar positions & height
                bar.data(serie)
                    // x pos is based off x-axis value + width of bars before
                    .attr('x', data => x(data.data.sharedAxis.toString()) + x.bandwidth() / dp.Series.length * idx)
                    .attr('width', x.bandwidth() / dp.Series.length)
                    // y attr sets starting position from which bar rendered
                    .attr('y', data => y0(data[1] - data[0]))
                    // height sets height of rectangle rendered from starting y pos
                    .attr('height', data => y0(data[0]) - y0(data[1]));

                // show text if bar height allows and bar labels are toggled on
                if (DATA_LABEL_SETTINGS.BarLabelToggle) {
                    barLabel.text(data => {
                        let val = data.data[dp.Series[idx]]; // gets data value
                        let barHeight = y0(data[0]) - y0(data[1]); // gets bar height

                        return barHeight > DATA_LABEL_SETTINGS.BarLabelFontSize ? nFormatter(val.toString(), displayDigits, displayUnits) : null;
                    });

                    // sets x pos of label based on x-axis value + widths of bars before + 1/2 current bar width
                    barLabel.attr('x', data => x(data.data.sharedAxis.toString()) + x.bandwidth() / dp.Series.length * idx + x.bandwidth() / dp.Series.length / 2)
                        .attr('y', data => height - (y0(data[0]) - y0(data[1])) / 2);
                }
            }
            // draws bars and bar labels for stacked chart
            else {
                // sets max/min for primary y axis
                y0.domain([0, yMax ? yMax : Math.ceil(dp.DataNumeric.max * 1.2)]);
                yAxisG.call(yAxis)
                    .call(setYAxisGAttr);

                // set bar heights
                bar.data(serie)
                    .attr('y', data => y0(data[1]))
                    .attr('height', data => y0(data[0]) - y0(data[1]));

                // show text if bar height allows
                if (DATA_LABEL_SETTINGS.BarLabelToggle) {
                    barLabel.text(data => {
                        let barHeight = y0(data[0]) - y0(data[1]);
                        let val = data.data[dp.Series[idx]];

                        return barHeight > DATA_LABEL_SETTINGS.BarLabelFontSize ? nFormatter(val.toString(), displayDigits, displayUnits) : null;
                    });

                    // bar label y pos based on upper data value - 1/2 height of bar
                    barLabel.attr('y', data => y0(data[0]) - (y0(data[0]) - y0(data[1])) / 2);
                }
            }

            // get mouse hover
            bar.on('mouseover', function (data) {
                let selected = d3.select(this);
                let serie: string = selected.attr('serie');
                let xIdxAttr: string = selected.attr('xIdx');
                let xIdx: number = -1;

                try {
                    xIdx = parseInt(xIdxAttr);
                }
                catch (e) {
                    // error converting xidx 
                    console.error(e);
                    return;
                }

                if (!serie || xIdx == -1) {
                    return;
                }

                let xValue = null;
                try {
                    xValue = dp.D3Data[xIdx].sharedAxis;
                }
                catch (e) {
                    // error getting d3data -- index out of bounds or undefined
                    console.error(e);
                    return;
                }

                let eventTarget: HTMLElement = d3.event.target;
                if (!eventTarget) {
                    console.error('Unable to get event target');
                    return;
                }
                let eventBounds = eventTarget.getBoundingClientRect()
                let posX = eventBounds.x;
                let posY = eventBounds.y;
                let padding = 10;

                hoverInfoDiv.transition()
                    .duration(400)
                    .style('display', 'block')
                    .style('opacity', 1)
                    .style('background-color', 'grey')
                    .style('padding', padding + 'px');

                let summaryText = '';

                // reverse to match order of bars
                Object.keys(data.data).reverse().forEach(key => {
                    if (key != 'sharedAxis') {
                        let text = key + ': ' + nFormatter(data.data[key], displayDigits, displayUnits) + '<br>';
                        if (key == serie) {
                            text = '<u>' + text + '</u>';
                        }
                        summaryText += text;
                    }
                    else {
                        summaryText += '<br>'
                    }
                });

                // text
                hoverInfoDiv.html(
                    data.data.sharedAxis +
                    `<br>` +
                    summaryText
                );

                let xPosOffset = x.bandwidth() * 1.5;
                if (xIdx > (dp.D3Data.length * (2 / 3))) {
                    xPosOffset = - hoverInfoDiv.node().offsetWidth - (x.bandwidth() / 2);
                }
                posX += xPosOffset;

                // get max top
                let body: HTMLElement = <HTMLElement>d3.select('body').node();
                let bodyHeight = body.getBoundingClientRect().height;
                let maxTop = bodyHeight - hoverInfoDiv.node().offsetHeight;

                hoverInfoDiv.style('left', posX + 'px')
                    .style('top', Math.min(posY, maxTop) + 'px');
            })
                .on('mouseout', function (_) {
                    hoverInfoDiv.transition()
                        .duration(100)
                        .attr('width', 0)
                        .attr('height', 0)
                        .style('opacity', 0)
                });
        });

        // threshold
        if (THRESHOLD_SETTINGS.ThresholdToggle) {
            let thresholdValue: number = dp.LineValues.reduce((a, b) => a + b, 0);

            svg.selectAll('.lineValues')
                .data([dp.LineValues[0]])
                .enter()
                .append('line')
                .classed('lineValues', true)
                .attr('fill', 'none')
                .attr('stroke', THRESHOLD_SETTINGS.LineColor)
                .attr('stroke-width', THRESHOLD_SETTINGS.LineThickness)
                .attr('x1', 0)
                .attr('y1', y1(thresholdValue))
                .attr('x2', width)
                .attr('y2', y1(thresholdValue));

            // sets line type
            if (THRESHOLD_SETTINGS.LineType == 'dashed') {
                svg.selectAll('.lineValues')
                    .attr('stroke-dasharray', '5,4');
            }
        }

        // bar summation label
        if (DATA_LABEL_SETTINGS.SumLabelToggle &&
            LAYOUT_SETTINGS.ChartType == 'stacked') {

            // gets summation values for each column
            let maxStackData: any[] = stackData[stackData.length - 1];

            maxStackData.forEach(data => {
                let maxVal = data[1];

                // display value if not 0
                if (maxVal) {
                    let text = nFormatter(maxVal, displayDigits, displayUnits);

                    // display value if bar width allows
                    if (x.bandwidth() > this.getTextWidth(text, DATA_LABEL_SETTINGS)) {

                        // background
                        let sumBgWidth = x.bandwidth();

                        svg.append('rect')
                            .attr('width', sumBgWidth)
                            .attr('height', 20)
                            .attr('fill', DATA_LABEL_SETTINGS.SumLabelBackgroundColor)
                            .attr('y', y0(maxVal) - 20)
                            .attr('x', x(data.data.sharedAxis) + x.bandwidth() / 2 - sumBgWidth / 2);

                        // text
                        svg.append('text')
                            .attr('width', x.bandwidth())
                            .attr('height', 20)
                            .attr('fill', DATA_LABEL_SETTINGS.SumLabelColor)
                            .attr('font-size', DATA_LABEL_SETTINGS.SumLabelFontSize)
                            .attr('font-family', DATA_LABEL_SETTINGS.FontFamily)
                            .attr('text-anchor', 'middle')
                            .attr('dominant-baseline', 'middle')
                            .attr('y', y0(maxVal) - 10)
                            .attr('x', x(data.data.sharedAxis) + x.bandwidth() / 2)
                            .text(text);
                    }
                }
            });
        }

        // growth indicator
        if (LAYOUT_SETTINGS.ChartType == 'stacked') {

            // creates default selector, sets to most recent non-zero column
            let lastIdx = dp.D3Data.length - 1;
            let lastSum = 0;

            // iterates over columns starting from last column, returns first-from-last non-zero column
            while (lastIdx >= 0) {
                lastSum = this.getSum(lastIdx);
                if (lastSum)
                    break;

                lastIdx--;
            }

            // finds equivalent growth selector for returned non-zero column
            let lastSelect = dp.D3Data[lastIdx].sharedAxis;

            // draws primary growth indicators
            if (PRIMARY_GROWTH_SETTINGS.TogglePrimaryIndicators) {
                // get growth selectors
                let primarySelect1 = PRIMARY_GROWTH_SETTINGS.Selector1;
                let primarySelect2 = PRIMARY_GROWTH_SETTINGS.Selector2;

                // define serie index and sum
                let primGrowth2Sum = 0;
                let primGrowth2Index = -1;

                // finds second growth selector if growth selector is specified, otherwise, use default value
                if (primarySelect2) {
                    // get growth 2 index
                    primGrowth2Index = this.getIndex(primarySelect2);

                    // get growth 2 sum
                    primGrowth2Sum = this.getSum(primGrowth2Index);

                } else {
                    // sets primary selector to default value
                    primGrowth2Index = lastIdx;
                    primGrowth2Sum = lastSum;
                    primarySelect2 = lastSelect;
                }

                let primGrowth1Sum = 0;
                let primGrowth1Index = -1;

                // finds first growth selector
                if (primarySelect1) {
                    // get growth 1 index
                    primGrowth1Index = this.getIndex(primarySelect1);

                    // get growth 1 sum
                    primGrowth1Sum = this.getSum(primGrowth1Index);

                } else {
                    if (hasCapacity) {
                        // initialize value to first column (capacity)
                        primarySelect1 = dp.D3Data[0].sharedAxis;

                        // get growth 1 index
                        primGrowth1Index = this.getIndex(primarySelect1);

                        // get growth 1 sum
                        primGrowth1Sum = this.getSum(primGrowth1Index);

                    }
                    // if capacity is 0, use 12-month previous
                    else {
                        let months = Interfaces.MonthNames;
                        // if 12-month prev == 0 find next closest available non-zero month, starting from 12-month prev and incrementing
                        primGrowth1Index = primGrowth2Index - 12 < 0 ? 0 : primGrowth2Index - 12;

                        let month = dp.Columns[primGrowth2Index].slice(0, 3);
                        let year = parseInt(dp.Columns[primGrowth2Index].slice(4));

                        year--;

                        for (let monthIdx = months.indexOf(month); monthIdx < 12; monthIdx++) {
                            let col = month + '-' + year.toString();
                            if (dp.Columns[primGrowth1Index] != col || !this.getSum(primGrowth1Index)) {
                                primGrowth1Index++;
                                // console.log(dp.Columns[primGrowth1Index])
                            }
                        }

                        while (primGrowth1Index < dp.Columns.length) {
                            // calculates sum for selected month
                            primGrowth1Sum = this.getSum(primGrowth1Index);
                            if (primGrowth1Sum)
                                break;

                            primGrowth1Index++;
                        }
                        primarySelect1 = dp.Columns[primGrowth1Index];
                    }
                }

                // define height offset of growth indicator
                let heightOffset = PRIMARY_LINE_SETTINGS.LineOffsetHeight;
                // get top y pos
                let yPos = y0(y0.domain()[1]);

                // draw primary growth indicator
                try {
                    // defines coordinate points for label and line
                    let growth1Y = y0(primGrowth1Sum) - heightOffset;
                    let growth1X = x(primarySelect1) + x.bandwidth() / 2;
                    let growth2Y = y0(primGrowth2Sum) - heightOffset;
                    let growth2X = x(primarySelect2) + x.bandwidth() / 2;

                    // defines line coordinates
                    let path = d3.line()([
                        [growth1X, growth1Y],
                        [growth1X, yPos],
                        [growth2X, yPos],
                        [growth2X, growth2Y]]);

                    // draw line
                    this.drawLine(path, 'growthLine', PRIMARY_LINE_SETTINGS);

                    // draw first arrow
                    this.drawTriangle(growth1X, growth1Y, PRIMARY_LINE_SETTINGS, 60);

                    // draw second arrow
                    this.drawTriangle(growth2X, growth2Y, PRIMARY_LINE_SETTINGS, 60);

                    let averageX = (growth1X + growth2X) / 2;

                    // calculate label text
                    let growthValue = primGrowth1Index ? primGrowth1Sum / primGrowth2Sum : primGrowth2Sum / primGrowth1Sum;
                    growthValue = (1 - growthValue) * 100;

                    let growthValueRounded = Math.round(growthValue * 10) / 10 + '%';

                    // draw label background shape
                    this.drawEllipse(averageX, yPos, growthValueRounded.toString(), PRIMARY_LABEL_SETTINGS);

                    // draw label text
                    this.drawText(averageX, yPos, PRIMARY_LABEL_SETTINGS, growthValueRounded.toString());
                }
                catch (e) {
                    this.parent.innerHTML = 'Unable to create primary growth labels';
                }
            }

            // adds secondary growth indicator
            if (SECONDARY_GROWTH_SETTINGS.ToggleSecondaryIndicator) {
                // get secondary growth selectors
                let secondarySelect1 = SECONDARY_GROWTH_SETTINGS.Selector1;
                let secondarySelect2 = SECONDARY_GROWTH_SETTINGS.Selector2;

                let selectors1 = [];
                let selectors2 = [];

                // splits secondary selectors using comma as delimiter and removes extra spaces
                // appends to array
                // note that empty strings are valid selectors, as long as they are separated by commas
                secondarySelect1.split(',').forEach(s => selectors1.push(s.trim()));
                secondarySelect2.split(',').forEach(s => selectors2.push(s.trim()));

                // loops for every selector in first array
                // could also loop through second array, doesn't matter
                selectors1.forEach((selector, idx) => {
                    // first selector
                    let selector1 = selector;

                    // second selector
                    let selector2 = selectors2[idx];

                    // initialize sums and indices
                    let secGrowth2Sum = 0;
                    let secGrowth2Index = -1;

                    let secGrowth1Sum = 0;
                    let secGrowth1Index = -1;

                    // gets properties of selectors, if empty, use latest values
                    secGrowth1Index = selector1 ? this.getIndex(selector1) : this.getIndex(lastSelect) - 1; // index
                    selector1 = dp.D3Data[secGrowth1Index].sharedAxis; // name

                    secGrowth2Index = selector2 ? this.getIndex(selector2) : this.getIndex(lastSelect); // index
                    selector2 = dp.D3Data[secGrowth2Index].sharedAxis; // name

                    // gets serie sums
                    secGrowth1Sum = this.getSum(secGrowth1Index);
                    secGrowth2Sum = this.getSum(secGrowth2Index);

                    // gets bar values
                    let maxStackData = stackData[stackData.length - 1];
                    let data1 = maxStackData[secGrowth1Index][1];
                    let data2 = maxStackData[secGrowth2Index][1];

                    try {
                        // initializes coordinate points based on bars selected
                        let growth1Y = y0(secGrowth1Sum);
                        let growth2Y = y0(secGrowth2Sum);
                        let growth1X = x(selector1);
                        let growth2X = x(selector2);

                        let averageY = (growth2Y + growth1Y) / 2;
                        let xPos;

                        if (SECONDARY_LABEL_SETTINGS.DisplaySide == 'right') {
                            // adds offset to account for bar width
                            growth1X += x.bandwidth();
                            growth2X += x.bandwidth();

                            // sets x pos for display side == 'right'
                            xPos = Math.max(growth2X, growth1X) + SECONDARY_LABEL_SETTINGS.xOffset;

                            // ensures x pos does not exceed chart width
                            xPos = xPos < trueWidth ? xPos : trueWidth;
                        } else {
                            // setting x position of growth label if display side is 'left'
                            xPos = Math.min(growth2X, growth1X) - SECONDARY_LABEL_SETTINGS.xOffset;

                            // ensures x pos does not exceed chart width
                            xPos = xPos < 0 ? 0 : xPos;
                        }

                        // draw line
                        let path = d3.line()([
                            [growth1X, growth1Y],
                            [xPos, growth1Y],
                            [xPos, growth2Y],
                            [growth2X, growth2Y]]);

                        this.drawLine(path, 'growthLineValues', SECONDARY_LINE_SETTINGS);

                        // set line type
                        if (SECONDARY_LINE_SETTINGS.LineType == 'dashed') {
                            svg.selectAll('.growthLineValues')
                                .attr('stroke-dasharray', '5,4');
                        }

                        // calculate label text
                        let growthValue = (1 - data1 / data2) * 100;
                        let growthValueRounded = Math.round(growthValue * 10) / 10 + '%';

                        // draw label background shape
                        this.drawEllipse(xPos, averageY, growthValueRounded.toString(), SECONDARY_LABEL_SETTINGS)

                        // draw label text
                        this.drawText(xPos, averageY, SECONDARY_LABEL_SETTINGS, growthValueRounded.toString());

                        // draw first arrow
                        this.drawTriangle(growth1X, growth1Y, SECONDARY_LINE_SETTINGS, 30);

                        // draw second arrow
                        this.drawTriangle(growth2X, growth2Y, SECONDARY_LINE_SETTINGS, 30);

                    } catch (e) {
                        this.container.innerHTML = "Unable to create secondary growth labels";
                    }
                });
            }
        }

        // draw growth indicators for grouped bar chart
        else if (LAYOUT_SETTINGS.ChartType == 'clustered') {
            // get serie selectors
            let primarySelect1 = PRIMARY_GROWTH_SETTINGS.Selector1;
            let primarySelect2 = PRIMARY_GROWTH_SETTINGS.Selector2;

            // getting indices
            // if selectors aren't empty, get index, otherwise use default values
            let pIdx1 = primarySelect1 ? dp.Series.indexOf(primarySelect1) : dp.Series.length - 2;
            let pIdx2 = primarySelect2 ? dp.Series.indexOf(primarySelect2) : dp.Series.length - 1;

            // reassigns serie selectors based on index
            primarySelect1 = dp.Series[pIdx1];
            primarySelect2 = dp.Series[pIdx2];

            let heightOffset = PRIMARY_LINE_SETTINGS.LineOffsetHeight;

            // draw primary growth indicators
            if (dp.Series.length > 1 &&
                PRIMARY_GROWTH_SETTINGS.TogglePrimaryIndicators) {

                dp.D3Data.forEach(dataset => {
                    // gets corresponding serie data based on selectors
                    let data1 = dataset[primarySelect1];
                    let data2 = dataset[primarySelect2];

                    // if data is not 0 - no point in rendering indicators for a column of 0s
                    if (data1 && data2) {
                        try {
                            // initializes coordinate points based on bars selected
                            let growth1Y = y0(data1) - heightOffset;
                            let growth2Y = y0(data2) - heightOffset;
                            let growth1X = x(dataset.sharedAxis.toString()) + x.bandwidth() / dp.Series.length * pIdx1;
                            let growth2X = x(dataset.sharedAxis.toString()) + x.bandwidth() / dp.Series.length * pIdx2;

                            // sets x position to the center of the bar
                            growth1X += x.bandwidth() / (dp.Series.length * 2);
                            growth2X += x.bandwidth() / (dp.Series.length * 2);

                            let averageX = (growth1X + growth2X) / 2;

                            // represents top border of the chart (excluding legend and other labels), defaults to 0
                            let maxYPos = y0(y0.domain()[1]);

                            let yPos = maxYPos;
                            // gets y pos for label
                            if (!PRIMARY_LINE_SETTINGS.AlignIndicators) {
                                yPos = Math.min(growth1Y, growth2Y) - PRIMARY_LABEL_SETTINGS.LabelHeight * 2

                                // ensures yPos does not exceed max, though technically max is actually a min
                                yPos = yPos > maxYPos ? yPos : maxYPos;

                                yPos -= PRIMARY_LABEL_SETTINGS.LabelOffsetHeight;
                            }

                            // draw line
                            let path = d3.line()([
                                [growth1X, growth1Y],
                                [growth1X, yPos],
                                [growth2X, yPos],
                                [growth2X, growth2Y]]);

                            this.drawLine(path, 'growthLine', PRIMARY_LINE_SETTINGS);

                            // calculate label text
                            let growthValue = (1 - data1 / data2) * 100;
                            let growthValueRounded = Math.round(growthValue * 10) / 10 + '%';

                            // draw label background shape
                            this.drawEllipse(averageX, yPos, growthValueRounded.toString(), PRIMARY_LABEL_SETTINGS);

                            // draw label text
                            this.drawText(averageX, yPos, PRIMARY_LABEL_SETTINGS, growthValueRounded.toString());

                            // draw first arrow
                            this.drawTriangle(growth1X, growth1Y, PRIMARY_LINE_SETTINGS, 60);

                            // draw second arrow
                            this.drawTriangle(growth2X, growth2Y, PRIMARY_LINE_SETTINGS, 60);

                        } catch (e) {
                            this.container.innerHTML = "Unable to create primary growth labels";
                        }
                    }
                });
            }

            // adds secondary growth indicator
            if (SECONDARY_GROWTH_SETTINGS.ToggleSecondaryIndicator) {
                // get serie selectors
                let secondarySelect1 = SECONDARY_GROWTH_SETTINGS.Selector1;
                let secondarySelect2 = SECONDARY_GROWTH_SETTINGS.Selector2;

                // get indexes if selectors aren't empty, otherwise use default values
                let sIdx1 = secondarySelect1 ? dp.Series.indexOf(secondarySelect1) : dp.Series.length - 2;
                let sIdx2 = secondarySelect2 ? dp.Series.indexOf(secondarySelect2) : dp.Series.length - 1;

                // reassigns serie selectors based on index
                secondarySelect1 = dp.Series[sIdx1];
                secondarySelect2 = dp.Series[sIdx2];

                // gets selectors list
                let selectorsList = SECONDARY_GROWTH_SETTINGS.SelectorsList;
                let selectors = [];
                // in case of multiple selectors, splits selectors based on comma and appends to array
                selectorsList.split(',').forEach(s => selectors.push(s.trim()));

                // draws indicator for each selector
                selectors.forEach(selector => {
                    let selIdx;

                    // gets index of selected group
                    // if selector is empty, defaults to first-from-last non-zero group
                    if (selector) {
                        selIdx = this.getIndex(selector); // get index
                    } else {
                        // get default value
                        // loops until a non-zero serie sum is found
                        for (let idx = dp.D3Data.length - 1; idx >= 0; idx--) {
                            let serieSum = this.getSum(idx);
                            selIdx = idx;

                            if (serieSum)
                                break;
                        }
                        // assigns selector to first non-zero column
                        selector = dp.D3Data[selIdx].sharedAxis;
                    }

                    // gets data points for both serie selections based on selected indices
                    let data1 = dp.D3Data[selIdx][secondarySelect1];
                    let data2 = dp.D3Data[selIdx][secondarySelect2];

                    try {
                        // initializes coordinate points based on bars selected
                        let growth1Y = y0(data1);
                        let growth2Y = y0(data2);

                        let averageY = (growth2Y + growth1Y) / 2;

                        // calculates starting x positions for line, defaults to right corner of bar
                        let growth1X = x(selector) + x.bandwidth() / dp.Series.length * sIdx1;
                        let growth2X = x(selector) + x.bandwidth() / dp.Series.length * sIdx2;

                        // calculates x pos for label
                        let xPos = Math.min(growth2X, growth1X) - SECONDARY_LABEL_SETTINGS.xOffset;
                        // ensures x pos does not exceed width
                        xPos = xPos < 0 ? 0 : xPos;

                        if (SECONDARY_LABEL_SETTINGS.DisplaySide == 'right') {
                            // adds offset to account for bar width
                            growth1X += x.bandwidth() / dp.Series.length;
                            growth2X += x.bandwidth() / dp.Series.length;

                            // gets desired x position
                            xPos = Math.max(growth2X, growth1X) + SECONDARY_LABEL_SETTINGS.xOffset;
                            // ensures x pos does not exceed width
                            xPos = xPos < trueWidth ? xPos : trueWidth;
                        }

                        // draw line
                        let path = d3.line()([
                            [growth1X, growth1Y],
                            [xPos, growth1Y],
                            [xPos, growth2Y],
                            [growth2X, growth2Y]]);

                        this.drawLine(path, 'growthLineValues', SECONDARY_LINE_SETTINGS);

                        // sets line type
                        if (SECONDARY_LINE_SETTINGS.LineType == 'dashed') {
                            svg.selectAll('.growthLineValues')
                                .attr('stroke-dasharray', '5,4');
                        }

                        // calculate label text
                        let growthValue = (1 - data1 / data2) * 100;
                        let growthValueRounded = Math.round(growthValue * 10) / 10 + '%'

                        // draw label background shape
                        this.drawEllipse(xPos, averageY, growthValueRounded.toString(), SECONDARY_LABEL_SETTINGS);

                        // draw label text
                        this.drawText(xPos, averageY, SECONDARY_LABEL_SETTINGS, growthValueRounded.toString());

                        // draw first arrow
                        this.drawTriangle(growth1X, growth1Y, SECONDARY_LINE_SETTINGS, 30);

                        // draw second arrow
                        this.drawTriangle(growth2X, growth2Y, SECONDARY_LINE_SETTINGS, 30);

                    } catch (e) {
                        this.container.innerHTML = "Unable to create secondary growth labels";
                    }
                });
            }
        }
    }

    // gets range of data
    private getRange(): Interfaces.Range {
        /* 
        * Param: none 
        * Returns: max, min
        */
        let localMax = 0;
        dp.D3Data.forEach(data => {
            dp.Series.forEach(serie => {
                localMax = (data[serie] > localMax) ? data[serie] : localMax;
            });
        });

        // compute top rounded
        let digits = (localMax - localMax % 1).toString().length;

        let roundBy = Math.max(Math.pow(10, digits - 1), 10);
        let topRounded = Math.ceil(localMax / roundBy) * roundBy;

        return {
            max: topRounded,
            min: 0
        }
    }

    // get index of selector
    private getIndex(selector: string): number {
        /* 
        * Param: selector 
        * Returns: corresponding column index in data table
        */
        let selectedIdx = -1;

        dp.D3Data.forEach((data, idx) => {
            if (data.sharedAxis == selector)
                selectedIdx = idx;
        });

        // sanity check
        if (selectedIdx == -1) {
            this.parent.innerHTML = 'Growth Selector not correct';
            return selectedIdx;
        }

        return selectedIdx;
    }

    // gets sum of serie
    private getSum(idx: number): number {
        /* 
        * Param: index 
        * Returns: sum of corresponding column in data table
        */
        let sum = 0;
        dp.Series.forEach(serie => {
            sum += dp.D3Data[idx][serie];
        });
        return sum;
    }

    // gets displayed width of text
    private getTextWidth(text: string, settings: any): number {
        /* 
        * Param: selector, settings
        * Returns: width of text based on font size and family
        */
        try {
            let fontFamily = settings.FontFamily;
            let fontSize = settings.FontSize;

            let font = fontSize + 'px ' + fontFamily;

            let canvas = document.createElement('canvas');
            let context = canvas.getContext("2d");
            context.font = font;

            return context.measureText(text).width;
        } catch (e) {
            console.error(e);
        }
    }

    // draws triangles/arrows on the svg
    private drawTriangle(x: number, y: number, settings: any, rotation: number) {
        /* 
        * Param: x coord, y coord, settings, rotation 
        * Returns: none
        */
        if (settings.ArrowToggle) {
            this.svg.append('path')
                .attr('d', d3.symbol().type(d3.symbolTriangle).size(settings.ArrowSize))
                .attr('fill', settings.LineColor)
                .attr('transform', `translate(${x}, ${y}) rotate(${rotation})`);
        }
    }

    // adds text to svg
    private drawText(x: number, y: number, settings: any, text: string) {
        /* 
        * Param: x coord, y coord, settings, text 
        * Returns: none
        */
        this.svg.append('text')
            .attr('width', settings.LabelMinWidth)
            .attr('height', settings.LabelHeight)
            .attr('fill', settings.FontColor)
            .attr('font-size', settings.FontSize)
            .attr('font-family', settings.FontFamily)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('y', y)
            .attr('x', x)
            .text(text);
    }

    // draws label background shape
    private drawEllipse(cx: number, cy: number, text: string, settings: any) {
        /* 
        * Param: x coord, y coord, text, settings 
        * Returns: none
        */
        if (settings.ToggleBgShape) {
            let textWidth = this.getTextWidth(text, settings);
            this.svg.append('ellipse')
                .attr('rx', settings.LabelMinWidth + 10 > textWidth ? settings.LabelMinWidth : textWidth - 10) // resizes label based on text width
                .attr('ry', settings.LabelHeight)
                .attr('cx', cx)
                .attr('cy', cy)
                .attr('fill', settings.LabelBackgroundColor)
                .attr('stroke', settings.BorderColor)
                .attr('stroke-width', settings.BorderSize);
        }
    }

    // draws line
    private drawLine(path: string, classed: string, settings: any) {
        /* 
        * Param: path, class name, settings 
        * Returns: none
        */
        this.svg.append('path')
            .attr('fill', 'none')
            .attr('stroke', settings.LineColor)
            .attr('stroke-width', settings.LineSize)
            .attr('d', path)
            .classed(classed, true);
    }
}

function nFormatter(num: number, digits: number, displayUnits: string): string {
    // converts 15,000 to 15k and etc
    let si = [
        { value: 1, symbol: '', text: 'none' },
        { value: 1E3, symbol: 'K', text: 'thousands' },
        { value: 1E6, symbol: 'M', text: 'millions' },
        { value: 1E9, symbol: 'B', text: 'billions' },
        { value: 1E12, symbol: 'T', text: 'trillions' },
        { value: 1E15, symbol: 'P', text: 'quadrillions' },
        { value: 1E18, symbol: 'E', text: 'quintillions' }
    ];

    // regex to remove insignficant digits after decimal place
    let rx = /\.0+$|(\.[0-9]*[1-9])0+$/;

    let i;
    // converts numbers into largest reasonable units unless otherwise specified
    if (displayUnits == 'auto') {
        for (i = si.length - 1; i > 0; i--) {
            if (num >= si[i].value) {
                break;
            }
        }
    } else {
        for (i = 0; i < si.length - 1; i++) {
            if (displayUnits == si[i].text) {
                break;
            }
        }
    }
    return (num / si[i].value).toFixed(digits).replace(rx, '$1') + si[i].symbol;
}