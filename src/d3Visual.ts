'use strict'

import * as dp from './dataProcess';
import * as Html from './html';
import * as Interfaces from './interfaces';

import * as d3 from 'd3';
import powerbi from 'powerbi-visuals-api';
import { VisualSettings } from './settings';
import ISelectionManager = powerbi.extensibility.ISelectionManager;
import { local, stack } from 'd3';

// type
type Selection<T extends d3.BaseType> = d3.Selection<T, any,any, any>;

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
        
        // format data based on settings
        if (this._settings.AxisSettings.XAxisCleanToggle) {
            this.formatData();
        }

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

    public formatData() {
        // console.log(dp.D3Data)
    }

    public CreateVisualContainer() {

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
        let width = svgSelector.offsetWidth - 85;
        let height = svgSelector.offsetHeight - 100;
        let marginTop = 40;

        if (this._settings.AxisSettings.LegendPosition == 'bottom') {
            height = this.dimension.height - 100;
            marginTop = 20;
        }

        svg.attr('width', width)
        .attr('height', height)
        .style('margin-top', `${marginTop}px`)
        .attr('overflow', 'visible');

        // set x axis values
        let x = d3.scaleBand()
        .domain(dp.D3Data.map(data => data.sharedAxis))
        .range([0, width])
        .padding(this._settings.AxisSettings.XAxisBarWhiteSpace);
        
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
            .attr('transform', `translate(-${x.bandwidth() / 2}, 0) rotate(-45)`)
            .style('text-anchor', 'end')
            .style('fill', this._settings.LabelSettings.XAxisValueColor)
            .style('font-family', this._settings.LabelSettings.XAxisValueFontFamily)
            .style('font-size', this._settings.LabelSettings.XAxisValueFontSize)
        }

        // set y axis value
        let y = d3.scaleLinear()
        .domain([0, 500])
        .range([height, 0])

        // set y axis
        let yAxis = d3.axisLeft(y)
        .tickSize(-width)
        .tickFormat(data => {
            return data.toString()
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
            .attr('stroke-width', 1)
            .style('fill', this._settings.LabelSettings.YAxisValueColor)
            .style('font-family', this._settings.LabelSettings.YAxisValueFontFamily)
            .style('font-size', this._settings.LabelSettings.YAxisValueFontSize)
        }
        
        // render x axis
        xAxisG.attr('transform', `translate(0, ${height})`)
        .call(xAxis)
        .call(setXAxisGAttr);     
        
        // render y axis
        yAxisG.call(yAxis.ticks(this._settings.AxisSettings.YAxisCount))
        .call(setYAxisGAttr);
        d3.select('line')
        .filter((d, i) => i == 0)
        .remove();

        // generate stack
        let serieStack = d3.stack().keys(dp.Series);
        let stackData = serieStack(dp.D3Data);

        // create legend
        let legendRectHeight = 10;
        let legendRectWidth = 90;
        let legend = legendSvg.selectAll('.legend')
        .data(stackData)
        .enter()
        .append('g')
        .classed('legend', true)
        .attr('transform', (_, i) => { 
            let n = dp.Series.length;
            return 'translate(' + i % n * legendRectWidth + ',' + Math.floor( i / n) * legendRectHeight + ')'; 
        });

        let legendColor = legend.append('rect')
        .attr('width',10)
        .attr('height',10)
        .attr('y', 0)
        .attr('fill', d => this._dataPointSeries[d.index].seriesColor);
    
        let legendText = legend.append('text')
        .attr('x', 15)
        .attr('y', 10)
        .style('fill', this._settings.LabelSettings.LegendColor)
        .style('font-family', this._settings.LabelSettings.LegendFontFamily)
        .style('font-size', this._settings.LabelSettings.LegendFontSize)
        .text(d => d.key);

        if (this._settings.AxisSettings.LegendPosition == 'bottom') {
            legendColor.attr('y', legendSelector.offsetHeight - 10);
            legendText.attr('y', legendSelector.offsetHeight);
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
        .on('mouseover', function() {
            let selected = d3.select(this);
            selected.style('display', 'none');
        });

        // iterate through each serie stack
        stackData.forEach((serie, idx) => {
            // create bar
            let bar =  svg.selectAll('.bar')
            .enter()
            .data(serie)
            .join('rect')
            .classed('bar', true)
            .attr('fill', this._dataPointSeries[serie.index].seriesColor)
            .attr('width', x.bandwidth())
            .attr('x', data => x(data.data.sharedAxis.toString()))
            .attr('y', 0)
            .attr('height', 0)
            .attr('opacity', 1)
            .attr('serie', dp.Series[idx])
            .attr('xIdx', (_, i) => i);

            // set bar transition
            if (this._settings.AxisSettings.GroupedBars) {
                // find local max
                let localRange = this.getRange().max;

                // transition y axis
                y.domain([0, Math.max(localRange, this._settings.AxisSettings.YMaxValue)])
                yAxisG.transition()
                .duration(2000)
                .call(yAxis)
                .call(setYAxisGAttr);

                bar.data(serie)
                .transition()
                .ease(d3.easeQuadOut)
                .duration(0)
                .delay(400)
                .attr('x', data=> x(data.data.sharedAxis.toString()) + x.bandwidth() / 3 * idx)
                .attr('width', x.bandwidth() / dp.Series.length)
                .attr('height', 0)

                // second transition
                .transition()
                .ease(d3.easeQuadOut)
                .duration(500)
                .attr('y', data => y(data[1] - data[0]))
                .attr('height', data => y(data[0]) -  y(data[1]));
            }
            else {
                // transition y axis
                y.domain([0, Math.max(Math.ceil(dp.DataNumeric.max * 1.2), this._settings.AxisSettings.YMaxValue)])
                yAxisG.transition()
                .duration(2000)
                .call(yAxis)
                .call(setYAxisGAttr);

                bar.data(serie)
                .transition()
                .ease(d3.easeQuadOut)
                .duration(500)
                .delay(400)
                .attr('y', data => y(data[1]))
                .attr('height', data => y(data[0]) -  y(data[1]));
            }

            // get mouse hover
            bar.on('mouseover', function(data) {
                let selected = d3.select(this);
                let serie: string = selected.attr('serie');
                let xIdxAttr: string = selected.attr('xIdx');
                let xIdx: number = -1;
                let hoverWidth = 100;
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

               
                // hoverInfo.raise();
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
                        let text = key + ': ' + nFormatter(data.data[key], 1)  + '<br>';
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
                if (xIdx > (dp.D3Data.length * (2/3))) {
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
            .on('mouseout', function(_) {
                hoverInfoDiv.transition()
                .duration(100)
                .attr('width', 0)
                .attr('height', 0)
                .style('opacity', 0)
            });
        });
        
        // threshold
        let thresholdValue: number = dp.LineValues.reduce((a, b) => a + b, 0);

        svg.selectAll('.lineValues')
        .data([dp.LineValues[0]])
        .enter()
        .append('line')
        .classed('lineValues', true)
        .attr('fill', 'none')
        .attr('stroke', this._settings.ThresholdSettings.ThresholdLineColor)
        .attr('stroke-width', this._settings.ThresholdSettings.ThresholdLineThickness)
        .attr('x1', 0)
        .attr('y1', y(thresholdValue))
        .attr('x2', width)
        .attr('y2', y(thresholdValue));

        if (this._settings.ThresholdSettings.ThresholdLineType == 'dashed') {
            svg.selectAll('.lineValues')
            .attr('stroke-dasharray', '5,4');
        }

        // bar summation label
        if (this._settings.LabelSettings.LabelToggle && 
            this.container.offsetWidth > 800 &&
            this._settings.AxisSettings.XAxisBarWhiteSpace < 0.5) {

            let maxStackData: any[] = stackData[stackData.length - 1];
            maxStackData.forEach(data => {
                let maxVal = data[1];
                let sumBgWidth = Math.min(x.bandwidth(), 50);
                // background
                svg.append('rect')
                .attr('width', sumBgWidth)
                .attr('height', 20)
                .attr('fill', this._settings.LabelSettings.LabelBackgroundColor)
                .attr('opacity', 0)
                .attr('y', y(maxVal) - 20)
                .attr('x', x(data.data.sharedAxis) + x.bandwidth()/2 - sumBgWidth/2)
                .transition()
                .ease(d3.easeQuadOut)
                .duration(400)
                .delay(1000)
                .attr('opacity', '1');

                // text
                svg.append('text')
                .attr('width', x.bandwidth())
                .attr('height', 20)
                .attr('fill', this._settings.LabelSettings.LabelColor)
                .attr('opacity', 0)
                .attr('font-size', this._settings.LabelSettings.LabelFontSize)
                .attr('font-family', this._settings.LabelSettings.LabelFontFamily)
                .attr('text-anchor', 'middle')
                .attr('dominant-baseline', 'middle')
                .attr('y', y(maxVal) - 10)
                .attr('x', x(data.data.sharedAxis) + x.bandwidth()/2)
                .text(nFormatter(maxVal, 1))
                .transition()
                .ease(d3.easeQuadOut)
                .duration(400)
                .delay(700)
                .attr('opacity', '1');
            })
        }

        // growth
        if (!this._settings.AxisSettings.GroupedBars) {
            // growth
            let growthSelect1 = this._settings.GrowthSettings.Selector1;
            let growthSelect2 = this._settings.GrowthSettings.Selector2;
            growthSelect1 = growthSelect1 ? growthSelect1 : dp.D3Data[0].sharedAxis;
            growthSelect2 = growthSelect2 ? growthSelect2 : dp.Columns[dp.Columns.length - 1];

            // get top y position
            let yPos = y(y.domain()[1]);

            // get growth 1 index 
            let growth1Index = -1;
            dp.D3Data.forEach((data, idx) => {
                if (data.sharedAxis == growthSelect1) {
                    growth1Index = idx;
                }
            });

            // get growth 2 index
            let growth2Index = -1;
            dp.D3Data.forEach((data, idx) => {
                if (data.sharedAxis == growthSelect2) {
                    growth2Index = idx;
                }
            });

            // sanity check
            if (growth1Index == -1 || growth2Index == -1) {
                this.parent.innerHTML = 'Growth Selector not correct';
                return;
            }

            // get growth 1 sum
            let growth1Sum = 0;
            dp.Series.forEach(serie => {
                growth1Sum += dp.D3Data[growth1Index][serie]
            });

            // get growth 2 sum
            let growth2Sum = 0;
            dp.Series.forEach(serie => {
                growth2Sum += dp.D3Data[growth2Index][serie]
            });
            let heightOffset = this._settings.GrowthSettings.LineOffsetHeight;
            
            try {
                let growth1Y = y(growth1Sum) - heightOffset;
                let growth1X = x(growthSelect1) + x.bandwidth() / 2;
                let growth2Y = y(growth2Sum) - heightOffset;
                let growth2X = x(growthSelect2) + x.bandwidth() / 2;

                let path = d3.line()([
                    [growth1X, growth1Y], 
                    [growth1X, yPos],
                    [growth2X, yPos],
                    [growth2X, growth2Y]]);
                
                // draw line
                svg.append('path')
                .classed('growthLine', true)
                .attr('fill', 'none')
                .attr('stroke', this._settings.GrowthSettings.LineColor)
                .attr('stroke-width', this._settings.GrowthSettings.LineSize)
                .attr('d', path);

                if (this._settings.GrowthSettings.ArrowToggle) {
                    // draw triangle1
                    svg.append('path')
                    .attr('d', d3.symbol().type(d3.symbolTriangle).size(
                        this._settings.GrowthSettings.ArrowSize
                    ))
                    .attr('fill', this._settings.GrowthSettings.LineColor)
                    .attr('transform', `translate(${growth1X}, ${growth1Y}) rotate(60)`);   
                    
                    // draw triangle2
                    svg.append('path')
                    .attr('d', d3.symbol().type(d3.symbolTriangle).size(
                        this._settings.GrowthSettings.ArrowSize
                    ))
                    .attr('fill', this._settings.GrowthSettings.LineColor)
                    .attr('transform', `translate(${growth2X}, ${growth2Y}) rotate(60)`);
                }   

                // draw label
                let averageX = (growth1X + growth2X) / 2;
                let labelRectWidth = this._settings.GrowthSettings.LabelWidth;
                let labelRectHeight = this._settings.GrowthSettings.LabelHeight;
                svg.append('rect')
                .attr('width', labelRectWidth)
                .attr('height', labelRectHeight)
                .attr('fill', this._settings.GrowthSettings.LabelBackgroundColor)
                .attr('stroke-width', this._settings.GrowthSettings.LineSize)
                .attr('stroke', this._settings.GrowthSettings.LineColor)
                .attr('y', yPos - labelRectHeight / 2)
                .attr('x', averageX - labelRectWidth / 2)

                // draw label text
                let growthValue = (1 - growth2Sum / growth1Sum) * 100;
                let growthValueRounded = Math.round(growthValue * 10) / 10 + '%'
                svg.append('text')
                .attr('width', labelRectWidth)
                .attr('height', labelRectHeight)
                .attr('fill', this._settings.GrowthSettings.FontColor)
                .attr('font-size', this._settings.GrowthSettings.FontSize)
                .attr('font-family', this._settings.GrowthSettings.FontFamily)
                .attr('text-anchor', 'middle')
                .attr('dominant-baseline', 'middle')
                .attr('y', yPos)
                .attr('x', averageX)
                .text(growthValueRounded.toString());
            }
            catch(e) { 
                this.parent.innerHTML = 'Unable to create growth labels';
            }
        }
    }

    private getRange(): Interfaces.Range {
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
}

function nFormatter(num, digits): string {
    // converts 15,000 to 15k and etc
    var si = [
        { value: 1, symbol: '' },
        { value: 1E3, symbol: 'K' },
        { value: 1E6, symbol: 'M' },
        { value: 1E9, symbol: 'B' },
        { value: 1E12, symbol: 'T' },
        { value: 1E15, symbol: 'P' },
        { value: 1E18, symbol: 'E' }
    ];
    var rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
    var i;
    for (i = si.length - 1; i > 0; i--) {
        if (num >= si[i].value) {
            break;
        }
    }
    return (num / si[i].value).toFixed(digits).replace(rx, '$1') + si[i].symbol;
}