/*
 Loughborough University (February 2016)
 
 Timetabling Website
 Roominfo page's script file (includes jQuery)
 Used for scripts on the room information page ONLY
 */

$(document).ready(function () {

  //AUTOFILL SEARCH FOR MODULE TITLE
  $(function () {
    var availableTags = [];

    //get list of modules for logged in user
    //getDeptModuleList with deptCode = "CO" returns all modules with CO at start of code, in form "COB106 AI Methods"
    $.post("api.cshtml", { requestid: "getDeptModuleList" },
    function (JSONresult) {

      for (var i = 0; i < JSONresult.length; i++) {
        availableTags.push(JSONresult[i].module_code + " " + JSONresult[i].module_title);
      }

    }, 'json');

    $("#input-moduleInfo").autocomplete({
      source: availableTags
    });
  });

  //Call functions at page load
  fillBuildingsList("Any");
  getSuitableRooms(); //call function to populate suitable rooms list


  //SUBMISSION LOG SLIDER
  $(document).on('click', '.log-group', function () {
    //$(".log-group").click(function(){
    $(this).siblings(".log-contents-container").slideToggle("slow");
    $(this).find('.log-icon').children().toggleClass("fa-angle-double-down fa-angle-double-up");
  });


  //ROOM SEARCH SELECTION LOADS CHOICE
  $('#form-roomSelection').change(function () {
    var roomCode = $(this).find(":selected").text();
    $('#form-booking-roomCode').val(roomCode); //loads room
    loadRoomBuildingInfo(roomCode);
  });

  //SPECIAL REQUIREMENT SELECTION
  $('.spe_list li span').click(function () {
    //var requirement = $(this).attr('id');
    $(this).toggleClass('list-activeFacility');
    getSuitableRooms();
  });

  //ROOM PREFERENCES RESET BUTTON
  $('#roomSearch-reset').click(function () {
    $('#select-park').val("Any");
    $('#select-building').val("Any");
    $('#select-roomuse').val("Lecture");
    $('#form-capacity').val("");
    $('#form-priority').val("");
    $('#select-specificreqs li').children('.list-activeFacility').each(function () {
      $(this).removeClass('list-activeFacility');
    });
    getSuitableRooms();
  });

  //PARK SELECTION
  $('#select-park').change(function () {
    //when park is selected, grab the new value, and update buildingList choice with buildings in that park
    fillBuildingsList("Any");

    getSuitableRooms();
  });

  //BUILDING SELECTION
  $('#select-building').change(function () {

    var building = $('#select-building').val();
    var buildingcode = building.substr(0, building.indexOf(' ')); //if building == "" then Any is selected	
    if (buildingcode.length < 1) {
      buildingcode = "Any"
    }

    if (building != "Any") {
      $.post("api.cshtml", { requestid: "getBuildingPark", buildingcode: buildingcode },
      function (JSONresult) {

        $("#select-park").val(JSONresult[0].park);
        fillBuildingsList(building);
        getSuitableRooms();

      }, 'json');
    }
    else {
      getSuitableRooms();
    }

  });

  //CAPACITY INPUT CHANGE
  $('#form-capacity').on('input change', function () {
    getSuitableRooms();
  });

  //SEMESTER INPUT CHANGE
  $('#select-semester').change(function () {
    getRoomTimetable();
  });

  //PRIVATE ROOMS INPUT CHANGE
  $('#select-privaterooms').change(function () {
    getSuitableRooms();
  });

  //ROOM CODE SELECTION (TEXT INPUT W/ JQUERY AUTOFILL) CHANGE
  $('#form-booking-roomCode').on('input change', function () {
    if (checkRoomIsValid($(this).val())) {
      loadRoomBuildingInfo($(this).val());
    }
    else {
      $('#form-booking-roomName').text("Invalid Room Code");
    }
  });

  //TIMETABLE POPUP
  $(".timetable-data").click(function () {
    if ($(this).hasClass("timetable-taken")) {	//if it isnt a slot with a Booked (taken) class
      $('.pop').html($(this).find('.timetable-content-empty').html());
      $('.pop').fadeToggle();
    }
  });

  $(document).on('click', '.close', function () { //essential to make dynamically inserted html elements have the click handler
    //$('.close').on('click', function() {
    $('.pop').fadeToggle();
    $('.pop').delay(1000).html("<b>Information for a booked timetable slot.</b><br/><br/><br/><br/><br/><p></p><p class='close'>Close</p>");
  });

});

