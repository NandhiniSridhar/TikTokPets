getVids();

let videoElmts = document.getElementsByClassName("tiktokDiv");

let reloadButtons = document.getElementsByClassName("reload");
let heartButtons = document.querySelectorAll("div.heart");

let better;
let worse;

let nextButton = document.getElementById("nextBtn");



for (let i=0; i<2; i++) {
  let reload = reloadButtons[i]; 
  reload.addEventListener("click",function() { reloadVideo(videoElmts[i]) });
  heartButtons[i].classList.add("unloved");
} // for loop

for (let i=0; i<2; i++) {
  let heart = heartButtons[i]; 
  heart.addEventListener("click",function() { 
  heart.firstElementChild.setAttribute("class", "fas fa-heart");
  heart.firstElementChild.setAttribute("color", "rgba(238, 29, 82, 0.9)");
    
  
    
    better = urls[i];

    if(i == 1){
      worse = urls[0];
    }
    else if(i == 0){
      worse = urls[1];
    }

  });
  //heartButtons[i].classList.add("unloved");
} // for loop

nextButton.addEventListener("click", function(){
  //alert("next")
  let obj = {
      'better': better,
      'worse': worse,
    };

  //alert("better: " + better);
  //alert("worse: " + worse);

  sendToPref(obj);
  //alert("back in next")


  //location.reload();
})


let urls = new Array(0);

// hard-code videos for now
// You will need to get pairs of videos from the server to play the game.
//const urls = ["https://www.tiktok.com/@berdievgabinii/video/7040757252332047662",
//"https://www.tiktok.com/@catcatbiubiubiu/video/6990180291545468166"];


async function sendToPref(data){
  //alert("in send to pref");
  //alert("better: " + data.better);
  //alert("worse: " + data.worse)

  let json_data = JSON.stringify(data);
  //alert("json_data: " + json_data);

  await sendPostRequest("/insertPref", data)
  .then(function(res){
    //alert("in compare.js, data = " + res);
    if(res == "continue"){
      location.reload();
    }
    else if(res == "pick winner"){
      //alert("db full");
      window.location = "/winner.html";
    }
  })
  
}

//called at the begininng to get two random videos to display
async function getVids(){
  let vids = await sendGetRequest("/getTwoVideos");
  //alert("vids: " + vids[0].url + ", " + vids[1].url);
  urls.push(vids[0].url);
  urls.push(vids[1].url);
  //alert("urls: " + urls);

  for (let i=0; i<2; i++) {
      addVideo(urls[i],videoElmts[i]);
    }
    // load the videos after the names are pasted in! 
    loadTheVideos();
  
}

    