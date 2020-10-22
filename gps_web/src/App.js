import React, { Component} from 'react';
<<<<<<< HEAD
import {GoogleMap,Marker, LoadScript, Polyline, StandaloneSearchBox} from "@react-google-maps/api";
=======
import ReactDOM from 'react-dom';
>>>>>>> master
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
  left: "48%",
  top: "2%",
  marginLeft: "-120px"
}

const libraries=["places"]

//By: https://www.geodatasource.com/developers/javascript
function distance(lat1, lon1, lat2, lon2, unit) {
	if ((lat1 === lat2) && (lon1 === lon2)) {
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
		if (unit==="K") { dist = dist * 1.609344 }
		if (unit==="N") { dist = dist * 0.8684 }
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
      sw_center:true,
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
      Isopen:'hidden'
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
          console.log(this.state.sw_center);
          if (this.state.sw_center){
            this.setState({
              coord_text:{lng:buff_lng,lat:buff_lat,alt:buff_alt,time:buff_time},
              center:{lng:parseFloat(buff_lng),lat:parseFloat(buff_lat)}
            });
          }else{
            this.setState({
              coord_text:{lng:buff_lng,lat:buff_lat,alt:buff_alt,time:buff_time}
            });
          }

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
    <div class="Contenedor">
    <title>GPS TIO RICO</title>
    <div style={{zIndex:'6', position:"absolute", top:"5%", left:"0%"}}>
    <Button onClick={()=>{this.setState({openPanel:!this.state.openPanel})}} style={{color:'black',background:'#54bfbc',cursor:'pointer'}}>⋙</Button>
    </div>
<<<<<<< HEAD
    <div style={{zIndex:'6', position:"absolute", top:"5%", left:"90%",border:"3px solid #54bfbc"}}>
    <Button onClick={()=>{this.setState({sw_center:!this.state.sw_center})}} style={{color:'black',background:'#ffffff',cursor:'pointer'}}>Follow truck  <span role="img" aria-label="Onlocation">📍</span></Button>
    </div>

=======
    <div style={{zIndex:'6', position:"absolute", top:"5%", left:"90%"}}>
    <Button onClick={()=>{this.setState({sw_center:!this.state.sw_center})}} style={{color:'black',background:'#ffffff',cursor:'pointer'}}> Follow Truck <span role="img" aria-label="Onlocation">📍</span></Button>
    </div>
>>>>>>> master
    <SlidingPanel
        type={'left'}
        isOpen={this.state.openPanel}
        size={30}
        style={{zIndex:'7'}}
    >
    <div style={{zIndex:'10', position:"absolute", top:"0%", left:"0%", backgroundColor:"white",width:"40%",height:"100%"}}></div>
    <div style={{zIndex:'10', position:"absolute", top:"5%", left:"40%"}}>
    <Button onClick={()=>{this.setState({openPanel:!this.state.openPanel})}} style={{color:'black',background:'#54bfbc', cursor:'pointer'}}>⋘</Button>
    </div>
    
    
      <h1>
        <body style={{top:"5%", textAlign:'center', fontSize:'30px',marginBottom:'5%'}}>GPS Tio Rico <span role="img" aria-label="Satellite Antenna">📡</span> </body>
        <body style={{textAlign:'left', fontSize:'20px'}}>{"Latitude: "+this.state.coord_text.lat}</body>
        <body style={{textAlign:'left', fontSize:'20px'}}>{"Longitude: "+this.state.coord_text.lng}</body>
        <body style={{textAlign:'left', fontSize:'20px'}}>{"Altitude: "+this.state.coord_text.alt}</body>
        <body style={{textAlign:'left', fontSize:'20px', marginBottom:'10%'}}>{"Timestamp: "+(new Date(parseFloat(this.state.coord_text.time,10)))}</body>
        <body style={{fontSize:'20px' ,padding: "1px", float: "left", width: "47%", textAlign: "center", marginBottom: '1%'}}>Initial date</body>
        <body style={{fontSize:'20px', padding: "1px",float: "right", width: "47%", textAlign: "center",marginBottom: '1%'}}>Final date</body>
        <body style={{float:'left',width:'47%', textAling:'center',marginBottom:'10%'}}>
        <DateTimePicker
        returnValue={'start'}
        onChange={(value) => this.setState({date_in: value})}
        value={this.state.date_in}
        maxDate={this.state.date_fin}
        />
        </body>
        <body style={{float:'right',width:'47%', textAling:'center',marginBottom:'10%'}}>
        <DateTimePicker
        returnValue={'start'}
        onChange={(value) => this.setState({date_fin: value})}
        value={this.state.date_fin}
        minDate={this.state.date_in}
        />
        </body>
        <body style={{textAlign:'left', fontSize:'20px'}}>Escoger camión</body>
        <body style={{padding: "1px",textAlign:'center',marginBottom:'10%'}}> 
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
        </body>
        <body style={{fontSize:'20px' ,padding: "1px", float: "left", width: "40%",marginBottom: '1%',textAlign:'center'}}>Show History</body>
        <body style={{fontSize:'20px' ,padding: "1px", float: "right", width: "40%", textAlign: "center", marginBottom: '1%'}}>Real Time</body>
        <body style={{fontSize:'20px' ,padding: "1px", float: "left", width: "40%",marginBottom: '1%',textAlign:'center'}}>  
          <Switch
              onColor={'#03b1fc'}
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
        </body>

        <body style={{fontSize:'20px' ,padding: "1px", float: "right", width: "40%",marginBottom: '1%',textAlign:'center'}}>  
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
                })
              }}
            /> 
        </body>
       
      </h1>    
 
    </SlidingPanel>
  
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
        strokeColor: '#ff0000',
        strokeWeight: 4
      }}
      onClick={(e) => {
        this.setState({
          history_filter:{
            lat:e.latLng.lat(),
            lng:e.latLng.lng()
          }
        });
        this.callAPI_infohistory();
        if (this.state.Isopen ==='hidden'){
          this.setState({
            Isopen:'visible'
          })
        }
      }}
    />

    <Polyline
      visible={this.state.sw_trace}
      path={this.state.trace}
      options={{
        strokeColor:'#140852',
      }}
    />
 
    <Marker
      position={this.state.coord}
      icon={"/truck.svg"}
      visible={this.state.sw_tag}
    />  

    <Marker
      position={this.state.history[0]}
      icon={"/ubicacion.svg"}
      visible={this.state.sw_his_tag}>
    </Marker>

    <Marker
      position={this.state.history[(this.state.history.length-1)]}
      icon={"/mapa.svg"}
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
      onDblClick={()=>{
        this.setState({sw_info_tag:false})
        if (this.state.Isopen === 'visible'){
          this.setState({
            Isopen:'hidden'
          })
        }
      }}
      visible={this.state.sw_info_tag}>
    </Marker>
    
    </GoogleMap>

    </LoadScript>
<<<<<<< HEAD
    <div style={{left:'42.5%',top:'90%',position:'absolute',width:'22%',height:'5%',backgroundColor:'white',zIndex:'10',visibility:this.state.Isopen,border:"3px solid #ff0000"}}>
      <h4 style={{left:'4%',backgroundColor:'white',width:'95%',background:'white'}}>{(((new Date(parseFloat(this.state.Infotime,10))) + "").split("("))[0]}</h4>
=======
    <div style={{left:'80%',top:'20%',position:'absolute',width:'30%',height:'10%',backgroundColor:'white',zIndex:'10',visibility:this.state.Isopen}}>
      <h4 style={{backgroundColor:'white'}}>{(((new Date(parseFloat(this.state.Infotime,10))) + "").split("("))[0]}</h4>
>>>>>>> master
    </div>
    </div>
  );

}

}

export default App;