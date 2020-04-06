import { Component } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import { environment } from 'src/environments/environment';
import { ConfigService } from './config.service';
import { MapboxService } from './mapbox.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'geo-app';
  map:mapboxgl.Map;
  localityData: any;
  pincodeData: any;
  localityPage=true;
  isPopupOpen=true;
  properties;
  chartOptions = {
    responsive: true
  };
  chartDataIncome = []
  chartLabelsIncome = [];
  chartDataExpenditure = []
  chartLabelsExpenditure = [];
  isChartIncome=false;
  isChartExpenditure=false;
  chartOptionsExpenditure={};
  chartOptionsIncome={};
  navbarReportTitle;
  expenditureJson ;
  incomeJson ;

constructor(private configService:ConfigService){
  }
ngOnInit() {
  this.fetchLocality();
}

resetMap(){
  this.chartDataIncome = []
  this.chartLabelsIncome = [];
  this.chartDataExpenditure = []
  this.chartLabelsExpenditure = [];
  this.chartOptionsExpenditure={};
  this.chartOptionsIncome={};
  this.isChartIncome=false;
  this.isChartExpenditure=false;
}

btnClicked(e){
  e.preventDefault();
  this.localityPage=!this.localityPage;
  this.navbarReportTitle=``;
  this.resetMap();
  this.properties={};
  if(!this.localityPage && this.pincodeData==null || !this.pincodeData){
    this.fetchPincode();
  }
  else{
    this.loadMap();
  }
}

fetchLocality(){
  //console.log('inside fetch locality');
  this.configService.fetchLocality()
    .subscribe((data: any) => {
       //console.log('locality',data);
       this.localityData=this.convertToGeoJSON(data);
       this.loadMap();
    });
}

fetchPincode(){
  //console.log('inside fetch pincode');
  this.configService.fetchPincode()
  .subscribe((data: any) => {
     //console.log('pincode',data);
     this.pincodeData=this.convertToGeoJSON(data);
     this.loadMap();
  });
}

convertToGeoJSON(data){
  let GeoJSON ={}
  GeoJSON['type']="FeatureCollection";
  let features=[];
  data.features.forEach(element => {
    let feature={}
    let geometry ={}
    geometry['coordinates']=[]
    feature['type']="Feature";
    geometry['type']="Polygon";
    geometry['coordinates']['0']=element.geometry.rings[0];
    feature['properties']=element.attributes;
    feature['geometry']=geometry;
    features.push(feature);
  });
  GeoJSON['type']="FeatureCollection";
  GeoJSON['features']=features;
  return GeoJSON;
// {"type":"FeatureCollection","features":[{"type":"Feature","geometry":{"type":"Point","coordinates":[
}


loadMap(){
  mapboxgl.accessToken = environment.mapbox.accessToken;
  this.map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [77.5,12.96],
    zoom: 11
    });

  // Add zoom and rotation controls to the map.
  this.map.addControl(new mapboxgl.NavigationControl(),'top-left');

    this.map.on('load', ()=> {
      // Add a source for the state polygons.
      this.map.addSource('states', {
      'type': 'geojson',
      'data': this.localityPage? this.localityData : this.pincodeData
      });
      
      // Add a layer showing the state polygons.
      this.map.addLayer({
      'id': 'states-layer',
      'type': 'fill',
      'source': 'states',
      'paint': {
      'fill-color': 'rgba(215, 246, 255, 0.6)',
      'fill-outline-color': '#36A2F9'
      }
      });

      // When a click event occurs on a feature in the states layer, open a popup at the
      // location of the click, with description HTML from its properties.
      this.map.on('click', 'states-layer', (e) => {
        let properties=e.features[0].properties;
        this.properties=properties;
        //.log('map clicked',this.properties)

        if(this.localityPage){
          this.navbarReportTitle=`Locality ID ${properties.locality_i}`;
          if(this.incomeJson)
          this.createChartIncome(this.incomeJson,properties.locality)
          else
          this.fetchIncome(properties.locality);
        }else{
          this.navbarReportTitle=`Individual Pincode Report for ${properties.pincode}`;
          if(this.expenditureJson)
          this.createChartExpenditure(this.expenditureJson,properties.pincode)
          else
          this.fetchExpenditure(properties.pincode);
        }
        let th=this.localityPage?'Locality':'Pincode';
        let td=this.localityPage?properties.locality:properties.pincode;
        let html=`<table style="border:1px solid grey">
          <tr>
            <th >${th}</th>
            <th>Population</th>
            <th>Households</th>
          </tr>
          <tr>
            <td>${td}</td>
            <td>${properties.population}</td>
            <td>${properties.households}</td>
          </tr>
        </table>
        <button style="border-radius:5px;background:black;color:white;margin:auto;display:block">View Data</button>`
          let popup= new mapboxgl.Popup(
            { closeButton:true,
              closeOnClick:true})
          .setLngLat(e.lngLat)
          .setHTML(html)
          .addTo(this.map)
      }); 
    });
  }
 

  fetchExpenditure(pincode){
    this.configService.fetchExpenditure()
    .subscribe((data: any) => {
      this.expenditureJson=data;
      this.createChartExpenditure(data,pincode);
    });
  }

  fetchIncome(locality){
    this.configService.fetchIncome()
    .subscribe((data: any) => {
      this.incomeJson=data;
      this.createChartIncome(data,locality)
    })
  }

  createChartExpenditure(data,pincode){
    data.filter((obj)=>{
      if(obj['pincode']==pincode) 
      return true;
    })
     if(data.length!==0)
     {
      this.isChartExpenditure=true;
      let labels=Object.keys(data['0']).filter(el=>el!=='pincode');
      let dataArray=[];
      let borderColorArray=[];
      let bgColorArray=[]
      labels.forEach(element => {
        dataArray.push(data['0'][element])
        bgColorArray.push('#36A2F9');
        borderColorArray.push('#ffffff');
      });
      this.chartDataExpenditure = [
           { data:[...dataArray],
             label: 'Expenditure for '+pincode,
             backgroundColor: [...bgColorArray],
             borderColor: [...borderColorArray] }
      ]
      this.chartLabelsExpenditure = [...labels];
      this.chartOptionsExpenditure= {
        scales: {
          yAxes: [{
            scaleLabel: {
              display: true,
              labelString: 'Total Expenditure in lakhs'
            }
          }]
        },
        title: {
          display: true,
          text: `Expenditure for ${pincode}`,
          position:'bottom',
          fontColor: '#36A2F9'
        }     
      }
    }else{
      this.isChartExpenditure=false;
    }
  }


createChartIncome(data,locality){
  data=data.filter((obj)=>{
    if(obj['locality']==locality) 
    return true;
  })
   if(data.length!==0)
   {
    this.isChartIncome=true;
    this.chartDataIncome = [
      { data: [data[0].income], 
        label: data[0].locality,
        backgroundColor: ['#36A2F9'],
        borderColor: ['#ffffff' ] }
    ];   
    this.chartLabelsIncome = [data[0].locality];
    this.chartOptionsIncome= {
        title: {
            display: true,
            text: 'Monthly Income Distribution',
            position:'bottom',
            fontColor: '#36A2F9'
      }
    }
  }else{
    this.isChartIncome=false;
  }
}

}

