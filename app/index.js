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

// Get a handle on the <text> elements
const clockLabel = document.getElementById("clockLabel");
const dateLabel = document.getElementById("dateLabel");
const myButton = document.getElementById("myButton");
const nextTimeLabel = document.getElementById("nextTime");
const flightTimeLabel = document.getElementById("flightTimeLabel");
const blockTimeLabel = document.getElementById("blockTimeLabel");
const stopwatchLabel = document.getElementById("stopWatch");
const numberOfLandingsLabel = document.getElementById("numberOfLandingsLabel");

// Get the time labels
const blockOffLabel = document.getElementById("blockOff");
const blockOnLabel = document.getElementById("blockOn");
const takeOffLabel = document.getElementById("takeOff");
const landingLabel = document.getElementById("landing");

// Create the times 
let blockOffTime = 0;
let takeOffTime = 0;
let landingTime = 0;
let blockOnTime = 0;
let numberOfLandings = 0;

// Create the stopwatch variables
let showStopwatch;
let stopwatchStartTime;

// Create y and x variable used to sence swiping
let y = 0;
let x = 0;

// Takes in time on format hh:mm gives out time at as number with 1 decimal
// E.g. 10:30 => 10.5
function turnBlockTimeToLogTime(time) {
  let splitTime = time.split(':');
  let hours = parseInt(splitTime[0]);
  let minutes = splitTime[1];
  minutes = Math.round(minutes / 60 * 10) / 10;
  return hours + minutes;
}

// Show the block and flight times
function showBlockAndFlightTime() {
  // We don't want to show any next time message
  nextTimeLabel.text = '';
  // Get the block time and flight time
  let blockTime = getDifferenceBetweenTwoTimesAsString(blockOffTime, blockOnTime);
  let flightTime = getDifferenceBetweenTwoTimesAsString(takeOffTime, landingTime);
  // Get the log time
  let logTime = turnBlockTimeToLogTime(blockTime);
  // Show the block and flight time
  blockTimeLabel.text = 'Block:  ' + blockTime + '/' + logTime;
  flightTimeLabel.text = 'Flight: ' + flightTime;
}

// Take string on the format '13:37:42' and turns it into a Date object
function setTimeOfNewDate(time) {
  let d = new Date();
  let t = time.split(':');
  d.setHours(t[0]);
  d.setMinutes(t[1]);
  d.setSeconds(0);
  return d;
}

// Get the difference between 2 times on the format '13:37:42' and returns it on the format 'hh:mm'
function getDifferenceBetweenTwoTimesAsString(t1, t2) {
  let d1 = setTimeOfNewDate(t1);
  let d2 = setTimeOfNewDate(t2);
  let difference = new Date(d2 - d1);
  return `${util.zeroPad(difference.getHours())}:${util.zeroPad(difference.getMinutes())}`
}


function initalizeData() {
  blockOffTime = 0;
  takeOffTime = 0;
  landingTime = 0;
  blockOnTime = 0;
  numberOfLandings = 0;
  blockOffLabel.text = '';
  takeOffLabel.text = '';
  landingLabel.text = '';
  blockOnLabel.text = '';
  flightTimeLabel.text = '';
  blockTimeLabel.text = '';
  nextTimeLabel.text = 'BLOCKS OFF';
  showStopwatch = false;
  updateLandingLabel();
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
  numberOfLandings = jsonFlightTimes.numberOfLandings;
  // Show the current times
  showFlightTimes();
} catch {
  console.log('Could not read file');
}

// Turn everything off that is not part of the stopwatch
function showOnlyStopWatch() {
  blockOffLabel.text = '';
  takeOffLabel.text = '';
  landingLabel.text = '';
  blockOnLabel.text = '';
  nextTimeLabel.text = '';
  clockLabel.text = '';
  flightTimeLabel.text = '';
  blockTimeLabel.text = '';
}

// Update the number of landings label
function updateLandingLabel() {
  numberOfLandingsLabel.text = 'L: ' + numberOfLandings ;
}

// Show all the flight times
function showFlightTimes() {
  updateLandingLabel();
  stopwatchLabel.text = '';
  if (blockOffTime !== 0) {
    blockOffLabel.text = blockOffTime;
    nextTimeLabel.text = 'TAKE OFF';
  } else {
    // If there is no block time there are no times and therefore we initalize everything
    initalizeData();
  }

  if (takeOffTime !== 0) {
    takeOffLabel.text = takeOffTime;
    nextTimeLabel.text = 'LANDING';
  }
  if (landingTime !== 0) {
    landingLabel.text = landingTime;
    nextTimeLabel.text = 'BLOCKS ON';
  }
  if (blockOnTime !== 0) {
    blockOnLabel.text = blockOnTime;
    showBlockAndFlightTime();
  }
}

