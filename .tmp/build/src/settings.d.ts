import { dataViewObjectsParser } from "powerbi-visuals-utils-dataviewutils";
import DataViewObjectsParser = dataViewObjectsParser.DataViewObjectsParser;
export declare class VisualSettings extends DataViewObjectsParser {
    AxisLabelSettings: AxisLabelSettings;
    DataLabelSettings: DataLabelSettings;
    ThresholdSettings: ThresholdSettings;
    PrimaryGrowthSettings: PrimaryGrowthSettings;
    SecondaryGrowthSettings: SecondaryGrowthSettings;
    LayoutSettings: LayoutSettings;
    DataColors: DataColors;
    LegendSettings: LegendSettings;
    PrimaryLabelSettings: PrimaryLabelSettings;
    PrimaryLineSettings: PrimaryLineSettings;
    SecondaryLabelSettings: SecondaryLabelSettings;
    SecondaryLineSettings: SecondaryLineSettings;
}
export declare class LayoutSettings {
    ChartType: string;
    YMaxValue: number;
    YAxisCount: number;
    XAxisBarWhiteSpace: number;
    ToggleGridLines: boolean;
    CapacityToggle: boolean;
}
export declare class AxisLabelSettings {
    DisplayUnits: string;
    YAxisText: string;
    XAxisText: string;
    YAxisLabelToggle: boolean;
    XAxisLabelToggle: boolean;
    FontFamily: string;
    AxisFontColor: string;
    AxisFontSize: number;
    AxisValueColor: string;
    AxisValueFontSize: number;
    AxisLabelAngle: number;
}
export declare class DataColors {
    seriesFontColor: string;
    seriesColor: string;
}
export declare class DataLabelSettings {
    DisplayUnits: string;
    DisplayDigits: number;
    FontFamily: string;
    SumLabelToggle: boolean;
    SumLabelColor: string;
    SumLabelFontSize: number;
    SumLabelBackgroundColor: string;
    BarLabelToggle: boolean;
    BarLabelColor: string;
    BarLabelFontSize: number;
}
export declare class LegendSettings {
    LegendPosition: string;
    FontColor: string;
    FontFamily: string;
    FontSize: number;
}
export declare class ThresholdSettings {
    ThresholdToggle: boolean;
    LineThickness: number;
    LineColor: string;
    LineType: string;
}
export declare class PrimaryGrowthSettings {
    TogglePrimaryIndicators: boolean;
    Selector1: string;
    Selector2: string;
}
export declare class SecondaryGrowthSettings {
    ToggleSecondaryIndicator: boolean;
    Selector1: string;
    Selector2: string;
    SelectorsList: string;
}
export declare class PrimaryLabelSettings {
    LabelBackgroundColor: string;
    FontColor: string;
    FontFamily: string;
    FontSize: number;
    BorderColor: string;
    BorderSize: number;
    LabelOffsetHeight: number;
    LabelHeight: number;
    LabelMinWidth: number;
    ToggleBgShape: boolean;
}
export declare class PrimaryLineSettings {
    AlignIndicators: boolean;
    LineColor: string;
    LineOffsetHeight: number;
    LineSize: number;
    ArrowSize: number;
    ArrowToggle: boolean;
}
export declare class SecondaryLabelSettings {
    DisplaySide: string;
    xOffset: number;
    LabelBackgroundColor: string;
    BorderColor: string;
    BorderSize: number;
    FontColor: string;
    FontFamily: string;
    FontSize: number;
    LabelHeight: number;
    LabelMinWidth: number;
    ToggleBgShape: boolean;
}
export declare class SecondaryLineSettings {
    LineColor: string;
    LineType: string;
    LineSize: number;
    ArrowSize: number;
    ArrowToggle: boolean;
}
