import powerbi from "powerbi-visuals-api";
import PrimitiveValue = powerbi.PrimitiveValue;
import ISelectionId = powerbi.visuals.ISelectionId;
export interface Range {
    min: number;
    max: number;
}
export interface Numeric {
    min: number;
    max: number;
    topRounded: number;
    interval: number;
}
export interface RegionValue {
    region: string;
    value: number;
}
export interface Dimension {
    width: number;
    height: number;
}
export interface Position {
    x: number;
    y: number;
    index: number;
}
export interface KPI {
    name: string;
    values: number[];
}
export interface BarData {
    column: string;
    data: RegionValue[];
    index: number;
}
export interface BarChartDataPoint {
    value: PrimitiveValue;
    category: string;
    color: string;
    strokeColor: string;
    strokeWidth: number;
    selectionId: ISelectionId;
}
export interface DataPointSerie {
    value: PrimitiveValue;
    selection: ISelectionId;
    seriesColor: string;
}
