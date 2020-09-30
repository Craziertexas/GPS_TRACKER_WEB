import React, { Component} from 'react';
import {GoogleMap,Marker, LoadScript, Polyline} from "@react-google-maps/api";
import mapStyles from "./mapStyles";
import axios from 'axios';
import { Button } from 'rebass';
import DateTimePicker from 'react-datetime-picker';
import Switch from "react-switch";
import SlidingPanel from 'react-sliding-side-panel';
import Select from 'react-select';

const API_KEY=process.env.REACT_APP_MAPS_API;

const API_URL=process.env.REACT_APP_API_URL;

const API_URL_2=process.env.REACT_APP_API_URL_2;

const API_URL_3=process.env.REACT_APP_API_URL_3;

const API_URL_4=process.env.REACT_APP_API_URL_4;

const mapContainerStyle = {
  width: "100vw",
  height: "100vh",
};

const center={
  lat:10.9878,
  lng:-74.7889 ,
};

const options={
  styles: mapStyles,
  disableDefaultUI: true,
  zoomControl:true,
  streetViewControl: true,
};


class App extends Component {

  constructor(){
    super();
    this.state={
      coord:{
        lat:10.9878,
        lng:-74.7889 }
      ,
      lat:8.75,
      lng:-75.883,
      coord_text:{lng:"XXXX",lat:"XXXX",alt:"XXXX",time:"0000"},
      sw_realtime:true,
      sw_history:false,
      history:[],
      date_in:new Date(),
      date_fin:new Date(),
      openPanel:false,
      ID:{value:"1",label:"Camion 1"},
      Opt:[]
    }

  }

  callAPI_users(){
    axios.get(API_URL_4)
      .then((res)=>{
        for (var i=0; i<((res.data).length); i++){
          this.state.Opt.push({value:(((res.data)[i]).truck), label:("Camion ").concat((((res.data)[i]).truck).toString())})
        } 
      });
    console.log(this.state.Opt);
  }

  callAPI_actual(){

    axios.post(API_URL_3,({
      timestamp_in:(this.state.date_in).getTime(),
      timestamp_fin:(this.state.date_fin).getTime(),
      ID:((this.state.ID).value)
    }));

    axios.get(API_URL) 

    .then((res) => {
      console.log(res.data);
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
      };
    });

  }
  
  callAPI_history(){
    
    axios.post(API_URL_3,({
      timestamp_in:(this.state.date_in).getTime(),
      timestamp_fin:(this.state.date_fin).getTime(),
      ID:((this.state.ID).value)
    }));

    axios.get(API_URL_2)
    .then((res) => { 
      var buff = (res.data); 
      this.setState({
        history:buff
      });
    });
    
  }

  set_timer1(){
    this.timer1 = setInterval(()=>{this.callAPI_actual()}, 1000);
  }

  set_timer2(){
    this.timer2 = setInterval(()=>{this.callAPI_history()},1000);
  }

  componentDidMount(){
    console.log("Al components mounted");
    this.callAPI_users();
    this.set_timer1();
  }

  render(){return (
    
    <div>

    <title>GPS<span role="img" aria-label="Satellite Antenna">📡</span></title>

    <div style={{position:'absolute',top:'50%',left:'-1%',zIndex:'15'}}>
      <Button onClick={()=>{this.setState({openPanel:!this.state.openPanel})}} style={{color:'black',background:'white'}}>
      <span role="img" aria-label="Right arrow"> Advance ➡️</span></Button>
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
            }else{
              clearInterval(this.timer1);
              this.setState({
                coord_text:{lng:"XXXX",lat:"XXXX",alt:"XXXX",time:"0000"}
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
            }else{
              clearInterval(this.timer2);
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
        maxDate={new Date()}
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
        value={this.state.ID}
        onChange={(value)=>{
          this.setState({
            ID:value
          });
        }}
      />
    </div>

    </SlidingPanel>

    <div>
    <LoadScript
       googleMapsApiKey={API_KEY}>

    <GoogleMap 
    mapContainerStyle={mapContainerStyle} 
    zoom={8} center={center} 
    options={options}
    > 

    <Polyline
      visible={this.state.sw_history}
      path={this.state.history}
      options={{
        strokeColor:'#ff0000',
      }}
    />
    
    <Marker
      position={this.state.coord}
      icon={"/truck.svg"}
    />

    </GoogleMap>

    </LoadScript>
    </div>

    </div>

  );
}
}
export default App;
