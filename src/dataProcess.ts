import * as Interfaces from './interfaces';
import powerbi from "powerbi-visuals-api";
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import DataView = powerbi.DataView;
import PrimitiveValue = powerbi.PrimitiveValue;
import DataViewValueColumnGroup = powerbi.DataViewValueColumnGroup;
import DataViewValueColumn = powerbi.DataViewValueColumn;


export let Threshold: number = 0;
export let Capacity: number[] = [];
export let Regions: string[] = [];
export let BarDataProcessed: Interfaces.BarData[] = [];
export let DataNumeric: Interfaces.Numeric;


export function transformData(dataView: DataView): void {
    // reset global var data
    // reset
    Threshold = 0;
    Capacity = [];
    Regions = [];
    BarDataProcessed = [];
    DataNumeric = {
        min: 0,
        max: 0,
        value: 0,
        topRounded: 0,
        interval: 0
    };

    if (!dataView) {
        console.error('Dataview are missing.');
        return;
    }

    if (!dataView.categorical || 
        !dataView.categorical.categories || 
        !dataView.categorical.values ||
        !dataView.categorical.values.source) {

        console.error('One or more required Dataview data are missing.');
        return;
    }

    
    const series: DataViewValueColumnGroup[] = dataView.categorical.values.grouped();

    const category = dataView.categorical.categories[0];
    const columns = category.values;

    for (let idx = 0; idx < columns.length; ++idx) {
        let col: PrimitiveValue = columns[idx] ?? '';
        let barData: Interfaces.BarData = {
            column: col.toString(),
            data: [],
            index: idx
        };
        // series traversal is O(1)
        series.forEach(serie => {      
            let serieName = serie.name ?? '';
            serie.values.forEach(val => {
                if (val.source.displayName.toLowerCase().includes('value')) {
                    let seriesValue = isNaN(Number(val.values[idx])) ? 0 : Number(val.values[idx]);
                    barData.data.push({
                        region: serieName.toString(),
                        value: seriesValue
                    })
                }
            })
        });

        BarDataProcessed.push(barData);
    }
    
    // get threshold values
    for (let val of series[0].values) {
        if (val.source.displayName.toLowerCase().includes('threshold')) {
            Threshold += isNaN(Number(val.values[0])) ? 0 : Number(val.values[0]);
        }
    }

    // threshold is the same all regions of same KPI
    Threshold = Threshold * series.length;

    // get capacity and region
    series.forEach(serie => {
        let region = serie.name;
        let capacity = 0;
        for (let val of serie.values) {
            if (val.source.displayName.toLowerCase().includes('capacity')) {
                capacity = isNaN(Number(val.values[0])) ? 0 : Number(val.values[0]);
                break;
            }
        }
        
        Regions.push(region.toString());
        Capacity.push(capacity)
    });

    // remove invalid entrys in BarDataProcessed. Invalid includes:
    // - first entry has missing name OR data is ALL null/0
    for (let idx = 0; idx < BarDataProcessed.length; ++idx) {
        let data = BarDataProcessed[idx];
        // let dataSum = data.data.reduce((a, b) => a + (b.value ?? 0), 0);
        if (data.column == "") {
            BarDataProcessed.shift();
        }
        else {
            break;
        }
    }
    for (let idx = BarDataProcessed.length - 1; idx >= 0; --idx) {
        let data = BarDataProcessed[idx];
        if (data.column == "") {
            BarDataProcessed.pop();
        }
        else {
            break;
        }
    }

    // check if capacity is empty
    if (Capacity.length == 0) {
        console.error('Capacity is empty.');
        return;
    }

    // check if region is empty
    if (Regions.length == 0) {
        console.error('Regions is empty.');
        return;
    }

    // add in capacity entry
    let capacityData: Interfaces.BarData = {
        column: 'Capacity',
        data: [],
        index: 0
    };

    Regions.forEach((region, idx) => {
        capacityData.data.push({
            region: region,
            value: Capacity[idx] ?? 0
        })
    });

    // insert capacity data to the front
    BarDataProcessed.unshift(capacityData);
   
    // set global numeric vars
    calculateNumerics();

    return;
}


export function calculateNumerics(): void {
    // calculates numerics from DataProcessed
    if (BarDataProcessed.length == 0) {
        console.error('BarDataProcessed is empty. Unable to get numerics.');
        return;
    }


    // // compute range
    let range: Interfaces.Range = { min: 0, max: 0, value: 0 };
    BarDataProcessed.forEach(barData => {
        let sum = 0;
        let values: number[] = [];
        barData.data.forEach(entry => {
            let value: number = entry.value;
            sum += value
            values.push(value)
        });

        let localMin = Math.min(...values);

        range.min = (localMin < range.min) ? localMin : range.min;
        range.max = (sum > range.max) ? sum : range.max;
    });

    // change range from capacity values
    let capacitySum = Capacity.reduce((a, b) => a + b, 0);
    range.max = (capacitySum > range.max) ? capacitySum : range.max;

    range.value = range.max - range.min;

    // compute top rounded
    let digits = (range.max - range.max % 1).toString().length;

    let roundBy = Math.max(Math.pow(10, digits - 1), 10);
    let topRounded = Math.ceil(range.max / roundBy) * roundBy;

    DataNumeric = {
        min: range.min,
        max: range.max,
        value: range.value,
        topRounded: topRounded,
        interval: 0
    };
}