//GET SUITABLE ROOMS
function getSuitableRooms() {
  console.log("getSuitableRooms() called");
  var park = $('#select-park').val();	//perform a test for Any selected
  var capacity = parseInt($('#form-capacity').val());

  if (!checkInp("capacity", capacity)) {
    capacity = 0;
  }
  var buildingcode = $('#select-building').val();
  if (buildingcode == null) {
    buildingcode = "Any"
  } //to prevent error when 0 buildings are loaded
  else {
    buildingcode = buildingcode.substr(0, buildingcode.indexOf(' '));	//if building == "" then Any is selected	
    if (buildingcode.length < 1) {
      buildingcode = "Any"
    }
  }

  var privateStatus = $('#select-privaterooms').val();

  var lab = 0;
  var wheelchair = 0;
  var hearingloop = 0;
  var computer = 0;
  var projector = 0;
  var dprojector = 0;
  var ohp = 0;
  var visualiser = 0;
  var dvd = 0;
  var bluray = 0;
  var vhs = 0;
  var whiteboard = 0;
  var chalkboard = 0;
  var plasma = 0;
  var pasystem = 0;
  var radiomic = 0;
  var review = 0;
  var specificReqs = $('#select-specificreqs li').children('.list-activeFacility');
  for (var i = 0; i < specificReqs.length; i++) {
    switch (specificReqs[i].innerHTML) {
      case "Laboratory":
        lab = 1;
        break;
      case "Wheelchair Access":
        wheelchair = 1;
        break;
      case "Induction Loop":
        hearingloop = 1;
        break;
      case "Computer":
        computer = 1;
        break;
      case "Projector":
        projector = 1;
        break;
      case "Dual Projector":
        dprojector = 1;
        break;
      case "OverHead Projector":
        ohp = 1;
        break;
      case "Visualiser":
        visualiser = 1;
        break;
      case "DVD Player":
        dvd = 1;
        break;
      case "BluRay":
        bluray = 1;
        break;
      case "VHS":
        vhs = 1;
        break;
      case "Whiteboard":
        whiteboard = 1;
        break;
      case "Chalkboard":
        chalkboard = 1;
        break;
      case "Plasma Screen":
        plasma = 1;
        break;
      case "PA System":
        pasystem = 1;
        break;
      case "Radio Mic":
        radiomic = 1;
        break;
      case "ReVIEW Capture":
        review = 1;
        break;
    }
  }

  //http://localhost:44715/api?requestid=getSuitableRooms&park=Any&capacity=0&buildingcode=CC&lab=0&wheelchair=0&hearingloop=0&computer=0&projector=0&dprojector=0&ohp=0&visualiser=0&video=0&bluray=0&vhs=0&whiteboard=0&chalkboard=0&plasma=0&pasystem=0&radiomic=0&review=0
  $.post("api.cshtml", {
    requestid: "getSuitableRooms", park: park, capacity: capacity, private: privateStatus, buildingcode: buildingcode, lab: lab, wheelchair: wheelchair,
    hearingloop: hearingloop, computer: computer, projector: projector, dprojector: dprojector, ohp: ohp, visualiser: visualiser, video: dvd,
    bluray: bluray, vhs: vhs, whiteboard: whiteboard, chalkboard: chalkboard, plasma: plasma, pasystem: pasystem, radiomic: radiomic, review: review
  },
  function (JSONresult) {

    var roomList = "";
    for (var j = 0; j < JSONresult.length; j++) {
      roomList += "<option>" + JSONresult[j].room_code + "</option>";
    }
    $('#form-numRooms').html("(" + JSONresult.length + ")");
    $("#form-roomSelection").html(roomList);

    loadRoomCodeChoices();

  }, 'json');

}

//fils thee building drop-down with a list of possible buildings depending on park
//the 'building' input is when a particular building needs to be auto-selected
function fillBuildingsList(building) {
  //when park is selected, grab the new value, and update buildingList choice with buildings in that park
  var park = $('#select-park').val();
  if (park === null) {
    park = "Any";
  }

  $.post("api.cshtml", { requestid: "getParkBuildings", park: park },
  function (JSONresult) {

    var buildingList = "<option>Any</option>";
    for (var i = 0; i < JSONresult.length; i++) {
      buildingList += "<option>" + JSONresult[i].building_code + " - " + JSONresult[i].building_name + "</option>";
    }
    $("#select-building").html(buildingList);

    //select Any or building by default
    if (building.length < 3) {
      $("#select-building").val("Any");
    }
    else {
      $("#select-building").val(building);
    }
  }, 'json');

}

//gets a list of the room's facilities
function getRoomInfo() {
  if (checkRoomIsValid($('#form-booking-roomCode').val())) {
    //Perform API call to retrieve facilities of a specific room
    $.post("api.cshtml", {requestid: "getReqs", roomcode: $('#form-booking-roomCode').val()},
    function (JSONresult) {
      var facilityList = "";
      for (var i = 0; i < JSONresult.length; i++) {
        facilityList += "<li>" + JSONresult[i].facility_name + "</li>";
      }
      $('#room-faclist ul').html(facilityList);
    }, 'json');
  }
}

