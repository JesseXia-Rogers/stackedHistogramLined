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

import { dataViewObjectsParser } from "powerbi-visuals-utils-dataviewutils";
import DataViewObjectsParser = dataViewObjectsParser.DataViewObjectsParser;

export class VisualSettings extends DataViewObjectsParser {
    public CapacitySettings: CapacitySettings = new CapacitySettings();
    public XAxisSettings: XAxisSettings = new XAxisSettings();
    public YAxisSettings: YAxisSettings = new YAxisSettings();
    public DataLabelSettings: DataLabelSettings = new DataLabelSettings();
    public ThresholdSettings: ThresholdSettings = new ThresholdSettings();
    public PrimaryGrowthSettings: PrimaryGrowthSettings = new PrimaryGrowthSettings();
    public SecondaryGrowthSettings: SecondaryGrowthSettings = new SecondaryGrowthSettings();
    public LayoutSettings: LayoutSettings = new LayoutSettings();
    public DataColors: DataColors = new DataColors();
    public LegendSettings: LegendSettings = new LegendSettings();
    public PrimaryLabelSettings: PrimaryLabelSettings = new PrimaryLabelSettings();
    public PrimaryLineSettings: PrimaryLineSettings = new PrimaryLineSettings();
    public SecondaryLabelSettings: SecondaryLabelSettings = new SecondaryLabelSettings();
    public SecondaryLineSettings: SecondaryLineSettings = new SecondaryLineSettings();
    public SecondaryYAxis: SecondaryYAxis = new SecondaryYAxis();
}

// initializes default values for all settings

export class LayoutSettings {
    public ChartType: string = 'stacked';

    public ChartXMargin: number = 85;
    public ChartTopMargin: number = 35;
    public ChartBottomMargin: number = 35;
    
    public XAxisBarWhiteSpace: number = 0.3;

    public YScaleFactor: number = 1.3;
}

export class CapacitySettings {
    public CapacityToggle: boolean = true;

    public LabelAngle: number = 0;

    public XOffset: number = 0;
    public YOffset: number = 0;
}

export class XAxisSettings {
    public FontFamily: string = 'Calibri';
    public FontColor: string = '#666666';
    public FontSize: number = 10;

    public LabelAngle: number = 0;

    public XOffset: number = 0;
    public YOffset: number = 0;
}

export class YAxisSettings {
    public DisplayUnits: string = 'auto';
    public DisplayDigits: number = 1;

    public MaxValue: number = 0;

    public TickCount: number = 3;

    public ToggleGridLines: boolean = true;

    public FontFamily: string = 'Calibri';
    public FontColor: string = '#666666';
    public FontSize: number = 10;
}

export class SecondaryYAxis {
    public ToggleOn: boolean = false;

    public MinValue: number = 0;
    public MaxValue: number = 0;

    public DisplayUnits: string = 'auto';
    public DisplayDigits: number = 1;

    public TickCount: number = 3;

    public FontFamily: string = 'Calibri';
    public FontColor: string = '#666666';
    public FontSize: number = 10;
}

export class DataColors {
    public seriesFontColor: string = '#000000';
    public seriesColor: string = '#000000';
}

export class DataLabelSettings {
    public DisplayUnits: string = 'auto';
    public DisplayDigits: number = 1;

    public FontFamily: string = 'Calibri';

    public SumLabelFontSize: number = 10;
    public SumLabelColor: string = '#000000';
    public SumLabelBackgroundColor: string = '#ffffff';
    public SumLabelDisplayTolerance: number = 10;
    public SumLabelToggle: boolean = true;
    public SumLabelBgToggle: boolean = true;

    public BarLabelToggle: boolean = true;
    public BarLabelColor: string = '#000000';
    public BarLabelFontSize: number = 10;
    public BarLabelDisplayTolerance: number = 15;
}

export class LegendSettings {
    public LegendToggle: boolean = true;
    public LegendPosition: string = 'top';
    public LegendMargin: number = 0;

    public FontColor: string = '#000000';
    public FontFamily: string = 'Calibri';
    public FontSize: number = 13;
}

export class ThresholdSettings {
    public ThresholdToggle: boolean = true;
    public ThresholdAlign: boolean = false;
    public LineThickness: number = 1;
    public LineOffsetHeight: number = 0;
    public LineColor: string = '#FF0000';
    public LineType: string = 'dashed';
}

export class PrimaryGrowthSettings {
    public TogglePrimaryIndicators: boolean = true;

    public Selector1: string = '';
    public Selector2: string = '';
}

export class SecondaryGrowthSettings {
    public ToggleSecondaryIndicator: boolean = true;

    public Selector1: string = '';
    public Selector2: string = '';

    public GroupSelectors: string = '';
}

export class PrimaryLabelSettings {
    public LabelBackgroundColor: string = '#ffffff';

    public FontColor: string = '#000000';
    public FontFamily: string = 'Calibri';
    public FontSize: number = 11;

    public BorderColor: string = '#808080';
    public BorderSize: number = 1;

    public LabelOffsetHeight: number = 0;
    public LabelHeight: number = 10;
    public LabelMinWidth: number = 20;

    public ShowSign: boolean = true;
    public ToggleBgShape: boolean = true;
}

export class PrimaryLineSettings {
    public AlignIndicators: boolean = false;

    public LineColor: string = '#808080';
    public LineOffsetHeight: number = 25;
    public LineSize: number = 1;

    public ArrowSize: number = 20;
    public DisplayArrow: string = 'both';
}

export class SecondaryLabelSettings {
    public DisplaySide: string = 'right';

    public xOffset: number = 40;

    public LabelBackgroundColor: string = '#ffffff';

    public BorderColor: string = '#808080';
    public BorderSize: number = 1;

    public FontColor: string = '#000000';
    public FontFamily: string = 'Calibri';
    public FontSize: number = 11;

    public LabelHeight: number = 10;
    public LabelMinWidth: number = 20;

    public ShowSign: boolean = true;
    public ToggleBgShape: boolean = true;
}

export class SecondaryLineSettings {
    public LineColor: string = '#808080';
    public LineSize: number = 1;
    public LineType: string = 'dashed';

    public ArrowSize: number = 20;
    public DisplayArrow: string = 'none';
}
