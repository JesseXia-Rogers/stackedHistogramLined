import { Visual } from "../../src/visual";
import powerbiVisualsApi from "powerbi-visuals-api";
import IVisualPlugin = powerbiVisualsApi.visuals.plugins.IVisualPlugin;
import VisualConstructorOptions = powerbiVisualsApi.extensibility.visual.VisualConstructorOptions;

var powerbiKey: any = "powerbi";
var powerbi: any = window[powerbiKey];
var stackedHistogramLined26F8DE7BF82D4BE7B654B878A184D90E: IVisualPlugin = {
    name: 'stackedHistogramLined26F8DE7BF82D4BE7B654B878A184D90E',
    displayName: 'StackedHistogramLined',
    class: 'Visual',
    apiVersion: '3.2.0',
    create: (options: VisualConstructorOptions) => {
        if (Visual) {
            return new Visual(options);
        }
        throw 'Visual instance not found';
    },
    
    custom: true
};
if (typeof powerbi !== "undefined") {
    powerbi.visuals = powerbi.visuals || {};
    powerbi.visuals.plugins = powerbi.visuals.plugins || {};
    powerbi.visuals.plugins["stackedHistogramLined26F8DE7BF82D4BE7B654B878A184D90E"] = stackedHistogramLined26F8DE7BF82D4BE7B654B878A184D90E;
}
export default stackedHistogramLined26F8DE7BF82D4BE7B654B878A184D90E;