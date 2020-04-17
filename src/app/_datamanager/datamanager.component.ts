import { Component, OnInit } from '@angular/core';
import * as D3 from 'd3';

import { Data } from '../../assets/data/Data';

@Component({
    selector: 'app-datamanager',
    templateUrl: './datamanager.component.html',
})
export class DataManagerComponent implements OnInit {
    
    private _current_data: Array<any>;
    private _current_data_groupedByCountry: any;
    private _lastweek_data: Array<any>;
    private _lastweek_data_groupedByCountry: any;
    
    private _predictionSummary_data: Array<any>;
    private _prediction_data: Array<any>;
    private _prediction_data_groupedByCountry: any;

    private _data_ids: Array<any>;
    private _data_map: Map<any, any>;
    private countries_id: Array<any> = [
        "Switzerland","Belgium","Netherlands","Turkey","South Korea",
        "Austria","Canada","Portugal","Norway","Australia",
        "Sweden","Brazil","US","China","Italy","Spain","Germany","France",
        "United Kingdom","Netherlands","Poland"
    ]

    private _timeRange: Array<Date>;
    private countries_selection = ["Austria","Brazil","Netherlands","Italy","US"];

    private _colors: D3.ScaleOrdinal<string, string>;
    private _colors_array = [
        '#e6194b', '#f58231', '#ffe119', '#bfef45', '#3cb44b',
        '#808000', '#42d4f4', '#4363d8', '#911eb4', '#f032e6',
        '#fabebe', '#ffd8b1', '#9a6324', '#800000', '#e6beff',
        '#aaffc3', '#469990', '#000075', '#808080', '#000000',
    ]

