
// send a get request to given URL
// assumes data is returned as JSON
// returns an object
async function sendGetRequest(url) {
  params = {
    method: 'GET', 
     };
  
  let response = await fetch(url,params);
  if (response.ok) {
    //alert("response ok");
    let data = await response.json();
    //alert("data" + data);
    return data;
  } else {
    throw Error(response.status);
  }
}

// input data should be an object, 
// which will be sent as JSON
async function sendPostRequest(url,data) {
  params = {
    method: 'POST', 
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(data) };
  console.log("about to send post request");
  
  let response = await fetch(url,params);
  if (response.ok) {
    let data = await response.text();
    //alert("got back " + data);
    return data;
  } else {
    throw Error(response.status);
  }
}

