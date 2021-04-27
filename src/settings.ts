/*
 *  Power BI Visualizations
 *
 *  Copyright (c) Microsoft Corporation
 *  All rights reserved.
 *  MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the ""Software""), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 */

"use strict";

import * as dp from './dataProcess';
import * as visual from './visual';
import { dataViewObjectsParser } from "powerbi-visuals-utils-dataviewutils";
import DataViewObjectsParser = dataViewObjectsParser.DataViewObjectsParser;

export class VisualSettings extends DataViewObjectsParser {
    public DataColors: DataColors = new DataColors();
    public LabelSettings: LabelSettings = new LabelSettings();
    public ThresholdSettings: ThresholdSettings = new ThresholdSettings();
    public GrowthSettings: GrowthSettings = new GrowthSettings();
    public AxisSettings: AxisSettings = new AxisSettings();
}

export class DataColors {
    // Default color
    public seriesColor: string = '#000000';
}

export class AxisSettings {
    public GroupedBars: boolean = false;
    public ChartMargin: number = 40;
    public LegendPosition: string = 'top';
    public YMaxValue: number = 0;
    public YAxisCount: number = 3;
    public XAxisBarWhiteSpace: number = 0.3;
    public XAxisCleanToggle: boolean = false;
}

export class LabelSettings {
    public YAxisText: string = 'Value';
    public YAxisColor: string = '#000000';
    public YAxisFontFamily: string = 'Calibri';
    public YAxisFontSize: number = 13;
    public YAxisValueColor: string = '#000000';
    public YAxisValueFontFamily: string = 'Calibri';
    public YAxisValueFontSize: number = 11;

    public XAxisText: string = 'Period';
    public XAxisColor: string = '#000000';
    public XAxisFontFamily: string = 'Calibri';
    public XAxisFontSize: number = 13;
    public XAxisValueColor: string = '#000000';
    public XAxisValueFontFamily: string = 'Calibri';
    public XAxisValueFontSize: number = 11;

    public LabelColor: string = '#000000';
    public LabelFontFamily: string = 'Calibri';
    public LabelFontSize: number = 10;
    public LabelBackgroundColor: string = '#ffffff';
    public LabelToggle: boolean = true;

    public LegendColor: string = '#000000';
    public LegendFontFamily: string = 'Calibri';
    public LegendFontSize: number = 13;
}

export class ThresholdSettings {
    public ThresholdLineThickness: number = 2;
    public ThresholdLineColor: string = '#000000';
    public ThresholdLineType: string = 'dashed';
}

export class GrowthSettings {
    public Selector1: string = '';
    public Selector2: string = '';

    public FontColor: string = '#000000';
    public FontFamily: string = 'Calibri';
    public FontSize: number = 11;

    public LineColor: string = '#000000';
    public LineOffsetHeight: number = 25;
    public LineSize: number = 2;
    
    public LabelBackgroundColor: string = '#ffffff';
    public LabelHeight: number = 20;
    public LabelWidth: number = 50;

    public ArrowSize: number = 20;
    public ArrowToggle: boolean = true;;
}
