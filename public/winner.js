// when this page is opened, get the most recently added video and show it.
// function is defined in video.js
let divElmt = document.getElementById("tiktokDiv");

let reloadButton = document.getElementById("reload");
// set up button to reload video in "tiktokDiv"
reloadButton.addEventListener("click",function () {
  reloadVideo(tiktokDiv);
});



// always shows the same hard-coded video.  You'll need to get the server to 
// compute the winner, by sending a 
// GET request to /getWinner,
// and send the result back in the HTTP response.

showWinningVideo()

async function showWinningVideo() {
 let winner;
  await sendGetRequest("/getWinner")
  .then(function (data){
    //alert("back in winner!" + data);
    winner = data;
    //alert(winner.url);
  })
  .catch(function (error){
    conosole.log("Error in show winning video: " + error);
  })

  //alert("winner: " + typeof(winner));

  let winningUrl = winner.url;
  //alert(winner.nickname);
  //alert(winningUrl);
  //let winningUrl = "https://www.tiktok.com/@catcatbiubiubiu/video/6990180291545468166";
  addVideo(winningUrl, divElmt);
  loadTheVideos();

  document.getElementById("vidname").textContent = winner.nickname;
}
