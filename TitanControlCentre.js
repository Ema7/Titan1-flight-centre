/* java script file for Titan Controll Center
   created by Emanuel Bombasaro 27-II-2015
   edited: 28-II-2015
   edited: 01-III-2015

*/
var fileInput;
var fileDisplayArea;
var file;
var stastopB;
var readString="No file selected.";
var callsign;
var count;
var time;
var lon;
var lat;
var maxalt;
var sats;
var temperature1;
var battvaverage;
var errorstatus;
var Bitarr=[];
var myTimer, onTimer=0;

var ti, latlon, sat, alts, temp, batt, battPro;
var bit0, bit1, bit2, bit3, bit4, bit5, bit6, bit7;
var bit8, bit9, bit10, bit11, bit12, bit13, bit14, bit15;

var mypos, HABpos, markerME, markerHAB, meHAB, meHABpath;
var me, hab, map;

// Check for the various File API support.
if (window.File && window.FileReader && window.FileList && window.Blob) {
  // Great success! All the File APIs are supported.
	} else {
  		alert('The File APIs are not fully supported by your browser.');
}

// create google map
google.maps.event.addDomListener(window, 'load', initialize);

window.onload = function() {
	fileInput = document.getElementById('fileInput');
	stastopB = document.getElementById('stastopB');
	fileDisplayArea = document.getElementById('string1');
	ti = document.getElementById("time");
	latlon = document.getElementById("pos");
	sat = document.getElementById("sats");
	alts = document.getElementById("alt");
	temp = document.getElementById("temp");
	batt = document.getElementById("battery");
	battPro = document.getElementById("batteryPro");
	bit0 = document.getElementById("Bit0");
	bit1 = document.getElementById("Bit1");
	bit2 = document.getElementById("Bit2");
	bit3 = document.getElementById("Bit3");
	bit4 = document.getElementById("Bit4");
	bit5 = document.getElementById("Bit5");
	bit6 = document.getElementById("Bit6");
	bit7 = document.getElementById("Bit7");
	bit8 = document.getElementById("Bit8");
	bit9 = document.getElementById("Bit9");
	bit10 = document.getElementById("Bit10");
	bit11 = document.getElementById("Bit11");
	bit12 = document.getElementById("Bit12");
	bit13 = document.getElementById("Bit13");
	bit14 = document.getElementById("Bit14");
	bit15 = document.getElementById("Bit15");

	fileDisplayArea.innerText = readString;
	// set today as log file
	var today = new Date();
	fileInput.value=("file:///Users/ema/.fldigi/fldigi" + today.getFullYear() + ("0" + (today.getMonth() + 1)).slice(-2) + ("0" + today.getDate()).slice(-2) + ".log");

	me = {
  			url: 'images/me.png',
  			origin: new google.maps.Point(0, 0),
  			anchor: new google.maps.Point(30, 45),
		};
	hab = {
  			url: 'images/hab.png',
  			origin: new google.maps.Point(0, 0),
  			anchor: new google.maps.Point(20, 45),
		};
}

// start stop button click
function startstop() {
	// automatic update
	if (onTimer==0) {
		onTimer=1;
		myTimer = setInterval(function () {updateAll()}, 500);
		stastopB.value="Stop";
	} else {
		onTimer=0;
		clearInterval(myTimer);
		stastopB.value="Start";
	}
}

// update function
function updateAll() {
	file = fileInput.value;
	var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
                readString = rawFile.responseText;
                analyseString();
				updateFields();
            }
        }
    }
    rawFile.send(null);
}

