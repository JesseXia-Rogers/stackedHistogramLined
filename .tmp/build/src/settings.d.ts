import { dataViewObjectsParser } from "powerbi-visuals-utils-dataviewutils";
import DataViewObjectsParser = dataViewObjectsParser.DataViewObjectsParser;
export declare class VisualSettings extends DataViewObjectsParser {
    DataColors: DataColors;
    LabelSettings: LabelSettings;
    ThresholdSettings: ThresholdSettings;
    GrowthSettings: GrowthSettings;
    AxisSettings: AxisSettings;
}
export declare class DataColors {
    seriesColor: string;
}
export declare class AxisSettings {
    GroupedBars: boolean;
    ChartMargin: number;
    LegendPosition: string;
    YMaxValue: number;
    YAxisCount: number;
    XAxisBarWhiteSpace: number;
    XAxisCleanToggle: boolean;
}
export declare class LabelSettings {
    YAxisText: string;
    YAxisColor: string;
    YAxisFontFamily: string;
    YAxisFontSize: number;
    YAxisValueColor: string;
    YAxisValueFontFamily: string;
    YAxisValueFontSize: number;
    XAxisText: string;
    XAxisColor: string;
    XAxisFontFamily: string;
    XAxisFontSize: number;
    XAxisValueColor: string;
    XAxisValueFontFamily: string;
    XAxisValueFontSize: number;
    LabelColor: string;
    LabelFontFamily: string;
    LabelFontSize: number;
    LabelBackgroundColor: string;
    LabelToggle: boolean;
    LegendColor: string;
    LegendFontFamily: string;
    LegendFontSize: number;
}
export declare class ThresholdSettings {
    ThresholdLineThickness: number;
    ThresholdLineColor: string;
    ThresholdLineType: string;
}
export declare class GrowthSettings {
    Selector1: string;
    Selector2: string;
    FontColor: string;
    FontFamily: string;
    FontSize: number;
    LineColor: string;
    LineOffsetHeight: number;
    LineSize: number;
    LabelBackgroundColor: string;
    LabelHeight: number;
    LabelWidth: number;
    ArrowSize: number;
    ArrowToggle: boolean;
}
