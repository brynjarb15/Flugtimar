import clock from "clock";
import document from "document";
import { preferences } from "user-settings";
import * as util from "../common/utils";
import { me } from "appbit";
import * as fs from "fs";

// Keep the app from closing after default amount of time
me.appTimeoutEnabled = false;

// Update the clock every second
clock.granularity = "seconds";

// Get a handle on the <text> element
const clockLable = document.getElementById("clockLable");
const dateLable = document.getElementById("dateLable");
const myButton = document.getElementById("myButton");
const nextTimeLable = document.getElementById("nextTime");
const stopwatchLable = document.getElementById("stopWatch");




const blockOffLabel = document.getElementById("blockOff");
const blockOnLabel = document.getElementById("blockOn");
const takeOffLabel = document.getElementById("takeOff");
const landingLabel = document.getElementById("landing");


let blockOffTime = 0;
let takeOffTime = 0;
let landingTime = 0;
let blockOnTime = 0;

let showStopwatch;
let stopWatchTimes = {
  sec: 0,
  min: 0,
  hour: 0
};


function initalizeData() {
  blockOffTime = 0;
  takeOffTime = 0;
  landingTime = 0;
  blockOnTime = 0;
  blockOffLabel.text = '';
  takeOffLabel.text = '';
  landingLabel.text = '';
  blockOnLabel.text = '';
  nextTimeLable.text = 'BLOCKS OFF';
  showStopwatch = false;
  
}
initalizeData();
// Try read data from the db file
// If it works then set all the times
try {
    // Read the db file
    let jsonFlightTimes = fs.readFileSync("db.txt", "json");
    // Set the times as the times read from the db file
    blockOffTime = jsonFlightTimes.offBlock;
    takeOffTime = jsonFlightTimes.takeOff;
    landingTime = jsonFlightTimes.landing;
    blockOnTime = jsonFlightTimes.onBlock;
    // Show the current times
    showFlightTimes();
  } catch {
    console.log('Could not read file');
  }


function showOnlyStopWatch() {
  blockOffLabel.text  = '';
  takeOffLabel.text   = '';
  landingLabel.text   = '';
  blockOnLabel.text   = '';
  nextTimeLable.text  = '';
  clockLable.text     = '';
}

function showFlightTimes() {
  stopwatchLable.text = '';
  if(blockOffTime !== 0) {
    blockOffLabel.text = blockOffTime;
    nextTimeLable.text = 'TAKE OFF';
  } else {
    initalizeData();
  }
  
  if (takeOffTime !== 0) {
    takeOffLabel.text = takeOffTime;
    nextTimeLable.text = 'LANDING';
  } 
  if (landingTime !== 0) {
    landingLabel.text = landingTime;
    nextTimeLable.text = 'BLOCKS ON';
  } 
  if (blockOnTime !== 0) {
    blockOnLabel.text = blockOnTime;
    nextTimeLable.text = 'RESTART';
  } 
}

function writeTimesToFile() {
  let jsonFlightTimes = {
    "offBlock": blockOffTime,
    "takeOff" : takeOffTime,
    "landing" : landingTime,
    "onBlock" : blockOnTime
  };
  fs.writeFileSync("db.txt", jsonFlightTimes, "json");
}


myButton.onmousedown = function(evt) {
  // If we are showing the stopwatch nothing should happen
  if (showStopwatch) {
    return;
  }
  // Get the current time
  var currentTime = new Date();
  const hours = util.zeroPad(currentTime.getHours());
  const minutes= util.zeroPad(currentTime.getMinutes());
  const seconds = util.zeroPad(currentTime.getSeconds());
  
  
  // If the time is 0 then it has not been entered yet
  // Go through all the times and the first one to be 0 will be the new time entered
  if(blockOffTime === 0) {
    blockOffTime = `${hours}:${minutes}:${seconds}`;
    blockOffLabel.text = blockOffTime;
    nextTimeLable.text = 'TAKE OFF';
  } else if (takeOffTime === 0) {
    takeOffTime = `${hours}:${minutes}:${seconds}`;
    takeOffLabel.text = takeOffTime;
    nextTimeLable.text = 'LANDING';
  } else if (landingTime === 0) {
    landingTime = `${hours}:${minutes}:${seconds}`;
    landingLabel.text = landingTime;
    nextTimeLable.text = 'BLOCKS ON';
  } else if (blockOnTime === 0) {
    blockOnTime = `${hours}:${minutes}:${seconds}`;
    blockOnLabel.text = blockOnTime;
    nextTimeLable.text = 'RESTART';
  } else {
    initalizeData();
    return;
  }
  writeTimesToFile();
  
  
}


document.onkeypress = function(e) {
  
  // If up key is pressed we want to go back 1 stage
  // so we remove the newest time and set the label to last message
  if(e.key === 'up') {
    if(blockOffTime === 0) {
      
    } else if (takeOffTime === 0) {
      // Block off time is shown but nothing more
      // Go back to show no times
      // Remove the block off time
      blockOffTime = 0;
      blockOffLabel.text = '';
      nextTimeLable.text = 'BLOCK OFF';
    } else if (landingTime === 0) {
      // Remove the take off time
      takeOffTime = 0;
      takeOffLabel.text = '';
      nextTimeLable.text = 'TAKE OFF';
    } else if (blockOnTime === 0) {
      // Remove the landing time
      landingTime = 0;
      landingLabel.text = '';
      nextTimeLable.text = 'LANDING';
    } else {
      // Remove the block on time
      blockOnTime = 0;
      blockOnLabel.text = '';
      nextTimeLable.text = 'BLOCK ON';
    }
    console.log('up');
  }
  
  if(e.key === 'down') {
    if (showStopwatch) {
      showStopwatch = false;
      showFlightTimes();
    } else {
      showStopwatch = true;  
      stopWatchTimes.sec = 0;
      stopWatchTimes.min = 0;
      stopWatchTimes.hour = 0;
      showOnlyStopWatch();
    }
    
  }
}










// Update the <text> element every tick with the current time
clock.ontick = (evt) => {
  // If the show stopwatch is true then we start a stopwatch
  // If not then we show the clock
  if (showStopwatch) {
    stopWatchTimes.sec += 1;
    if (stopWatchTimes.sec >= 60) {
      stopWatchTimes.sec = 0;
      stopWatchTimes.min += 1;
    }
    if (stopWatchTimes.min >= 60) {
      stopWatchTimes.min = 0;
      stopWatchTimes.hour += 1;
    }
    let secs = util.zeroPad(stopWatchTimes.sec);
    let mins = util.zeroPad(stopWatchTimes.min);
    let hours = util.zeroPad(stopWatchTimes.hour);
    
    if (stopWatchTimes.hour === 0) {
      stopwatchLable.text = `${mins}:${secs}`;  
    } else {
      stopwatchLable.text = `${hours}:${mins}:${secs}`;  
    }
    
    
  } else {
    let today = evt.date;
    let hours = today.getHours();
    if (preferences.clockDisplay === "12h") {
      // 12h format
      hours = hours % 12 || 12;
    } else {
      // 24h format
      hours = util.zeroPad(hours);
    }
    let mins = util.zeroPad(today.getMinutes());
    let sec = util.zeroPad(today.getSeconds());

    clockLable.text = `${hours}:${mins}:${sec}`;
      
    // Get the current day and month
    let d = new Date();
    let day = d.getDate();
    let monthList = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
    let month = monthList[d.getMonth()];
    // Show current day and month
    dateLable.text =  `${day} ${month}`;
    
  }
  
  
}
