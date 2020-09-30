var express = require("express");
var mysql = require('mysql');
const stringify= require("querystring");
var router = express.Router();
var udp = require('dgram');
var ENV = require('./env.json')
const wait= require("@testing-library/react");

global.id=0;
global.hist=[];
global.time_in=0;
global.time_fin=0;
global.truck=0;

const HOST=ENV.HOST;
const USER=ENV.USER;
const PASSWORD=ENV.PASSWORD;
const DATA=ENV.DATA;

var con = mysql.createConnection({
  host: HOST,
  user: USER,
  password: PASSWORD,
  database: DATA
});

function connectDatabase(){

  var last_row=0;

  con.query(("SELECT * FROM gps WHERE id = (SELECT MAX(id) FROM gps)"), function (err, result) {

    if (err) throw err;

    last_row=result;
    last_row=JSON.parse(JSON.stringify(last_row));
    last_row=last_row[0];

    try{
      console.log("\n");
      console.log("Last table ID obtained");
      global.id=last_row.id;
      console.log(global.id);
      console.log("\n");
    }catch(err){
      console.log("\n");
      console.log("Last table ID obtained");
      global.id=0;
      console.log(global.id);
      console.log("\n");
    }

  });

}

function Updatetable(){

  buff_sql=global.message.split("\n");
  (global.id)=(global.id)+1;
  i_str=(global.id).toString();

  var sql = ("INSERT INTO gps (id,lat, lng, alt, timegps, truck) VALUES (").concat(i_str,",",buff_sql[1],"," ,buff_sql[0],",", buff_sql[2],",",buff_sql[3],",",buff_sql[4],')');

  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("1 record inserted");
  });

}

function Getusers(){
  con.query(("SELECT DISTINCT truck FROM gps;"),
  function(err,result){
    global.users=JSON.parse(JSON.stringify(result));
    console.log(global.users);
  });
}

function GetLast(){
 con.query((("SELECT lat,lng,alt,timegps FROM gps WHERE truck = ").concat((global.truck).toString()," ORDER BY id desc limit 1")),
 function (err,result){
  global.lastmessage=JSON.parse(JSON.stringify(result));
 }); 
}

function Gethistory(){

  con.query((("SELECT lat,lng FROM gps WHERE truck = ").concat((global.truck).toString()," AND timegps BETWEEN ",(global.time_in).toString(),' and ',(global.time_fin).toString())),function(err,result){
    if(err){throw err};
    global.hist=JSON.parse(JSON.stringify(result));
  });

}

var server= udp.createSocket('udp4');
server.bind(5000);

server.on('listening',function(){
  try{
    address=server.address();
    port= address.port;
    ipaddr = address.address;
    console.log('Server is listening at port ' + port);
    console.log('Server ip :' + ipaddr);
    connectDatabase()
  }catch(error){
    console.error();
  }
});

server.on('message',function(msg,info){
  try{
    global.message = msg.toString();
    Updatetable()
  }catch(error){
    console.error();
  }

});

router.get("/", function(req, res, next) {

  try{
    console.log('\n')
    GetLast();
    res.json(global.lastmessage);
  }catch(error){
    console.error();
  }
  
});

router.get("/users", function(req, res, next) {

  try{
    console.log('\n')
    Getusers();
    res.json(global.users);
  }catch(error){
    console.error();
  }
  
});

router.get("/history", function(req, res, next) {

  try{
    Gethistory();
    res.json(global.hist);
  }catch(error){
    console.error();
  }
  
});

router.post("/filter", function(req,res, next){

  try{
    global.time_in=req.body.timestamp_in;
    global.time_fin=req.body.timestamp_fin;
    global.truck=req.body.ID;
    res.json("RECV");
  }catch(error){
    console.error();
  }
  
});

module.exports = router;