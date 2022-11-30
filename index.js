'use strict'
// index.js
// This is our main server file

// A static server using Node and Express
const express = require("express");

// local modules
const db = require("./sqlWrap");
const win = require("./pickWinner");


// gets data out of HTTP request body 
// and attaches it to the request object
const bodyParser = require('body-parser');
const { get } = require("./sqlWrap");


/* might be a useful function when picking random videos */
function getRandomInt(max) {
  let n = Math.floor(Math.random() * max);
  // console.log(n);
  return n;
}


/* start of code run on start-up */
// create object to interface with express
const app = express();

// Code in this section sets up an express pipeline

// print info about incoming HTTP request 
// for debugging
app.use(function(req, res, next) {
  console.log(req.method,req.url);
  next();
})
// make all the files in 'public' available 
app.use(express.static("public"));

// if no file specified, return the main page
app.get("/", (request, response) => {
  response.sendFile(__dirname + "/public/compare.html");
});

// Get JSON out of HTTP request body, JSON.parse, and put object into req.body
app.use(bodyParser.json());

app.get("/getTwoVideos", async function(req, res){
  console.log("getting two videos");

  let vid_one;
  let vid_two;
  
  await getVideo()
  .then(function (data){
    /*console.log("vid1: ");
    console.log(typeof(data));
    console.log(data);*/
    vid_one = data;
  })
  .catch(function (error){
    console.log("Error:", error);
  });

  
  //first calls to get video
  await getVideo()
  .then(function (data){
    /*console.log("vid2: ");
    console.log(typeof(data));
    console.log(data);*/
    vid_two = data;
  })
  .catch(function (error){
    console.log("Error:", error);
  });

  //console.log("out of .then");
  //console.log("vid_one:" + vid_one.rowIdNum);
  //console.log("vid_two:" + vid_two.rowIdNum);

  //in case videos are the same
  
  let one = vid_one.rowIdNum;
  let two = vid_two.rowIdNum
  
  if(one === two){
    await getVideo()
    .then(function (data){
      /*console.log("vid2: ");
      console.log(typeof(data));
      console.log(data);*/
      vid_two = data;
    })
    .catch(function (error){
      console.log("Error:", error);
    });
  }
  

  let vids = [vid_one, vid_two]
  console.log("vids: " + typeof(vids[0]) + typeof(vids[1]));
  console.log(vids[0]);
  console.log(vids[1]);

  res.send(vids);
  
});
        
app.get("/getWinner", async function(req, res) {
  console.log("getting winner");
  let result;
  
  try {
  // change parameter to "true" to get it to computer real winner based on PrefTable 
  // with parameter="false", it uses fake preferences data and gets a random result.
  // winner should contain the rowId of the winning video.
  await win.computeWinner(8,false)
  .then(async function (data){
    //console.log("winner from index: " + data);
    result = await getVideoByRowId(data);
    
  })
  .catch(function (error){
    console.log("Error in index winner: " + error);
  })

  //console.log("getting winning vid from database");
  console.log("back");
  console.log(typeof(result));
  console.log(result);
  let res_string = JSON.stringify(result)
  //console.log("result in index: " + result);
  // you'll need to send back a more meaningful response here.
  res.json({"url":result.url,
           "nickname":result.nickname});
  } catch(err) {
    res.status(500).send(err);
  }
});

app.use(bodyParser.text());

app.post('/insertPref', async function(req, res, next) {
  console.log("in insert pref");

  let obj = req.body;
  //console.log(obj.better);
  //console.log(obj.worse);
  
  let better;
  let worse;

  await getVideoByUrl(obj.better)
  .then(function (data){
    better = data;
  })
  .catch(function(error){
    console.log("Error: " + error);
  });

  await getVideoByUrl(obj.worse)
  .then(function (data){
    worse = data;
  })
  .catch(function(error){
    console.log("Error: " + error);
  });

  //console.log("better: " + better.rowIdNum);
  //console.log("worse: " + worse.rowIdNum);

  const table = await dumpPrefTable();
  console.log("table has length: " + table.length);
  if(table.length == 15){
    res.send("pick winner");
    return;
  }
  
  await insertPref(better.rowIdNum, worse.rowIdNum);
  console.log("back in post");

  
  await dumpPrefTable()
    .then(function (data){
      console.log(data);
    })
    .catch(function (error){
      console.log("Error: " + error);
    });

  res.send("continue");
  /*isPrefFull()
  .then(function (data) {
    if(data == "full"){
      //res.send(data);
    }
    else{ 
      let success = insertPref(better, worse)
      //console.log("It contained this string:", t);
      //if(success == "Database Full"){
      //res.send(t);
    }
 // }
  })
  .catch(function (error) {
     console.error('Error:', error);
  });*/
  
  
});

// Page not found
app.use(function(req, res){
  res.status(404); 
  res.type('txt'); 
  res.send('404 - File '+req.url+' not found'); 
});

// end of pipeline specification

// Now listen for HTTP requests
// it's an event listener on the server!
const listener = app.listen(3000, function () {
  console.log("The static server is listening on port " + listener.address().port);
});



//db ops
//videoTables
async function getVideo(){
  console.log("in get video")

  //get a random row from the table
  const sql = 'SELECT * FROM VideoTable ORDER BY RANDOM() LIMIT 1'
  let result = db.get(sql);
  //const sql = 'select * from VideoTable where rowIdNum = ?';
  //let result = db.get(sql, rowid);
  //console.log(result);
  return result;
}

async function getVideoByUrl(url_name){
  console.log("in get video by url");
  const sql = 'select * from VideoTable where url = ?'
  let result = db.get(sql, url_name);
  return result;
}

async function getVideoByRowId(id_num){
  console.log("in get video by id");
  const sql = 'select * from VideoTable where rowIdNum = ?'
  let result = await db.get(sql, id_num);
  //console.log("res: " + JSON.stringify(result));
  return result;
}

async function dumpTable(){
  const sql = 'select * from VideoTable';
  let result = await db.all(sql);
  //console.log(result);
  return result;
}



//prefTable

async function dumpPrefTable(){
  const sql = 'select * from PrefTable';
  let result = await db.all(sql);
  //console.log(result);
  return result;
}

async function isPrefFull(){
  console.log("in pref table");
  const table = await dumpPrefTable();
  if(table.length == 15){
    return "full";
  }
}


async function insertPref(better, worse){
  console.log("in insertPrefTable")
  //better and worse are just the rowidnum ints
  const table = await dumpPrefTable();
  //console.log("The table has ",table.length, "entries");
  
 
    const sql = "insert into PrefTable (better, worse)  values (?,?)" ;
    db.run(sql,[better, worse]);
  
  /*else{
    let msg = "Database Full"; 
    
    return msg;
  }*/
}