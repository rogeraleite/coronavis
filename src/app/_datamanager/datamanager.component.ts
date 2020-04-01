import { Component, OnInit } from '@angular/core';
import * as D3 from 'd3';

import { Data } from '../../assets/data/Data';

@Component({
    selector: 'app-datamanager',
    templateUrl: './datamanager.component.html',
})
export class DataManagerComponent implements OnInit {
    
    private _data: Array<any>;
    private _data_groupedByCountry: any;
    private _lastweek_data: Array<any>;
    private _lastweek_data_groupedByCountry: any;
    private _data_ids: Array<any>;
    private _data_map: Map<any, any>;
    private countries_id: Array<any> = [
        "Switzerland","Belgium","Netherlands","Turkey","South Korea",
        "Austria","Canada","Portugal","Norway","Israel","Australia",
        "Sweden","Brazil","US","China","Italy"
    ]

    private _timeRange: Array<Date>;
    private initialSelection = ["Austria","Brazil","China","Italy","US"];

    private _colors: D3.ScaleOrdinal<string, string>;
    private _colors_array = [
        '#e6194b', '#f58231', '#ffe119', '#bfef45', '#3cb44b',
        '#808000', '#42d4f4', '#4363d8', '#911eb4', '#f032e6',
        '#fabebe', '#ffd8b1', '#9a6324', '#800000', '#e6beff',
        '#aaffc3', '#469990', '#000075', '#808080', '#000000',
    ]

    constructor() {
        this._data = this.fetchData();
        this._lastweek_data = this.fetchLastWeekData();
        this._data_ids = this.getUniqueCountriesId();
        this._data_groupedByCountry = this.groupDataByCountry();           
        this._lastweek_data_groupedByCountry = this.groupLastWeekDataByCountry();

        this._data_map = new Map();
        this._timeRange = new Array<Date>();

        this._colors = D3.scaleOrdinal(this._colors_array);
    }
    
    ngOnInit(): void {
        throw new Error("Method not implemented.");
    }
    fetchData(): any[] {
        let d = Data.getData();  
        d = this.parsingDateStringObjToDateObj(d);
        return d;
    }
    fetchLastWeekData(): any[] {
        let d = Data.getLastWeekData();  
        d = this.parsingDateStringObjToDateObj(d);
        return d;
    }
    parsingDateStringObjToDateObj(data){
        let result = [];
        data.forEach((sample,i) => {
            if(typeof sample.date === 'string'){
                let date_split = sample.date.split("/");
                let y = 20+date_split[2];
                let d = date_split[1];
                let m = parseInt(date_split[0])-1;
                sample.date = new Date(y,m,d);
            }
            result.push(sample)             
        });
        return result;
    }

    groupDataByCountry(): any{
        let grouped = this.groupBy(this._data, sample => sample.country);
        return grouped;
    }
    groupLastWeekDataByCountry(): any{
        let grouped = this.groupBy(this._lastweek_data, sample => sample.country);
        return grouped;
    }
    getUniqueCountriesId():Array<any>{
        const allCountries = this._data.map((c) => c.country);
        let uniques = Array.from(new Set(allCountries));
        return uniques;
    }
    getDataCountriesIds(){
        let filtered_countries_id = this.getMostEffectedCountries();

        return filtered_countries_id;
    }
    getDataByCountryList(countries: Array<string>){
        if(!countries) countries = this.getInitialSelection()
        let result = [];
        countries.forEach(c => {
            let country = this._data_groupedByCountry.get(c);
            country.forEach(sample => {
                result.push(sample)             
            });            
        });
        return result;        
    }
    getLastWeekDataByCountryList(countries: Array<string>){
        if(!countries) countries = this.getInitialSelection()
        let result = [];
        countries.forEach(c => {
            let country = this._lastweek_data_groupedByCountry.get(c);
            country.forEach(sample => {
                result.push(sample)             
            });            
        });
        return result;        
    }
    getInitialSelection() {
        return this.initialSelection;
    }
    getType(v){
        return typeof v 
    }
    getColorsArray(){
        return this._colors_array;
    }

    get dataMap(): Map<any, any> {
        return this._data_map;
    }

    getData(): Array<any> {
        return this._data;
    }
    getLastWeekData(): Array<any> {
        return this._lastweek_data;
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

    groupBy(list, keyGetter) {
        const map = new Map();
        list.forEach((item) => {
             const key = keyGetter(item);
             const collection = map.get(key);
             if (!collection) {
                 map.set(key, [item]);
             } else {
                 collection.push(item);
             }
        });
        return map;
    }

    getMostEffectedCountries(){
        let result = [];
        this._data_ids.forEach(e=>{
            if(this.countries_id.indexOf(e) > -1){
                result.push(e);
            }
        })
        //check if typed names fit data names
        if(result.length == this.countries_id.length){            
            // console.log("all countries were found")
        }
        return result;
    }
   
}//end class