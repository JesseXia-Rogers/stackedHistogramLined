import { dataViewObjectsParser } from "powerbi-visuals-utils-dataviewutils";
import DataViewObjectsParser = dataViewObjectsParser.DataViewObjectsParser;
export declare class VisualSettings extends DataViewObjectsParser {
    CapacitySettings: CapacitySettings;
    XAxisSettings: XAxisSettings;
    YAxisSettings: YAxisSettings;
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
    SecondaryYAxis: SecondaryYAxis;
}
export declare class LayoutSettings {
    ChartType: string;
    ChartXMargin: number;
    ChartTopMargin: number;
    ChartBottomMargin: number;
    XAxisBarWhiteSpace: number;
    YScaleFactor: number;
}
export declare class CapacitySettings {
    CapacityToggle: boolean;
    LabelAngle: number;
    XOffset: number;
    YOffset: number;
    BarHeightAdjustment: number;
}
export declare class XAxisSettings {
    FontFamily: string;
    FontColor: string;
    FontSize: number;
    LabelAngle: number;
    XOffset: number;
    YOffset: number;
}
export declare class YAxisSettings {
    DisplayUnits: string;
    DisplayDigits: number;
    MaxValue: number;
    TickCount: number;
    ToggleGridLines: boolean;
    FontFamily: string;
    FontColor: string;
    FontSize: number;
}
export declare class SecondaryYAxis {
    ToggleOn: boolean;
    MinValue: number;
    MaxValue: number;
    DisplayUnits: string;
    DisplayDigits: number;
    TickCount: number;
    FontFamily: string;
    FontColor: string;
    FontSize: number;
}
export declare class DataColors {
    seriesFontColor: string;
    seriesColor: string;
}
export declare class DataLabelSettings {
    DisplayUnits: string;
    DisplayDigits: number;
    FontFamily: string;
    SumLabelFontSize: number;
    SumLabelColor: string;
    SumLabelBackgroundColor: string;
    SumLabelDisplayTolerance: number;
    SumLabelToggle: boolean;
    SumLabelBgToggle: boolean;
    BarLabelToggle: boolean;
    BarLabelColor: string;
    BarLabelFontSize: number;
    BarLabelDisplayTolerance: number;
}
export declare class LegendSettings {
    LegendToggle: boolean;
    LegendPosition: string;
    LegendMargin: number;
    FontColor: string;
    FontFamily: string;
    FontSize: number;
}
export declare class ThresholdSettings {
    ThresholdToggle: boolean;
    ThresholdAlign: boolean;
    LineThickness: number;
    LineOffsetHeight: number;
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
    GroupSelectors: string;
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
    ShowSign: boolean;
    ToggleBgShape: boolean;
}
export declare class PrimaryLineSettings {
    AlignIndicators: boolean;
    LineColor: string;
    LineOffsetHeight: number;
    LineSize: number;
    ArrowSize: number;
    DisplayArrow: string;
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
    ShowSign: boolean;
    ToggleBgShape: boolean;
}
export declare class SecondaryLineSettings {
    LineColor: string;
    LineSize: number;
    LineType: string;
    ArrowSize: number;
    DisplayArrow: string;
}