// function updating fields
function updateFields()
{
	fileDisplayArea.innerText = readString;
	ti.value=time;
	latlon.value=(lat + "," + lon);
	sat.value=sats;
	alts.value=maxalt;
	temp.value=temperature1;
	batt.value=battvaverage;
	battPro.value=battvaverage/3600*100;
	getBits();
	if (Bitarr[0]==0) {bit0.className = "circle green";} else {bit0.className = "circle blue";}
	if (Bitarr[1]==0) {bit1.className = "circle green";} else {bit1.className = "circle red";}
	if (Bitarr[2]==0) {bit2.className = "circle green";} else {bit2.className = "circle red";}
	if (Bitarr[3]==0) {bit3.className = "circle green";} else {bit3.className = "circle blue";}
	if (Bitarr[4]==0) {bit4.className = "circle green";} else {bit4.className = "circle blue";}
	if (Bitarr[5]==0) {bit5.className = "circle green";} else {bit5.className = "circle red";}
	if (Bitarr[6]==0) {bit6.className = "circle green";} else {bit6.className = "circle red";}
	if (Bitarr[7]==0) {bit7.className = "circle green";} else {bit7.className = "circle red";}
	if (Bitarr[8]==0) {bit8.className = "circle green";} else {bit8.className = "circle red";}
	if (Bitarr[9]==0) {bit9.className = "circle green";} else {bit9.className = "circle red";}
	if (Bitarr[10]==0) {bit10.className = "circle green";} else {bit10.className = "circle red";}
	if (Bitarr[11]==0) {bit11.className = "circle green";} else {bit11.className = "circle red";}
	if (Bitarr[12]==0) {bit12.className = "circle green";} else {bit12.className = "circle red";}
	if (Bitarr[13]==0) {bit13.className = "circle green";} else {bit13.className = "circle red";}
	if (Bitarr[14]==0) {bit14.className = "circle green";} else {bit14.className = "circle red";}
	if (Bitarr[15]==0) {bit15.className = "circle green";} else {bit15.className = "circle red";}
}

// analyse string and set variables
function analyseString()
{
	fileLines=readString.split("\n");
	// we actually read the penultimum line
	var i=1;
	while (fileLines[fileLines.length-i]=="") {i=i+1};
	readString=fileLines[fileLines.length-i];
	LineEle=readString.split(",");
	if (LineEle.length==10) {
		callsign=LineEle[0];
		count=LineEle[1];
		time=LineEle[2];
		lat=LineEle[3];
		lon=LineEle[4];
		maxalt=LineEle[5];
		sats=LineEle[6];
		temperature1=LineEle[7];
		battvaverage=LineEle[8];
		errorstatus=LineEle[9].substr(0,LineEle[9].indexOf("*"));
		// set markers
		HABpos = new google.maps.LatLng(lat,lon);
		markerHAB.setPosition(HABpos);
		getLocation();
		markerME.setPosition(mypos);
      	meHABpath = [mypos,HABpos];
		meHAB.setPath(meHABpath);
		map.setCenter(HABpos);
		readString = (readString.substring(0,40) + "\n" + readString.substring(41,readString.length) + "\nValues updated!");
	} else {
		//alert('Set not complied old values conserved!');
		readString = (readString.substring(0,40) + "\n" + readString.substring(41,readString.length) + "\nValues NOT updated!");
	}
}

//bit shifter
function getBits()
{
	for (var i = 0; i < 16; ++i) {
  		Bitarr[i] = (errorstatus >> i) & 1;
  	}
}

// get current location
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(setPosition);
    } else {
         alert("Geolocation is not supported by this browser.");
    }
}

// assign current location to variable
function setPosition(position) {
	mypos = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
}

// define goolge map
function initialize()
{
	var mapCanvas = document.getElementById('map-canvas');
	var mapOptions = {zoom: 12,
		mapTypeId: google.maps.MapTypeId.ROADMAP
    }
	map = new google.maps.Map(mapCanvas, mapOptions)

	// Try HTML5 geolocation
	if(navigator.geolocation) {
    	navigator.geolocation.getCurrentPosition(function(position) {
      	mypos = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
		HABpos = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);

		markerME = new google.maps.Marker({
			position: mypos,
	      	map: map,
	      	icon: me,
	      	title: 'You are here!'
		});
		// where is HAB
		markerHAB = new google.maps.Marker({
	      position: mypos,
	      map: map,
	      icon: hab,
	      title: 'Titan is here!'
	  	});
	  	// line connecting both
	  	meHABpath = [mypos,HABpos];
	  	meHAB = new google.maps.Polyline({
    		path: meHABpath,
    		geodesic: true,
    		strokeColor: '#FF0000',
    		strokeOpacity: 1.0,
    		strokeWeight: 2
  		});

  		meHAB.setMap(map)

		map.setCenter(HABpos);
    	}, function() {
      		handleNoGeolocation(true);
    	});
  	} else {
    	// Browser doesn't support Geolocation
    	handleNoGeolocation(false);
	}

	function handleNoGeolocation(errorFlag) {
		if (errorFlag) {
    		var content = 'Error: The Geolocation service failed.';
  		} else {
    		var content = 'Error: Your browser doesn\'t support geolocation.';
  		}

		var options = {
		    map: map,
		    position: new google.maps.LatLng(0.0,0.0),
		    content: content
  		};

  		var infowindow = new google.maps.InfoWindow(options);
  		map.setCenter(options.position);
	}

}

// EOF