// Write the times into a file
function writeTimesToFile() {
  let jsonFlightTimes = {
    "offBlock": blockOffTime,
    "takeOff": takeOffTime,
    "landing": landingTime,
    "onBlock": blockOnTime,
    "numberOfLandings": numberOfLandings
  };
  fs.writeFileSync("db.txt", jsonFlightTimes, "json");
}

function createTimeLabel(hours, minutes, seconds) {
  return `${hours}:${minutes}:${seconds}`
}


// Track the inital position of mouse down
myButton.onmousedown = function(evt) {
  y = evt.screenY;
  x = evt.screenX;
}

// When myButton is pressed(which covers the whole screen) then next time is issued
myButton.onmouseup = function (evt) {
  let yMove = evt.screenY - y;
  let xMove = evt.screenX - x;
  if (xMove > 60 || xMove < -60) {
    if (showStopwatch) {
      showStopwatch = false;
      showFlightTimes();
    } else {
      showStopwatch = true;
      stopwatchStartTime = new Date();
      showOnlyStopWatch();
    }
    return;
  }
  
  // If we are showing the stopwatch nothing should happen
  if (showStopwatch) {
    return;
  }
  // Get the current time
  var currentTime = new Date();
  const hours = util.zeroPad(currentTime.getHours());
  const minutes = util.zeroPad(currentTime.getMinutes());
  const seconds = util.zeroPad(currentTime.getSeconds());


  // If the time is 0 then it has not been entered yet
  // Go through all the times and the first one to be 0 will be the new time entered
  if (blockOffTime === 0) {
    blockOffTime = createTimeLabel(hours, minutes, seconds);
  } else if (takeOffTime === 0) {
    takeOffTime = createTimeLabel(hours, minutes, seconds);
  } else if (landingTime === 0) {
    landingTime = createTimeLabel(hours, minutes, seconds);
  } else if (blockOnTime === 0) {
    blockOnTime = createTimeLabel(hours, minutes, seconds);
  } else {
    initalizeData();
    return;
  }
  showFlightTimes();
  // Write down the new times to file
  writeTimesToFile();
}

// Listen to key presses
// If the up key is pressed and flight times are showing we want to go back 1 time
// If the down key is pressed we want to show a stopwatch or close the stop watch if it open
document.onkeypress = function (e) {

  // If up key is pressed we want to go back 1 stage
  // so we remove the newest time and set the label to last message
  if (e.key === 'up') {
    // If we are showing the stopwatch nothing should happen
    if (showStopwatch) {
      return;
    }
    if (blockOffTime === 0) {
      // We are at the start so nothing should happen
    } else if (takeOffTime === 0) {
      // Block off time is shown but nothing more
      // Go back to show no times
      // Remove the block off time
      blockOffTime = 0;
      blockOffLabel.text = '';
      nextTimeLabel.text = 'BLOCK OFF';
    } else if (landingTime === 0) {
      // Remove the take off time
      takeOffTime = 0;
      takeOffLabel.text = '';
      nextTimeLabel.text = 'TAKE OFF';
    } else if (blockOnTime === 0) {
      // Remove the landing time
      landingTime = 0;
      landingLabel.text = '';
      nextTimeLabel.text = 'LANDING';
    } else {
      // Remove the block on time
      blockOnTime = 0;
      blockOnLabel.text = '';
      flightTimeLabel.text = '';
      blockTimeLabel.text = '';

      nextTimeLabel.text = 'BLOCK ON';
    }
  }

  // If the down key is pressed we add 1 landing
  if (e.key === 'down') {
    numberOfLandings += 1;
    updateLandingLabel();  
  }
}

// Update either the clock or the stopwatch on every click
clock.ontick = (evt) => {
  // If the show stopwatch is true then we start a stopwatch
  // If not then we show the clock
  if (showStopwatch) {
    let currentTime = new Date();
    let timePassed = new Date(currentTime - stopwatchStartTime);

    let secs = util.zeroPad(timePassed.getSeconds());
    let mins = util.zeroPad(timePassed.getMinutes());
    let hours = util.zeroPad(timePassed.getHours());
    if (hours === '00') {
      stopwatchLabel.text = `${mins}:${secs}`;
    } else {
      stopwatchLabel.text = `${hours}:${mins}:${secs}`;
    }


  } else {
    // Normal clock
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

    clockLabel.text = `${hours}:${mins}:${sec}`;

    // Get the current day and month and show it
    let d = new Date();
    let day = d.getDate();
    // List of all the months
    let monthList = ["January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December"
    ];
    let month = monthList[d.getMonth()];
    // Show current day and month
    dateLabel.text = `${day} ${month}`;
  }
}
