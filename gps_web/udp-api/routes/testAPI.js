var express = require("express");
var mysql = require('mysql');
const stringify= require("querystring");
var router = express.Router();
var udp = require('dgram');
var ENV = require('./env.json');
const wait= require("@testing-library/react");
const { resolve } = require("path");
const { rejects } = require("assert");

global.id=0;

const HOST=ENV.HOST;
const USER=ENV.USER;
const PASSWORD=ENV.PASSWORD;
const DATA=ENV.DATA;

var con = mysql.createConnection({
  host: HOST,
  user: USER,
  password: PASSWORD,
  database: DATA,
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

function Updatetable(message){

  return new Promise((resolve,reject)=>{
    var buff_sql=message.split("\n");
    (global.id)=(global.id)+1;
    var i_str=(global.id).toString();

    var sql = ("INSERT INTO gps (id,lat, lng, alt, timegps, truck) VALUES (").concat(i_str,",",buff_sql[1],"," ,buff_sql[0],",", buff_sql[2],",",buff_sql[3],",",buff_sql[4],')');

    con.query(sql, function (err, result) {
      if (err) throw err;
      return err ? reject(err): resolve("1 record inserted");
    });

  });

}

function Getusers(){

  return new Promise((resolve,reject)=>{
    con.query(("SELECT DISTINCT truck FROM gps;"),
      function(err,result){
        var users=JSON.parse(JSON.stringify(result));
        return err ? reject(err): resolve(users);
      }
    );
  });

}

function GetLast(truck){

  return new Promise((resolve,reject)=>{
    con.query((("SELECT lat,lng,alt,timegps FROM gps WHERE truck = ").concat((truck).toString()," ORDER BY id desc limit 1")),
      function Getlasmessage(err,result){
        var lastposition=JSON.parse(JSON.stringify(result));
        return err ? reject(err): resolve(lastposition);
      }
    );
  });

}

function Gethistory(truck,time_in,time_fin){
  return new Promise((resolve,reject)=>{
    con.query((("SELECT lat,lng FROM gps WHERE truck = ").concat((truck).toString()," AND timegps BETWEEN ",(time_in).toString(),' and ',(time_fin).toString())),
      function(err,result){
        if(err){throw err};
        var history=JSON.parse(JSON.stringify(result));
        return err ? reject(err): resolve(history);
      }
    );
  });

}

function GetInfo(time_in,time_fin,truck,position){
  return new Promise((resolve,reject)=>{
    con.query((("SELECT timegps FROM gps WHERE truck = ").concat((truck).toString()," AND lat = ",(position.lat).toString()," AND lng = ",(position.lng).toString()," AND timegps BETWEEN ",(time_in).toString()," and ",(time_fin).toString())),
      function(err,result){
        if(err){throw err};
        var info=JSON.parse(JSON.stringify(result));
        return err ? reject(err): resolve(info)
      }
    );
  });
}

function GetTrace(truck, trace_init, trace_actual){
  return new Promise((resolve, reject) => {
    con.query((("SELECT lat,lng FROM gps WHERE truck = ").concat((truck).toString()," AND timegps BETWEEN ",(trace_init).toString(),' and ',(trace_actual).toString())),
      function (err, result){
        if (err){throw err};
        var trace = JSON.parse(JSON.stringify(result));
        return err ? reject(err): resolve(trace);
      }
    );
  });
}

var server= udp.createSocket('udp4');
server.bind(5000);

server.on('listening',function(){
  try{
    const address=server.address();
    const port= address.port;
    const ipaddr = address.address;
    console.log('Server is listening at port ' + port);
    console.log('Server ip :' + ipaddr);
    connectDatabase()
  }catch(error){
    console.error();
  }
});

server.on('message',function(msg,info){

  try{
    var message=msg.toString();
    async function Update(){
      console.log(await Updatetable(message));
    }
    Update();
  }catch(error){
    console.error();
  }

});

router.get("/users", function(req, res, next) {

  try{
    async function User(){
      var users= await Getusers();
      res.json(users);
    }
    User();
  }catch(error){
    console.error();
  }

});

router.post("/history", function(req, res, next) {

  try{
    var time_in=req.body.timestamp_in;
    var time_fin=req.body.timestamp_fin;
    var truck=req.body.ID;
    async function History(){
      var history= await Gethistory(truck,time_in,time_fin);
      res.json(history);
    }
    History();
  }catch(error){
    console.error();
  }

});

router.post("/history/info", function(req, res, next) {
  try{
    var time_in=req.body.timestamp_in;
    var time_fin=req.body.timestamp_fin;
    var truck=req.body.ID;
    var position=req.body.position;
    async function Info() {
      var info = await GetInfo(time_in,time_fin,truck,position);
      res.json(info);  
    }
    Info();
  }catch(error){
    console.error();
  }
})

router.post("/trace", function (req, res, next){

  try{
    var truck = req.body.ID;
    var trace_init = req.body.trace_init;
    var trace_actual = req.body.trace_actual;
    async function Trace(){
      var trace = await GetTrace(truck,trace_init,trace_actual);
      res.json(trace);
    }
    Trace()
  }catch(error){
    console.error(error);
  }

});

router.post("/last", function(req,res, next){
  console.log("LAST");
  try{
    var truck=req.body.ID;
    async function Last(){
      var last=await GetLast(truck);
      res.json(last);
    }
    Last();
  }catch(error){
    console.error(error);
  }

});

router.post("/route", function(req,res,next){
  console.log("ROUTE");
  try{
    var route=req.body.route;
    console.log(route);
    res.json("TODO MELO");
  }catch(error){
    console.error(error);
  }
});

module.exports = router;
