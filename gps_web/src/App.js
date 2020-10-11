import React, { Component} from 'react';
import {GoogleMap,Marker, LoadScript, Polyline, StandaloneSearchBox, InfoWindow, OverlayView} from "@react-google-maps/api";
import mapStyles from "./mapStyles";
import axios from 'axios';
import { Button } from 'rebass';
import DateTimePicker from 'react-datetime-picker';
import Switch from "react-switch";
import SlidingPanel from 'react-sliding-side-panel';
import Select from 'react-select';

const API_KEY = process.env.REACT_APP_MAPS_API;

const API_URL_1 = process.env.REACT_APP_API_URL_1;

const API_URL_2 = process.env.REACT_APP_API_URL_2;

const API_URL_3 = process.env.REACT_APP_API_URL_3;

const API_URL_4 = process.env.REACT_APP_API_URL_4;

const API_URL_5 = process.env.REACT_APP_API_URL_5;

const mapContainerStyle = {
  width: "100vw",
  height: "100vh",
};

const options={
  styles: mapStyles,
  disableDefaultUI: true,
  zoomControl:true,
  streetViewControl: true,
};

const searchBoxStyle={
  boxSizing: `border-box`,
  border: `1px solid transparent`,
  width: `30%`,
  height: `6%`,
  padding: `0 12px`,
  borderRadius: `3px`,
  boxShadow: `0 2px 6px rgba(0, 0, 0, 0.3)`,
  fontSize: `14px`,
  outline: `none`,
  textOverflow: `ellipses`,
  position: "absolute",
  left: "50%",
  top: "2%",
  marginLeft: "-120px"
}

const libraries=["places"]

//By: https://www.geodatasource.com/developers/javascript
function distance(lat1, lon1, lat2, lon2, unit) {
	if ((lat1 == lat2) && (lon1 == lon2)) {
		return 0;
	}
	else {
		var radlat1 = Math.PI * lat1/180;
		var radlat2 = Math.PI * lat2/180;
		var theta = lon1-lon2;
		var radtheta = Math.PI * theta/180;
		var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
		if (dist > 1) {
			dist = 1;
		}
		dist = Math.acos(dist);
		dist = dist * 180/Math.PI;
		dist = dist * 60 * 1.1515;
		if (unit=="K") { dist = dist * 1.609344 }
		if (unit=="N") { dist = dist * 0.8684 }
		return dist;
	}
}

class App extends Component {

  constructor(){
    super();
    this.state={
      center:{
        lat:10.9878,
        lng:-74.7889},
      coord:{
        lat:10.9878,
        lng:-74.7889 },
      coord_text:{lng:"XXXX",lat:"XXXX",alt:"XXXX",time:"0000"},
      sw_realtime:true,
      sw_history:false,
      history:[],
      history_filter:{
        lat:0,
        lng:0},
      date_in:new Date(),
      date_fin:new Date(),
      openPanel:false,
      ID:{value:"1",label:"Camion 1"},
      Opt:[],
      sw_his_tag:false,
      sw_tag:true,
      sw_trace:true,
      trace:[],
      trace_init:new Date(),
      Infotime:0,
      Infoposition:{
        lat:0,
        lng:0
      },
      sw_info_tag:false,
    };

  }

  callAPI_users(){
    axios.get(API_URL_3)
      .then((res)=>{
        for (var i=0; i<((res.data).length); i++){
          this.state.Opt.push({value:(((res.data)[i]).truck), label:("Camion ").concat((((res.data)[i]).truck).toString())});
        }
      });
  }

  callAPI_actual(){

    axios.post(API_URL_1,({
      ID:((this.state.ID).value)
    }))
      .then((res) => {
        try{
          this.setState({
            coord:{
              lat:res.data[0].lat,
              lng:res.data[0].lng
            }
          });

          var buff_lat=(res.data[0].lat).toString();
          var buff_lng=(res.data[0].lng).toString();
          var buff_time=(res.data[0].timegps).toString();
          var buff_alt=(res.data[0].alt).toString();

          this.setState({
            coord_text:{lng:buff_lng,lat:buff_lat,alt:buff_alt,time:buff_time}
          });
        }catch(error){
          console.log(Error);
        }
      });
  }

  callAPI_history(){

    axios.post(API_URL_2,({
      timestamp_in:(this.state.date_in).getTime(),
      timestamp_fin:(this.state.date_fin).getTime(),
      ID:((this.state.ID).value)
    }))

      .then((res) => {
        var buff = (res.data);
        this.setState({
          history:buff
        });
      });

  }

