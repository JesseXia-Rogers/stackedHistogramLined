'use strict';

import 'core-js/stable';
import './../style/visual.less';
import powerbi from 'powerbi-visuals-api';
import { VisualSettings } from './settings';
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import VisualObjectInstanceEnumeration = powerbi.VisualObjectInstanceEnumeration;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
import VisualObjectInstance = powerbi.VisualObjectInstance;
import DataView = powerbi.DataView;
import DataViewObjects = powerbi.DataViewObjects;
import DataViewObject = powerbi.DataViewObject;
import DataViewValueColumnGroup = powerbi.DataViewValueColumnGroup;
import ISelectionManager = powerbi.extensibility.ISelectionManager;
import colorPalette = powerbi.extensibility.ISandboxExtendedColorPalette;

import * as dp from './dataProcess';
import * as d3 from 'd3';
import { D3Visual } from './d3Visual';
import * as Interfaces from './interfaces';

type Selection<T extends d3.BaseType> = d3.Selection<T, any, any, any>;


export class Visual implements IVisual {
    private _host: IVisualHost;
    private _target: HTMLElement;
    private _d3Visual: D3Visual;
    private _settings: VisualSettings;
    private _dataView: DataView;
    private _selectionManager: ISelectionManager;
    private _dataPointsSeries: Interfaces.DataPointSerie[];
    private _series: DataViewValueColumnGroup[];
    private _colorPalette: colorPalette;

    constructor(options: VisualConstructorOptions) {
        this._host = options.host;
        this._target = options.element;
        this._settings = null;
        this._dataView = null;
        this._selectionManager = this._host.createSelectionManager();
        this._dataPointsSeries = [];
        this._series = [];
        this._colorPalette = this._host.colorPalette;
    }

    public update(options: VisualUpdateOptions) {
        this._dataView = options.dataViews[0];
        // console.log(this._dataView )
        this._settings = VisualSettings.parse<VisualSettings>(options.dataViews[0]);

        const dataView = this._dataView;

        try {
            dp.transformData(this._dataView);
        }
        catch (e) {
            this._target.innerHTML = 'Fatal error: Unable to process the data! Check console for detail error message';
            console.error(e)
            return;
        }

        // get grouped values for series
        this._series = dataView.categorical.values.grouped();

        // reset the data point series for each update
        this._dataPointsSeries = [];
        // iterate all series to generate selection and create button elements to use selections
        this._series.forEach((serie: powerbi.DataViewValueColumnGroup, idx) => {
            // create selection id for series
            const seriesSelectionId = this._host.createSelectionIdBuilder()
                .withSeries(dataView.categorical.values, serie)
                .createSelectionId();

            this._dataPointsSeries.push({
                value: serie.name,
                selection: seriesSelectionId,
                seriesColor: this.getColorValue<string>(
                    serie.objects,
                    'DataColors',
                    'seriesColor',
                    this._colorPalette['colors'][idx].value ??
                    this._settings.DataColors.seriesColor
                ),
                seriesFontColor: this.getColorValue<string>(
                    serie.objects,
                    'DataColors',
                    'seriesFontColor',
                    this._settings.DataColors.seriesFontColor
                )
            });

        });


        // delete instance if already exists
        if (this._d3Visual !== null) {
            this._d3Visual = null;
        }

        if (dp.D3Data.length == 0) {
            console.error('Data Processed is empty of consolidation');
            return;
        }

        this._d3Visual = new D3Visual(
            this._target,
            this._settings,
            this._dataPointsSeries,
            this._selectionManager
        );
    }

    // called every time a setting is changed = whenever a specific part of the visual needs to be rendered
    public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
        let objectName = options.objectName;
        let objectEnumeration: VisualObjectInstance[] = [];

        // console.log(objectEnumeration)

        // adds series-specific settings
        if (objectName == 'DataColors') {
            this._dataPointsSeries.forEach(dataPoint => {
                objectEnumeration.push({
                    objectName: objectName,
                    displayName: dataPoint.value.toString() + ' - Series Color',
                    properties: {
                        seriesColor: {
                            solid: {
                                color: dataPoint.seriesColor
                            }
                        }
                    },
                    selector: dataPoint.selection.getSelector() // null works too but be more specific just in case
                });
                objectEnumeration.push({
                    objectName: objectName,
                    displayName: dataPoint.value.toString() + ' - Bar Label Color',
                    properties: {
                        seriesFontColor: {
                            solid: {
                                color: dataPoint.seriesFontColor
                            }
                        }
                    },
                    selector: dataPoint.selection.getSelector()
                });
            });

            return objectEnumeration;
        }

        const settings: VisualSettings = this._settings || <VisualSettings>VisualSettings.getDefault();
        let instances = VisualSettings.enumerateObjectInstances(settings, options);
        return instances;
    }

    public getColorValue<T>(objects: DataViewObjects, objectName: string, propertyName: string, defaultValue: T): T {
        if (objects) {
            let object: DataViewObject = objects[objectName];
            if (object) {
                if (object[propertyName]) {
                    let color = object[propertyName]['solid'].color;
                    if (color) {
                        return color;
                    }
                }
            }
        }

        return defaultValue;
    }
}