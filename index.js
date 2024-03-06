// JSON files have placeholder data - it will be updated each time the script runs

let wins = require('./json-data/win-streaks.json'); 
let losses = require('./json-data/losing-streaks.json'); 
const axios = require('axios'); 
const fs = require('node:fs'); //file system
let allStreaks = require('./json-data/all-streaks.json'); 
const OAuth = require('oauth-1.0a'); 
const crypto = require('crypto'); 
// const crypto = import('node:crypto'); 
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
      // console.log(allStreaks, typeof allStreaks); 
      fs.writeFile('./json-data/all-streaks.json', JSON.stringify(allStreaks), (err) => {
        if (err) console.error(err); 
      });   
      
      // let data = {"text": "Initialized..."};  
      // console.log("Initial Data object: " + data.text, typeof data); 
      
      // let today = new Date(); 
      // console.log(today.toDateString()); 
      // const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]; 
      
      let positiveVerbs = ['maintaining', 'upholding', 'sustaining', 'managing', 'on', 'trying to add to', 'trying to extend', 'currently on', 'pushing', 'hoping to continue building on']; 
      let negativeVerbs = ['suffering', 'going through', 'on', 'trying to break', 'battling', 'currently on', 'dealing with', 'fighting', 'facing', 'hoping to end']; 

        
      function reorderAuthorizationHeader(headers) {
        // Extract the authorization header from the headers object
        const authHeader = headers.Authorization;
      
        // Split the authorization header string into individual OAuth parameters
        const authParams = authHeader.split(',').map(param => param.trim());
      
        // Define the order of parameters expected by Twitter
        const twitterOrder = [
          'oauth_consumer_key',
          'oauth_token',
          'oauth_signature_method',
          'oauth_timestamp',
          'oauth_nonce',
          'oauth_version',
          'oauth_signature'
        ];
      
        // Reorder the parameters according to Twitter's expected order
        const reorderedParams = authParams.sort((a, b) => {
          const paramA = a.split('=')[0];
          const paramB = b.split('=')[0];
          return twitterOrder.indexOf(paramA) - twitterOrder.indexOf(paramB);
        });
      
        // Concatenate the reordered parameters back into the authorization header
        const reorderedAuthorization = reorderedParams.join(',');
      
        // Update the headers object with the reordered authorization header
        headers.Authorization = reorderedAuthorization;
      
        // Return the updated headers object
        // console.log('93', headers); 
        return headers;
      }

      function setUpAuthorization() {
      const oauth = OAuth({ // required for the instance to be created - which provides the nonce
          consumer: {
            key: '7do39yoO3XJD7cFDgnw2TbwC4',
            secret: 'Ea7rsSbyZ936ZfxqiqaG9AcRy9FYKpTpBBZhByeXlPrAxA5VtG'
            // bearer token: AAAAAAAAAAAAAAAAAAAAACw%2BsAEAAAAA8%2FLW0xKn3kD6P6uqDvSRiUJcD1A%3DIeubXgrhbrmo8EYpC9KWtfjd4mttMvCojowU1uVwyuEnA14eBH
          },     
          signature_method: 'HMAC-SHA1',
          hash_function(base_string, key) {
            return crypto
            .createHmac('sha1', key)
            .update(base_string)
            .digest('base64');
          },   
          nonce_length: 11, 
          parameter_seperator: ','
        });  
        
        const token = {
          key: '1749975350782656512-yUMaJsa6TqPOpKpOHZ6BvyFI11mzC0',
          secret: 'yJcq9t6ob48fN86wqhQK2qYFbxtqBVYbftzFs0EqYZ62I' // yJcq9t6ob48fN86wqhQK2qYFbxtqBVYbftzFs0EqYZ62I
        }  
        
        const request = {
          url: 'https://api.twitter.com/2/tweets', 
          method: 'POST',
          // data: data // does this need to be the tweet before I authorize?
          body: config.data // does this need to be the tweet before I authorize?
        }
      // }
        let authorization = oauth.authorize(request, token); 
        let headers = oauth.toHeader(authorization); 
        headers = reorderAuthorizationHeader(headers); 
        // console.log(headers)
        return headers; 
      }

        
// TRIMMING AUTH PARAMS
// gets location of first comma to start slice and concat the oauth_token
// let firstCommaIndex = headers.Authorization.indexOf(','); 
// headers.Authorization = headers.Authorization.slice(0, firstCommaIndex) + `, oauth_token="${oauth.consumer.secret}",` + headers.Authorization.slice(firstCommaIndex + 1); 

// // gets the index of the start of the oauth_nonce 
// let nonceStartIndex = headers.Authorization.indexOf('oauth_nonce="'); // 13 characters to the nonce string + 11 characters to match postman length
// // console.log('INDEX:', nonceStartIndex); 
// headers.Authorization = headers.Authorization.slice(0, nonceStartIndex + 24) + headers.Authorization.slice(nonceStartIndex + 45); // 45 characters to the end of the string to remove the unnecessary nonce characters
// console.log(headers.Authorization); 
// // headers.Authorization = 
// // move the signature to the end of the authorization string
// let signatureIndex = headers.Authorization.indexOf('oauth_signature="'); // 17 characters to the signature string + 
// headers.Authorization = headers.Authorization.slice(0, signatureIndex) + headers.Authorization.slice(signatureIndex + 50) + ', ' + headers.Authorization.slice(signatureIndex, signatureIndex + 47) + '"';
// // let nonceString = headers.Authorization; //string! maybe do string.replace
// // console.log(nonceString); 
// console.log('HEADERS: ', headers); // `${headers.Authorization}`
// console.log('AUTHORIZATION', headers.Authorization); 