  callAPI_trace(){

    axios.post(API_URL_4,({
      trace_init:(this.state.trace_init).getTime(),
      trace_actual:(new Date()).getTime(),
      ID:((this.state.ID).value)
    }))

    .then((res) => {
      var buff = (res.data);
      this.setState({
        trace:buff
      });
    });

  }

  callAPI_infohistory(){

    var distance_buff = 9999999999; 
    var history_filtered = {lat:0,lng:0}

    for (var i = 0 ; i<=((this.state.history).length - 1) ; i++){
      var distance_calc = distance((this.state.history_filter).lat,(this.state.history_filter).lng,(this.state.history[i]).lat,(this.state.history[i]).lng,'K')
      if (distance_calc<distance_buff) {
        distance_buff=distance_calc
        history_filtered.lat=(this.state.history[i]).lat
        history_filtered.lng=(this.state.history[i]).lng
      }
    }

    axios.post(API_URL_5,({
      position:history_filtered,
      timestamp_in:(this.state.date_in).getTime(),
      timestamp_fin:(this.state.date_fin).getTime(),
      ID:((this.state.ID).value)
    }))

    .then((res) => {
      var buff = (res.data);
      console.log(buff[0].timegps);
      this.setState({
        Infotime:buff[0].timegps,
        Infoposition:history_filtered,
        sw_info_tag:true
      })
    })

  }

  set_timer1(){
    this.timer1 = setInterval(() => {this.callAPI_actual();}, 1000);
  }

  set_timer2(){
    this.timer2 = setInterval(() => {this.callAPI_history();},1000);
  }

  set_timer3(){
    this.timer3 = setInterval(() => {this.callAPI_trace();},1000);
  }

  componentDidMount(){
    console.log("Al components mounted");
    this.callAPI_users();
    this.set_timer1();
    this.setState({
      trace_init:new Date()
    });
    this.set_timer3();
  }