//fills the timetable with booked slots from the database
function getRoomTimetable() {

  clearTimetable();

  if (checkRoomIsValid($('#form-booking-roomCode').val())) {	//if the selected room is valid

    var weeks = "1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,";


    if (weeks.length > 0) {
      weeks = weeks.substr(0, weeks.length - 1);

      var sem = $('#select-semester').val();


      //Perform API call to retrieve timetable bookings for times and weeks
      $.post("api.cshtml", {requestid: "getRoomTimetable", roomcode: $('#form-booking-roomCode').val(), weeks: weeks, semester: sem},
      function (JSONresult) {

        for (var i = 0; i < JSONresult.length; i++) {
          var day = JSONresult[i]['request_details'].request_day;
          var time = JSONresult[i]['request_details'].request_timestart;
		  var dayneat = day.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});

          //if this slot is currently clear
          if (!$('.timetable-table tbody tr[class*="' + day + '"]').find('td[class*="period' + time + '"]').hasClass("timetable-taken")) {

            $('.timetable-table tbody tr[class*="' + day + '"]').find('td[class*="period' + time + '"]').addClass("timetable-taken");

            //Multiple content should be in form: <span class='timetable-taken-text'>Booked</span><div class='timetable-content-empty'></div>
            var content = "<span class='timetable-taken-text'>Booked</span><div class='timetable-content-empty'>";

            var popContent = "<b>Information for a booked timetable slot.</b><br/>";
            popContent += "Day: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + dayneat + "<br/>";
            popContent += "Period: &nbsp;" + time + "<br/><br/>";
            popContent += "The module <b>" + JSONresult[i]['request_details'].module_code + "</b> has booked this slot for weeks:<br/>";
            for (var j = 0; j < JSONresult[i]['weeks_range'].length; j++) {
              popContent += JSONresult[i]['weeks_range'][j] + ", ";
            }
            popContent += "<p></p>";
            popContent += "<p class='close'>Close</p>";

            content += popContent;
            content += "</div>";
            $('.timetable-table tbody tr[class*="' + day + '"]').find('td[class*="period' + time + '"]').html(content);

          }
          else { //if this slot in timetable has another module booking here (ie. different weeks)

            var currentContent = $('.timetable-table tbody tr[class*="' + day + '"]').find('td[class*="period' + time + '"]').html().toString();

            var newContent = "";

            var contentStart = currentContent.substring(0, currentContent.indexOf("<p></p>"));
            var contentEnd = currentContent.substring(currentContent.indexOf("<p></p>"));

            contentStart += "<br/><br/>The module <b>" + JSONresult[i]['request-details'].module_code + "</b> has booked this slot for weeks:<br/>";
            for (var j = 0; j < JSONresult[i]['weeks-range'].length; j++) {
              contentStart += JSONresult[i]['weeks-range'][j] + ", ";
            }

            newContent = contentStart + contentEnd;
            $('.timetable-table tbody tr[class*="' + day + '"]').find('td[class*="period' + time + '"]').html(newContent);
          }

        }

      }, 'json');

    }

  }

}

//AUTOFILL SEARCH FOR ROOM CODE SELECTION
function loadRoomCodeChoices() {
  $(function () {
    var availableRooms = [];
    availableRooms = $('#form-roomSelection').children().toArray();
    for (var i = 0; i < availableRooms.length; i++) {
      availableRooms[i] = availableRooms[i].textContent;
    }

    $("#form-booking-roomCode").autocomplete({
      source: availableRooms,
      close: function () {
        if (checkRoomIsValid($('#form-booking-roomCode').val())) {
          loadRoomBuildingInfo($('#form-booking-roomCode').val());
        }
        else {
          $('#form-booking-roomName').text("Invalid Room Code");
        }
      }
    });
  });
}

function loadRoomBuildingInfo(roomCode) {
  //Get building name 
  if (roomCode.indexOf('.') > 0) {	//if roomCode is not Cope Auditorium
    var buildingCode = roomCode.substr(0, roomCode.indexOf('.'));
    if (buildingCode == 63) {
      buildingCode = "LUSAD";
    }

    //call api.cshtml with "buildingCode" to return the buildingName
    $.post("api.cshtml", { requestid: "getBuildingName", buildingcode: buildingCode },
    function (JSONresult) {
      $('#form-booking-roomName').text(JSONresult[0].building_name);
      getRoomTimetable();
      getRoomInfo();
      console.log("Plotting building on map: " + JSONresult[0].building_name);
      plotOnMap(JSONresult[0].building_name);
    }, 'json');

  }
  else {	//roomCode is for Cope Auditorium
    $('#form-booking-roomName').text("Cope Auditorium");
    getRoomTimetable();
    getRoomInfo();
		//@JAMES ADD THIS LINE BELOW
		plotOnMap("Cope Auditorium");	
  }
}
//checks if a room selected (from text input room selection box) is a valid room
function checkRoomIsValid(roomCode) {
  var flag = false;

  $(function () {
    var availableRooms = [];
    availableRooms = $('#form-roomSelection').children().toArray();
    for (var i = 0; i < availableRooms.length; i++) {
      if (availableRooms[i].textContent == roomCode) {
        flag = true;
      }
    }
  });

  return flag;
}

