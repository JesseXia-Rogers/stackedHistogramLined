import * as Interfaces from './interfaces';
import * as d3 from 'd3';
import powerbi from 'powerbi-visuals-api';
import { VisualSettings } from './settings';
import ISelectionManager = powerbi.extensibility.ISelectionManager;
declare type Selection<T extends d3.BaseType> = d3.Selection<T, any, any, any>;
export declare class D3Visual {
    private _settings;
    private _dataPointSeries;
    private _selectionManager;
    dimension: Interfaces.Dimension;
    parent: HTMLElement;
    container: HTMLElement;
    svg: Selection<SVGElement>;
    legend: Selection<SVGElement>;
    constructor(parent: HTMLElement, settings: VisualSettings, dataPointSeries: Interfaces.DataPointSerie[], selectionManager: ISelectionManager);
    formatData(): void;
    CreateVisualContainer(): void;
    private getRange;
    private nFormatter;
}
export {};