  render(){return (

    <div>

    <title>GPS<span role="img" aria-label="Satellite Antenna">📡</span></title>

    <div style={{position:'absolute',top:'50%',left:'-1%',zIndex:'15'}}>
      <Button onClick={()=>{this.setState({openPanel:!this.state.openPanel})}} style={{color:'black',background:'white'}}>
      <span role="img" aria-label="Right arrow"> Advance ➡️</span>
      </Button>
    </div>

    <div style={{position:"absolute",top:"1%",left:"1%",width:"30%",height:"25%",backgroundColor:"white",zIndex:5}}>
    </div>

    <div>
    <h1 style={{top:"2%",left:"2%"}}>
      GPS Tio Rico <span role="img" aria-label="Satellite Antenna">📡</span>
    </h1>
    <h4 style={{top:"10%",left:"2%"}}>
    <body>{"Latitude: "+this.state.coord_text.lat}</body>
    </h4>
    <h4 style={{top:"13.5%",left:"2%"}}>
    <body>{"Longitude: "+this.state.coord_text.lng}</body>
    </h4>
    <h4 style={{top:"17%",left:"2%"}}>
    <body>{"Altitude: "+this.state.coord_text.alt}</body>
    </h4>
    <h4 style={{top:"20.5%",left:"2%"}}>
    <body>{"Timestamp: "+(((new Date(parseFloat(this.state.coord_text.time,10))) + "").split("("))[0]}</body>
    </h4>
    </div>

    <SlidingPanel
      type={'left'}
      isOpen={this.state.openPanel}
      size={30}
      style={{zIndex:7}}
    >

    <div style={{position:'absolute',top:"50%",left:"31%",zIndex:"15"}}>
      <Button onClick={()=>{this.setState({openPanel:!this.state.openPanel})}} style={{color:'black',background:'white'}}>
      <span role="img" aria-label="Left arrow">⬅️</span>
      </Button>
    </div>

    <div style={{position:'absolute',top:'0px',left:'0px',zIndex:'5',width:'32%',height:'100%',backgroundColor:'white'}}>
    </div>

    <h5 style={{top:"5%",left:"2%",zIndex:"10",position:"absolute"}}>Real time position:</h5>

    <div style={{position:'absolute',top:"7.5%",left:"11.5%",zIndex:"10"}}>
    <Switch
          checked={this.state.sw_realtime}
          onChange={(checked)=>{
            if(checked){
              this.set_timer1();
              this.set_timer3();
              this.setState({
                trace_init:new Date(),
                sw_tag:true,
                sw_trace:true
              });
            }else{
              clearInterval(this.timer1);
              clearInterval(this.timer3);
              this.setState({
                coord_text:{lng:"XXXX",lat:"XXXX",alt:"XXXX",time:"0000"},
                sw_tag:false,
                sw_trace:false
              });
            }
            this.setState({
              sw_realtime:checked
            });
          }}
    />
    </div>

    <h5 style={{top:"10%",left:"2%",zIndex:"10",position:"absolute"}}>Show history:</h5>

    <div style={{position:"absolute",top:"12.5%",left:"11.5%",zIndex:"10"}}>
    <Switch
          checked={this.state.sw_history}
          onChange={(checked)=>{
            if(checked){
              this.set_timer2();
              this.setState({
                sw_his_tag:true
              });
            }else{
              clearInterval(this.timer2);
              this.setState({
                sw_his_tag:false
              });
            }
            this.setState({
              sw_history:checked
            })
          }}
      />
    </div>

    <h5 style={{position:"absolute",top:"17%",left:"2%",zIndex:"10"}}>Initial date: </h5>

    <div style={{position:"absolute",top:"24%",left:"2%",zIndex:"12"}}>
      <DateTimePicker
        returnValue={'start'}
        onChange={(value) => this.setState({date_in: value})}
        value={this.state.date_in}
        maxDate={this.state.date_fin}
      />
    </div>

    <h5 style={{position:'absolute',top:"26%",left:"2%",zIndex:"10"}}>Final date: </h5>

    <div style={{position:'absolute',top:"33%",left:"2%",zIndex:"11"}}>
      <DateTimePicker
        returnValue={'start'}
        onChange={(value) => this.setState({date_fin: value})}
        value={this.state.date_fin}
        minDate={this.state.date_in}
      />
    </div>

    <h5 style={{position:"absolute",top:"39%",left:"2%",zIndex:"10"}}>Bus number: </h5>

    <div style={{position:"absolute",top:"46%",left:"2%",zIndex:"10",width:"25%"}}>
      <Select
        options={this.state.Opt}
        //isMulti
        isDisabled={false}
        value={this.state.ID}
        onChange={(value)=>{
          this.setState({
            ID:value,
            trace_init:new Date()
          });
        }}
      />
    </div>

    </SlidingPanel>

    <div>
    <LoadScript
       googleMapsApiKey={API_KEY}
       libraries={libraries}
    >
      
    <GoogleMap
    mapContainerStyle={mapContainerStyle}
    zoom={15} center={this.state.center}
    options={options}
    >

    <Polyline
      visible={this.state.sw_history}
      path={this.state.history}
      options={{
        strokeColor:'#ff0000',
      }}
      onClick={(e) => {
        this.setState({
          history_filter:{
            lat:e.latLng.lat(),
            lng:e.latLng.lng()
          }
        });
        this.callAPI_infohistory();
      }}
    />

    <Polyline
      visible={this.state.sw_trace}
      path={this.state.trace}
      options={{
        strokeColor:'#140852',
      }}
      onClick={(funtion) => {
        console.log(funtion())
      }}
    />

    <Marker
      position={this.state.coord}
      icon={"/truck.svg"}
      visible={this.state.sw_tag}
    />

    <Marker
      position={this.state.history[(this.state.history.length-1)]}
      icon={"/mapa.svg"}
      visible={this.state.sw_his_tag}
    />

    <Marker
      position={this.state.history[0]}
      icon={"/ubicacion.svg"}
      visible={this.state.sw_his_tag}
    />

    <StandaloneSearchBox
      onLoad={(ref)=>{this.searchBox = ref}}
      onPlacesChanged={()=>{
        this.setState({
          center:{
            lat:((((this.searchBox.getPlaces())[0]).geometry).location).lat(),
            lng:((((this.searchBox.getPlaces())[0]).geometry).location).lng()
          }
        });
      }}
    >

      <input
        type="text"
        placeholder="Search Places"
        style={searchBoxStyle}
      />

    </StandaloneSearchBox>
    
    <Marker
      position={this.state.Infoposition}
      onDblClick={()=>this.setState({sw_info_tag:false})}
      visible={this.state.sw_info_tag}>
        
      <OverlayView 
        position={this.state.Infoposition}
        mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
      >
      <div style={{width:'5%'}}>
      <h4>{(((new Date(parseFloat(this.state.Infotime,10))) + "").split("("))[0]}</h4>
      </div> 
      </OverlayView>

    </Marker>

    </GoogleMap>

    </LoadScript>
    </div>

    </div>

  );

}

}

export default App;
