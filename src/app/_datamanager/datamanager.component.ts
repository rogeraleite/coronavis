import { Component, OnInit } from '@angular/core';
import * as D3 from 'd3';

import { Data } from '../../assets/data/Data';

@Component({
    selector: 'app-datamanager',
    templateUrl: './datamanager.component.html',
})
export class DataManagerComponent implements OnInit {
    private _data: Array<any>;
    private _data_grouped_by_country: Array<any>;
    private _data_ids: Array<any>;
    private _data_map: Map<any, any>;

    private _timeRange: Array<Date>;
    private timeLinearScale: D3.ScaleLinear<number, number>;

    private MIN_DATE: Date;
    private MAX_DATE: Date;

    private _colors: D3.ScaleOrdinal<string, string>;

    constructor() {
        this._data = Data.getData();
        this._data_ids = this.calculateDataIds();
        this._data_grouped_by_country = this.groupDataByCountry();

        this._data_map = new Map();
        this._timeRange = new Array<Date>();

        this._colors = D3.scaleOrdinal([
            '#e6194b', '#f58231', '#ffe119', '#bfef45', '#3cb44b',
            '#808000', '#42d4f4', '#4363d8', '#911eb4', '#f032e6',
            '#fabebe', '#ffd8b1', '#9a6324', '#800000', '#e6beff',
            '#aaffc3', '#469990', '#000075', '#808080', '#000000',
        ]);
    }
    
    ngOnInit(): void {
        throw new Error("Method not implemented.");
    }
    groupDataByCountry(): Array<any>{
        // this._data_grouped_by_country = [];
        // let result = [];
        // for (let item in this._data) {
        //     resultArr.push({ Phase: item, Value: obj[item] });
        // }
        return null;
    }

    calculateDataIds():Array<any>{
        const allCountries = this._data.map((c) => c.country);
        let uniques = Array.from(new Set(allCountries));
        return uniques;
    }
    getDataIds(){
        return this._data_ids;
    }

    get dataMap(): Map<any, any> {
        return this._data_map;
    }

    getData(): Array<any> {
        return this._data;
    }

    get timeRange(): any {
        return this._timeRange;
    }

    get colors(): D3.ScaleOrdinal<string, string> {
        return this._colors;
    }

    getNodeById(id: string): any {
        return this._data.find((d: any) => {
            return d.id == id;
        });
    }


    createDataMap(): any {
        if (this._data) {
            this._data_map = new Map();
            this._data.forEach(e => {
                this._data_map[e.id] = e;
            });
        }
    }

    
    private getTimeExtentAsDate(): Array<Date> {
        return D3.extent(this._data, (d: any) => {
            return d.date_time;
        });
    }
   
}//end class