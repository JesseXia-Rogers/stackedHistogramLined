"use strict";

import "core-js/stable";
import "./../style/visual.less";
import powerbi from "powerbi-visuals-api";
import { VisualSettings } from "./settings";
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
import { BarChart } from './chart';
import * as Interfaces from './interfaces';
import { Primitive } from "d3-array";
import { svg } from "d3";


export class Visual implements IVisual {
    private _host: IVisualHost;
    private _target: HTMLElement;
    private _barchat: BarChart;
    private _settings: VisualSettings;
    private _dataView: DataView;
    private _selectionManager: ISelectionManager;
    private _dataPointsSeries: Interfaces.DataPointSerie[];
    private _series: DataViewValueColumnGroup[];
    private _colorPalette: colorPalette; 

    constructor(options: VisualConstructorOptions) {
        this._target = options.element;
        this._host = options.host;
        this._dataView = null;

        this._selectionManager = this._host.createSelectionManager();
        this._dataPointsSeries = [];
        this._series = [];
        this._colorPalette = this._host.colorPalette;
    }

    public update(options: VisualUpdateOptions) {
        this._dataView = options.dataViews[0];
 
        // this._dataPointsSeries = [];
        // this._settings = VisualSettings.parse<VisualSettings>(options.dataViews[0]);
        
        const dataView = this._dataView;
        
        // get groupped values for series
        this._series = dataView.categorical.values.grouped();
        console.log(this._series);
        console.log(dataView);

        // var svg: d3.Selection<d3.BaseType, unknown, HTMLElement, any> = d3.select("svg"),
        //     margin = {top: 20, right: 20, bottom: 30, left: 40},
        //     width =+svg.attr("width") - margin.left - margin.right,
        //     height =+svg.attr("height") - margin.top - margin.bottom,
        //     g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // var x0 = d3.scaleBand()
        //     .rangeRound([0, width])
        //     .paddingInner(0.05);
        
        // var x1 = d3.scaleBand()
        //     .padding(0.05);

        // var y = d3.scaleLinear()
        //     .rangeRound([height, 0]);

        // var z = d3.scaleOrdinal()
        //     .range(["#98abc5", "#a05d56", "#d0743c", "#ff8c00"]);

        d3.csv("https://storage.googleapis.com/kagglesdsdata/datasets/1226038/2047221/heart.csv?X-Goog-Algorithm=GOOG4-RSA-SHA256&X-Goog-Credential=gcp-kaggle-com%40kaggle-161607.iam.gserviceaccount.com%2F20210419%2Fauto%2Fstorage%2Fgoog4_request&X-Goog-Date=20210419T004517Z&X-Goog-Expires=259199&X-Goog-SignedHeaders=host&X-Goog-Signature=0192d8e2e8c8531ea356f47ababd5698d60d4e0064bf514ab0894142b9d083cdbf71a0397c9697feefa94fd0488c98893d01797c1f3c92b4c45183e174961f7eaec6407db7dd404bbe33795a4439fca03b615e6122a4ad15ea2cedfd4a1e44c33c85ec76f67d387a1409a261e5355262118380d2d1c1b35d14980e3c5362bde806f2f44208ee14b31c296008b14814bc327a91e296f9dcf01bfbc2d1e088b891d767e9e8be3a5c467fb9a38ed3e5fb653f34bcf04168a2be61ea9c845ac24c17f500d07d651d51bf143d44ea5e9338558e99dc0f65b2f5d487e346a34d80933c72d22b1b15c1e2a84a68035dd3e1862cc0f927a29ebcddd3c84984a8a8b4fe6a").then(d => console.log(d))

        // // iterate all series to generate selection and create button elements to use selections
        // this._series.forEach((serie: powerbi.DataViewValueColumnGroup, idx) => {
        //     // create selection id for series
        //     const seriesSelectionId = this._host.createSelectionIdBuilder()
        //         .withSeries(dataView.categorical.values, serie)
        //         .createSelectionId();

        //     this._dataPointsSeries.push({
        //         value: serie.name,
        //         selection: seriesSelectionId,
        //         seriesColor: this.getColorValue<string>(
        //             serie.objects, 
        //             'DataColors', 
        //             'seriesColor', 
        //             this._colorPalette['colors'][idx].value ?? 
        //             this._settings.DataColors.seriesColor
        //         )
        //     });
        // });

        try {
            dp.transformData(this._dataView);
        }
        catch (e) {
            console.error(e);
        }

        // // delete instance if already exists
        // if (this._barchat !== null) {
        //     this._barchat = null;
        // }
        
        // if (dp.BarDataProcessed.length == 0) {
        //     console.error('Data Processed is empty of consolidation');
        //     return;
        // }

        // this._barchat = new BarChart(
        //     dp.BarDataProcessed, 
        //     this._target, 
        //     this._settings,
        //     this._dataPointsSeries,
        //     this._selectionManager
        // ); 
    }

    public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
        let objectName = options.objectName;
        let objectEnumeration: VisualObjectInstance[] = [];

        if (objectName == 'DataColors') {
            this._dataPointsSeries.forEach(dataPoint => {
                objectEnumeration.push({
                    objectName: objectName,
                    displayName: dataPoint.value.toString(),
                    properties: {
                        seriesColor: {
                            solid: {
                                color: dataPoint.seriesColor
                            }
                        }
                    },
                    selector: dataPoint.selection.getSelector() // null works too but be more specific just in case
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
                try {
                    let color = object[propertyName]['solid'].color;
                    if (color) {
                        return color;
                    }
                }
                catch (err) {}
            }
        }

        return defaultValue;
    }
}