    constructor() {
        this.fetchBasicData();
        this._data_ids = this.getUniqueCountriesId();
        this.groupBasicData();

        this._data_map = new Map();
        this._timeRange = new Array<Date>();

        this._colors = D3.scaleOrdinal(this._colors_array);
    }
    groupBasicData(){
        this._current_data_groupedByCountry = this.groupCurrentDataByCountry();           
        this._prediction_data_groupedByCountry = this.groupPredictionDataByCountry();
        this._lastweek_data_groupedByCountry = this.groupLastWeekDataByCountry();
    }
    ngOnInit(): void {
        throw new Error("Method not implemented.");
    }
    updateSelectedCountries(countries){
        let result = [];
        this.countries_selection.forEach((c)=>{
            if(countries.includes(c)) result.push(c)
        })
        countries.forEach((c)=>{
            if(!result.includes(c)) result.push(c)
        })
        this.countries_selection = result;
        return this.countries_selection;
    }
    fetchBasicData(){
        this._current_data = this.fetchCurrentData();
        this._prediction_data = this.fetchPredictionData();
        this._lastweek_data = this.fetchLastWeekData();
        this._predictionSummary_data = this.fetchPredictionSummaryData();
    }
    fetchCurrentData(): any[] {
        let d = Data.getCurrentData();  
        d = this.parseDateStringObjToDateObj(d);
        return d;
    }
    fetchLastWeekData(): any[] {
        let d = Data.getLastWeekData();  
        d = this.parseDateStringObjToDateObj(d);
        return d;
    }
    fetchPredictionSummaryData(): any[] {
        let d = Data.getPredictionData();  
        d = this.parseDateStringObjToDateObj(d);
        return d;
    }
    fetchPredictionData(): any[] {
        let d = Data.getPredictionCurveData();  
        d = this.parseDateStringObjToDateObj(d);
        return d;
    }
    getPredictionDataMap(){
        let map = new Map();
        if (this._predictionSummary_data) {
            this._predictionSummary_data.forEach(e => {
                map[e.country] = e;
            });
        }
        return map;
    }
    getLatestPredictedDate(){
        let latest = 0
        this._predictionSummary_data.forEach(e => {
            if(e.end_day_date>latest &&
               this.countries_selection.includes(e.country)){
                   latest = e.end_day_date;
               }
        });
        return latest;
    }
    getBiggestPredictedInfectedNumber(){
        let biggest = 0;
        let error = 0;
        
        this._predictionSummary_data.forEach(e => {
            if(e.infected_number>biggest &&
               this.countries_selection.includes(e.country)) {
                biggest = e.infected_number;
                error = e.infected_number_error;
            }
        });
        return biggest+error;
    }
    parseDateStringObjToDateObj(data){
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

    groupCurrentDataByCountry(): any{
        let grouped = this.groupBy(this._current_data, sample => sample.country);
        return grouped;
    }
    groupPredictionDataByCountry(): any{
        let grouped = this.groupBy(this._prediction_data, sample => sample.country);
        return grouped;
    }
    groupLastWeekDataByCountry(): any{
        let grouped = this.groupBy(this._lastweek_data, sample => sample.country);
        return grouped;
    }
    getUniqueCountriesId():Array<any>{
        const allCountries = this._current_data.map((c) => c.country);
        let uniques = Array.from(new Set(allCountries));
        return uniques;
    }
    getDataCountriesIds(){
        let filtered_countries_id = this.getMostEffectedCountries();

        return filtered_countries_id;
    }
    getPredictionDataByCountryList(countries: Array<string>){
        if(!countries) countries = this.getCountriesSelection()
        let result = [];
        countries.forEach(c => {
            let country = this._prediction_data_groupedByCountry.get(c);
            country.forEach(sample => {
                result.push(sample)             
            });            
        });
        return result;  
    }
    getCurrentDataByCountryList(countries: Array<string>){
        if(!countries) countries = this.getCountriesSelection()
        let result = [];
        countries.forEach(c => {
            let country = this._current_data_groupedByCountry.get(c);
            country.forEach(sample => {
                result.push(sample)             
            });            
        });
        return result;        
    }
    getLastWeekDataByCountryList(countries: Array<string>){
        if(!countries) countries = this.getCountriesSelection()
        let result = [];
        countries.forEach(c => {
            let country = this._lastweek_data_groupedByCountry.get(c);
            country.forEach(sample => {
                result.push(sample)             
            });            
        });
        return result;        
    }
    getLastDate(country_name){
        let country = this._lastweek_data_groupedByCountry.get(country_name);
        return country[country.length-1].date;
    }
    getCurrentInfections(country_name){
        let country = this._current_data_groupedByCountry.get(country_name);
        return country[country.length-1].confirmed;
    }
    getExpectedInfectionsByComparingWithCurrent(country_name){
        let cur_infections = this.getCurrentInfections(country_name);        
        let prediction_datamap = this.getPredictionDataMap();
        let info = prediction_datamap[country_name];
        let exp_infections = info.infected_number.toFixed(0);
        if(cur_infections>exp_infections){//"fix" concluded cases prediction issue
          exp_infections = cur_infections;
        }
        return exp_infections
    }
    getExpectedEndDateByComparingWithCurrent(country_name){
        let cur_date = this.getLastDate(country_name);       
        let prediction_datamap = this.getPredictionDataMap();
        let predicted_date = prediction_datamap[country_name].end_day_date;
        if(cur_date>predicted_date){//"fix" concluded cases prediction issue
          return cur_date;
        }
        return predicted_date;
    }
    getCountriesSelection() {
        return this.countries_selection;
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

    getCurrentData(): Array<any> {
        return this._current_data;
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
        return this._current_data.find((d: any) => {
            return d.id == id;
        });
    }

    createDataMap(): any {
        if (this._current_data) {
            this._data_map = new Map();
            this._current_data.forEach(e => {
                this._data_map[e.id] = e;
            });
        }
    }
    
    private getTimeExtentAsDate(): Array<Date> {
        return D3.extent(this._current_data, (d: any) => {
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
    pipeNumberToString(number: number){
        let mil = Math.floor(number/1000000);
        let tho = Math.floor((number-mil*1000000)/1000);
        let un = Math.floor(number-mil*1000000-tho*1000);
    
        let tho_str = tho+"";
        let un_str = un+"";
        
        if(mil>0) tho_str =this.addZeroToStringNumberIfNeeded(tho);
        if(tho>0) un_str =this.addZeroToStringNumberIfNeeded(un);
    
        let result_str = un_str;
        if(tho>0) result_str = tho_str+"."+result_str;
        if(mil>0) result_str = mil+"."+result_str;
    
        return result_str;    
      }
      addZeroToStringNumberIfNeeded(number){
        if(number<10) return "00"+number;
        if(number<100) return "0"+number;
        return number;
      }
      addZeroToDateStringNumberIfNeeded(number){
        if(number<10) return "0"+number;
        return number;
      }
      pipeDateObjToDateString(date_num){
        let date = new Date(date_num);
        let day = this.addZeroToDateStringNumberIfNeeded(date.getDate());
        let month = this.addZeroToDateStringNumberIfNeeded(date.getMonth()+1);
        let year = date.getFullYear()
        let result = day+"/"+month+"/"+year;
        return result;
      }
}//end class