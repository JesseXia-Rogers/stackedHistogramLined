import 'core-js/stable';
import './../style/visual.less';
import powerbi from 'powerbi-visuals-api';
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import VisualObjectInstanceEnumeration = powerbi.VisualObjectInstanceEnumeration;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
import DataViewObjects = powerbi.DataViewObjects;
export declare class Visual implements IVisual {
    private _host;
    private _target;
    private _d3Visual;
    private _settings;
    private _dataView;
    private _selectionManager;
    private _dataPointsSeries;
    private _series;
    private _colorPalette;
    constructor(options: VisualConstructorOptions);
    update(options: VisualUpdateOptions): void;
    enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration;
    getColorValue<T>(objects: DataViewObjects, objectName: string, propertyName: string, defaultValue: T): T;
}
