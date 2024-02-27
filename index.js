// JSON files have placeholder data - it will be updated each time the script runs

let wins = require('./json-data/win-streaks.json'); 
let losses = require('./json-data/losing-streaks.json'); 
const axios = require('axios'); 
const fs = require('node:fs'); //file system
let allStreaks = require('./json-data/all-streaks.json'); 
// console.log(allStreaks, typeof allStreaks); 

// PLACE all streaks into one json file
  // get all the win streaks in first
    let winStrings = (JSON.stringify(wins)); 
        // console.log(winStrings, typeof winStrings); 
        fs.writeFile('./json-data/all-streaks.json', winStrings, (err) => {
          if (err) return console.error(err) //else { console.log(streak)}; 
        })

  //get losses, change the keys and 
    function renameKeys(obj, prefix) {
      let result = {};
      Object.keys(obj).forEach((key, index) => {
        result[`${prefix}_${index}`] = obj[key];
      });
      return result;
    }
    losses = renameKeys(losses, 'A'); 
    // console.log(losses); 
    // put them into all streaks
      allStreaks = Object.assign(allStreaks, wins);
      allStreaks = Object.assign(allStreaks, losses);  
      console.log(allStreaks, typeof allStreaks); 
      fs.writeFile('./json-data/all-streaks.json', JSON.stringify(allStreaks), (err) => {
        if (err) console.error(err); 
      }); 

let data = {
  "text": "Initialized..."
};
// console.log("Initial Data object: " + data.text, typeof data); 

// let today = new Date(); 
// console.log(today.toDateString()); 
// const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]; 
// let timestamp = today.toTimeString().split(' ')[0].concat(`:${today.getMilliseconds()}`); 
// console.log(timestamp); 
let positiveVerbs = ['maintaining', 'upholding', 'sustaining', 'managing', 'on', 'trying to add to', 'trying to extend', 'currently on', 'pushing', 'hoping to continue building on']; 
let negativeVerbs = ['suffering', 'going through', 'on', 'trying to break', 'battling', 'currently on', 'dealing with', 'fighting', 'facing', 'hoping to end']; 

let config = { // this needs to be reset every time -  posting the tweets comes back as unauthorized every day
              // when i don't run it again in post man - a token issue???
  method: 'post',
  maxBodyLength: Infinity,
  url: 'https://api.twitter.com/2/tweets',
  headers: { 
    'Content-Type': 'application/json', 
    'Authorization': 'OAuth oauth_consumer_key="FQQMEpazjknIYGr4K302vGLzK",oauth_token="1749975350782656512-NvWNPOYrLsLHXvW6A9J1uLq7W01cfE",oauth_signature_method="HMAC-SHA1",oauth_timestamp="1709048404",oauth_nonce="J0e2srJrGIH",oauth_version="1.0",oauth_signature="kLJHVZbHWUQRGFvyHMNSVCaDHuQ%3D"', 
    'Cookie': 'guest_id=v1%3A170647810995146516; guest_id_ads=v1%3A170647810995146516; guest_id_marketing=v1%3A170647810995146516; personalization_id="v1_lNTPkAFdrQyW8qW0etiwCg=="'
  },
  data : data
};
// console.log(config.data, typeof config.data, 'line 31'); 

let tweets = []; 
const delay = (ms) => new Promise(res => setTimeout(res, ms)) // delay for the timestamps for the tweets so that they are not all the same****

async function processTweets(streaksJSON) {
for (obj in streaksJSON) {
    await delay(250); 
            data = JSON.stringify({ //json.stringify needed here in order to make it a string for the axios config 
                                    // AND because JSON requires double quotes - if we use backticks here it breaks
          "text": `The ${streaksJSON[obj]["Team"]} (${streaksJSON[obj]["W"]}-${streaksJSON[obj]["L"]}) are ${streaksJSON[obj]["STRK"].substring(0,1) === 'W' ? positiveVerbs[(Math.floor(Math.random() * positiveVerbs.length))] : negativeVerbs[(Math.floor(Math.random() * negativeVerbs.length))]} a ${streaksJSON[obj]["STRK"].substring(1)} game ${streaksJSON[obj]["STRK"].substring(0,1) === 'W' ? 'winning' : 'losing'} streak. Timestamp: ${new Date().toTimeString().split(' ')[0].concat(`:${new Date().getMilliseconds()}`)}`
        })
  // console.log("Data in FOR LOOP line 46: " + data, typeof data); // data is a string here
    tweets.push(JSON.parse(data)); 
        
  }

   function makeAxiosRequest() { // async function?
    // console.log(data); 
    // await delay(1500); 
    axios.request(config)
    .then((response) => {
      console.log(JSON.stringify(response.data));
    })
    .catch((error) => {
      console.log(error.response);
    });
    // console.log(config.data); 
  }

  for (let i = 0; i < tweets.length; i++) {
    config.data = tweets[i]; // JSON.parse to bring it back into object form for the config? IF not json.parse at line 47
    // console.log(data, typeof data, 'line 70'); 
    console.log(config.data, typeof config.data, 'line 71 config'); 
    makeAxiosRequest(); // COMMENTED OUT to prevent over requesting to the Twitter API - uncomment to submit the tweet requests
  }

// })
tweets = []; 
}

processTweets(allStreaks); 