let config = {
  method: 'post',
  maxBodyLength: Infinity,
  url: 'https://api.twitter.com/2/tweets',
  headers: { 
    'Content-Type': 'application/json', 
    'Authorization': ``, 
    //  'Authorization': 'OAuth oauth_consumer_key="FQQMEpazjknIYGr4K302vGLzK",oauth_token="1749975350782656512-NvWNPOYrLsLHXvW6A9J1uLq7W01cfE",oauth_signature_method="HMAC-SHA1",oauth_timestamp="1709306768",oauth_nonce="GzeF1gG34ki",oauth_version="1.0",oauth_signature="J2zXbh9D9M93VO2yZHIY4GwSKJo%3D"', 
    'Cookie': 'guest_id=v1%3A170647810995146516; guest_id_ads=v1%3A170647810995146516; guest_id_marketing=v1%3A170647810995146516; personalization_id="v1_lNTPkAFdrQyW8qW0etiwCg=="'
  },
  // data : data
  // data : {}
};
// console.log(config.data, typeof config.data, 'line 31'); 
    // console.log('Initial CONFIG: ', config, "END"); 



let tweets = []; 
const delay = (ms) => new Promise(res => setTimeout(res, ms)) // delay for the timestamps for the tweets so that they are not all the same****

function makeAxiosRequest() { // async function?
  // console.log(data); 
  // await delay(1500); 
  axios.request(config)
  .then((response) => {
    console.log(JSON.stringify(response.data));
  })
  .catch((error) => {
    console.log('RESPONSE:', error.message);
  });
  // console.log(config.data); 
}

// function reorderAuthorizationHeader(headers) {
//   const authHeader = headers['Authorization'];
//   const authParams = authHeader.split(',').map(param => param.trim());
//   const sortedParams = authParams.sort(); // Sort alphabetically
//   const reorderedAuthHeader = sortedParams.join(',');
  
//   headers['Authorization'] = reorderedAuthHeader;
//   return headers;
// }



async function processTweets(streaksJSON) {
for (obj in streaksJSON) {
  // console.log(typeof streaksJSON[obj])
    await delay(750); 
        //     data = JSON.stringify({ //json.stringify needed here in order to make it a string for the axios config 
        //                             // AND because JSON requires double quotes - if we use backticks here it breaks
        //   "text": `The ${streaksJSON[obj]["Team"]} (${streaksJSON[obj]["W"]}-${streaksJSON[obj]["L"]}) are ${streaksJSON[obj]["STRK"].substring(0,1) === 'W' ? positiveVerbs[(Math.floor(Math.random() * positiveVerbs.length))] : negativeVerbs[(Math.floor(Math.random() * negativeVerbs.length))]} a ${streaksJSON[obj]["STRK"].substring(1)} game ${streaksJSON[obj]["STRK"].substring(0,1) === 'W' ? 'winning' : 'losing'} streak. Timestamp: ${new Date().toTimeString().split(' ')[0].concat(`:${new Date().getMilliseconds()}`)}`
        // })
            config.data = JSON.stringify({ //json.stringify needed here in order to make it a string for the axios config 
                                    // AND because JSON requires double quotes - if we use backticks here it breaks
          "text": `The ${streaksJSON[obj]["Team"]} (${streaksJSON[obj]["W"]}-${streaksJSON[obj]["L"]}) are ${streaksJSON[obj]["STRK"].substring(0,1) === 'W' ? positiveVerbs[(Math.floor(Math.random() * positiveVerbs.length))] : negativeVerbs[(Math.floor(Math.random() * negativeVerbs.length))]} a ${streaksJSON[obj]["STRK"].substring(1)} game ${streaksJSON[obj]["STRK"].substring(0,1) === 'W' ? 'winning' : 'losing'} streak. Timestamp: ${new Date().toTimeString().split(' ')[0].concat(`:${new Date().getMilliseconds()}`)}`
        })
  // console.log("Data in FOR LOOP line 46: " + data, typeof data); // data is a string here
  console.log(config.data, typeof config, typeof config.data); 
    tweets.push(JSON.parse(config.data)); 
        // console.log(tweets); 
  }

  for (let i = 0; i < tweets.length; i++) {
    await delay(1500); 
    // config.headers = reorderAuthorizationHeader(config.headers); 
    // console.log(config.headers.Authorization); 
    config.data = tweets[i]; // object
    config.headers["Authorization"] = setUpAuthorization()["Authorization"]; 
    console.log(`TWEET ${i + 1} config`, config, `TWEET ${i + 1} config end`); 
    // console.log(data, typeof data, 'line 70'); 
    // console.log('166 FINAL CONFIG:', config); 
    // console.log(config.headers); 
    makeAxiosRequest(); // COMMENTED OUT to prevent over requesting to the Twitter API - uncomment to submit the tweet requests
  }

// })
tweets = []; 
}

processTweets(allStreaks); 