//erases content of current timetable
function clearTimetable() {

  //$('.timetable-data').text("");
  $('.timetable-data').html("<div class='timetable-content-empty'></div>");
  $('.timetable-data').removeClass("timetable-taken");

}

var global = {};

global.initMap = function() {
	var mapProp = {
		center:new google.maps.LatLng(52.76492526, -1.23422172),		//can change these coords to somewhere in centre of uni (it's the default map location)
		zoom:15,																							
		mapTypeId:google.maps.MapTypeId.ROADMAP
	};
	var map = new google.maps.Map(document.getElementById("googleMap"),mapProp);
}

//@James You have a lot to add to this
//This function will plot the building's lat and long onto a map (I made this)
function plotOnMap(buildingname) {
var lat = "52.76268";
	var lng = "-1.23819";
	
	//CREATE IF/ELSE STATEMENT HERE TO GET THE LAT/LONG FOR THE BUILDING CODE INPUT (Check what the exact building names are in the db)
	if (buildingname == "Matthew Arnold") {
		lat = "52.76585";
		lng = "-1.22438"; //input these values for each (change these 2)
	}
	else if (buildingname == "Brockington") {
		lat = "52.76562";
		lng = "-1.22733";
	}
	else if (buildingname == "James France") {
		lat = "52.76506";
		lng = "-1.2272";
	}
	else if (buildingname == "G Block") {
		lat = "52.76478893";
		lng = "-1.22877684";
	}
	else if (buildingname == "Wavy Top") {
		lat = "52.76538";
		lng = "-1.22819";
	}
	else if (buildingname == "Clyde Williams") {
		lat = "52.76789";
		lng = "-1.22366";
	}
	else if (buildingname == "John Pickford") {
		lat = "52.76393";
		lng = "-1.23967";
	}
	else if (buildingname == "Edward Herbert") {
		lat = "52.765";
		lng = "-1.22969";
	}
	else if (buildingname == "Sir John Beckwith") {
		lat = "52.76751";
		lng = "-1.22485";
	}
	else if (buildingname == "Ann Packer") {
		lat = "52.76606";
		lng = "-1.22282";
	}
	else if (buildingname == "Keith Green") {
		lat = "52.76204";
		lng = "-1.23949";
	}//
	else if (buildingname == "Wavy Top") {
		lat = "52.76572";
		lng = "-1.22864";
	}
	else if (buildingname == "Loughborough Design School") {
		lat = "52.76551";
		lng = "-1.22281";
	}
	else if (buildingname == "Edward Barnsley" || buildingname == "Cope Auditorium") {
		lat = "52.76713244";
		lng = "-1.22063902";
	}
	else if (buildingname == "Haslegrave") {
		lat = "52.76695";
		lng = "-1.22922";
	}
	else if (buildingname == "Sir Frank Gibb") {
		lat = "52.76303";
		lng = "-1.24083";
	}
	else if (buildingname == "Materials Engineering") {
		lat = "52.76256";
		lng = "-1.24149";
	}
	else if (buildingname == "Schofield") {
		lat = "52.76626";
		lng = "-1.22837";
	}
	else if (buildingname == "Stewart Mason") {
		lat = "52.76538";
		lng = "-1.22676";
	}
	else if (buildingname == "Wolfson") {
		lat = "52.76261";
		lng = "-1.24";
	}
	else if (buildingname == "Brockington Extension") {
		lat = "52.76574";
		lng = "-1.22785";
	}
	else if (buildingname == "Sir David Davis") {
		lat = "52.76155";
		lng = "-1.24096";
	}
	else if (buildingname == "John Cooper") {
		lat = "52.76634";
		lng = "-1.22438";
	}
  else if (buildingname == "Loughborough University London") {
    lat = "51.54849433";
    lng = "-0.02259854";
  }

	//Set map
	var map = new google.maps.Map(document.getElementById("googleMap"), {
		center: {lat: parseFloat(lat), lng: parseFloat(lng)},																	//input the building's lat and long here (from the IF statement) for MAP CENTER
		zoom: 17
	});

	//Dropper on map to highlight building
	var infoWindow = new google.maps.InfoWindow({map: map});				
	var pos = {
		lat: parseFloat(lat),																											
		lng: parseFloat(lng)																											
	};

	//Mark location on map
	infoWindow.setPosition(pos);
	infoWindow.setContent(buildingname);														//Set content of the dropper to the building name (input into function)
	map.setCenter(pos);
  }
