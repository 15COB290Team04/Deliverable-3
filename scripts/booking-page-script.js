/*
 Team 12
 Loughborough University
 November 2015
 
 Timetabling Prototype Website
 Bookng page's script file (includes jQuery)
 Used for scripts on the booking page ONLY
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
  //getSuitableRooms(); //call function to populate suitable rooms list
  getSubmissionLog();

  resetPreferences(1);  //getSuitableRooms() is called within here
  saveState(1);
  saveState(2);
  saveState(3);

  //ROOM TAB BAR
  $(document).on('click', '.room-tab', function () {
    var prevActiveId = $(this).parent().find('.tab-active').attr('id');
    $('#' + prevActiveId).removeClass('tab-active');

    console.log("Save state: " + prevActiveId.charAt(8));
    saveState(prevActiveId.charAt(8));

    loadState($(this).attr('id').charAt(8));
    console.log("Load state: " + $(this).attr('id').charAt(8));
    $(this).addClass('tab-active');
    //if ($(this).attr('id').charAt(8) == 2 || $(this).attr('id').charAt(8) == 3) {
    getSuitableRooms();
    getRoomTimetable();


  });

  //SUBMIT BOOKINGS BUTTON
  $('#submit-btn').click(function () {
    var tabNum = $('.room-tab').parent().find('.tab-active').attr('id');
    tabNum = parseInt(tabNum.charAt(8));
    saveState(tabNum);
    loadState(1);
    saveState(1);
    loadState(2);
    saveState(2);
    loadState(3);
    saveState(3);
    var authenticated = authenticateSubmission();
    console.log("Authentication is :" + authenticated);
    if (authenticated) {
      allRoomBookings();
    }
    else {
      location.reload();
    }
  });

  //SEMESTER CHOICE
  $('#next-semester').click(function () {
    $('#round-name').text("Round 1 Bookings");
    $('#next-semester').toggleClass('deactive-semester-choice');
    $('#next-semester').toggleClass('active-semester-choice');
    $('#current-semester').toggleClass('active-semester-choice');
    $('#current-semester').toggleClass('deactive-semester-choice');
    $('#deadline-date').text("15 Jan");
    getSubmissionLog();
    if ($('#form-booking-roomCode').val().length > 4) {
      getRoomTimetable();
    }
  });
  $('#current-semester').click(function () {
    $('#round-name').text("AD-HOC Round Bookings");
    $('#next-semester').toggleClass('deactive-semester-choice');
    $('#next-semester').toggleClass('active-semester-choice');
    $('#current-semester').toggleClass('active-semester-choice');
    $('#current-semester').toggleClass('deactive-semester-choice');
    $('#deadline-date').text("1 Feb");
    getSubmissionLog();
    if ($('#form-booking-roomCode').val().length > 4) {
      getRoomTimetable();
    }
  });

  //ROOM TAB NUMBER DROPDOWN
  $('#select-tab-number').change(function () {
    var tabnum = $('#select-tab-number').val();
    var prevtab = parseInt($('.tab-active').attr('id').substring(8));

    if (tabnum == 1) {
      $('#room-tabs ul').html('<li class="room-tab tab-active" id="tab-room1">Room 1</li>');
      loadState(1);
    }
    else if (tabnum == 2) {
      $('#room-tabs ul').html('<li class="room-tab tab-active" id="tab-room1">Room 1</li><li class="room-tab" id="tab-room2">Room 2</li>');
      saveState(prevtab);
      loadState(1);
      //			$('#tab-room1').addClass('tab-active');
      //			$('#tab-room2').removeClass('tab-disabled');
      //			$('#tab-room3').addClass('tab-disabled');
    }
    else {
      $('#room-tabs ul').html('<li class="room-tab tab-active" id="tab-room1">Room 1</li><li class="room-tab" id="tab-room2">Room 2</li><li class="room-tab" id="tab-room3">Room 3</li>');
      saveState(prevtab);
      loadState(1);
      //			$('#tab-room1').addClass('tab-active');
      //			$('#tab-room2').removeClass('tab-disabled');
      //			$('#tab-room3').removeClass('tab-disabled');
    }
  });

  //TIMETABLE
  $(".timetable-data").click(function () {

    if (!$(this).hasClass("timetable-taken") && !$(this).hasClass("timetable-disabled")) {	//if it isnt a slot with a Booked (taken) class

      if ($(this).hasClass("timetable-selected")) {
        $(this).removeClass("timetable-selected");
        //alert("This time slot has been unselected.")
      }
      else {
        $(this).toggleClass("timetable-selected");

        var thisClass = $(this).attr("class");
        var thisPeriod = thisClass.substr(0, thisClass.indexOf(" "));
        thisPeriod = thisPeriod.substr(thisPeriod.length - 1, thisPeriod.length);

        var parentClass = $(this).parent().attr("class");
        var thisDay = parentClass.substr(15, 16);

        var room = $('#form-booking-roomCode').val();

        //alert("Selected Room: "+room+" \n\nPeriod: "+thisPeriod+"\nDay: "+thisDay);
      }

    }
    else if ($(this).hasClass("timetable-taken")) {	//if it IS a taken/booked slot
      $('.pop').html($(this).find('.timetable-content-empty').html());
      $('.pop').fadeToggle();
    }
    else if ($(this).hasClass("timetable-disabled") && !$(this).hasClass("timetable-taken")) {

    }
  });

  $(document).on('click', '.close', function () { //essential to make dynamically inserted html elements have the click handler
    //$('.close').on('click', function() {
    $('.pop').fadeToggle();
    $('.pop').delay(1000).html("<b>Information for a booked timetable slot.</b><br/><br/><br/><br/><br/><p></p><p class='close'>Close</p>");
  });


  //SUBMISSION LOG SLIDER
  $(document).on('click', '.log-group', function () {
    //$(".log-group").click(function(){
    $(this).siblings(".log-contents-container").slideToggle("slow");
    $(this).find('.log-icon').children().toggleClass("fa-angle-double-down fa-angle-double-up");
  });

  //WEEK SELECTOR
  $('#form-requiredWeeks-list :checkbox[name=all]').change(function () {
    if ($(this).is(':checked')) {
      for (var i = 1; i < 16; i++) {
        $('#form-requiredWeeks-w' + i).prop('checked', true);
      }
    }
    else {
      for (var i = 1; i < 16; i++) {
        $('#form-requiredWeeks-w' + i).prop('checked', false);
      }
    }
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
    var tabNum = $('.room-tab').parent().find('.tab-active').attr('id');
    tabNum = parseInt(tabNum.charAt(8));
    resetPreferences(tabNum);
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
    console.log(buildingcode + " selected.");

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
  $('#form-capacity').change(function () {
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

  //REQUIRED WEEKS SELECTION
  $('.form-requiredWeeks-checkbox').change(function () {
    getRoomTimetable();
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
    requestid: "getSuitableRooms", park: park, capacity: capacity, buildingcode: buildingcode, lab: lab, wheelchair: wheelchair,
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

//fills the building drop-down with a list of possible buildings depending on park
//the 'building' input is when a particular building needs to be auto-selected
function fillBuildingsList(building) {
  //when park is selected, grab the new value, and update buildingList choice with buildings in that park

  $.post("api.cshtml", {requestid: "getParkBuildings", park: $('#select-park').val()},
  function (JSONresult) {

    var buildingList = "<option>Any</option>";
    for (var i = 0; i < JSONresult.length; i++) {
      buildingList += "<option>" + JSONresult[i].building_code + " - " + JSONresult[i].building_name + "</option>";
    }
    $("#select-building").html(buildingList);

    //select Any or building by default
    $("#select-building").val(building);

  }, 'json');

}

//fills the timetable with booked slots from the database
function getRoomTimetable() {

  clearTimetable();

  if (checkRoomIsValid($('#form-booking-roomCode').val())) {	//if the selected room is valid

    console.log("getRoomTimetable() called");

    var weeks = "";
    $('#form-requiredWeeks-row1').find('.form-requiredWeeks-checkbox:checked').each(function () {	//iterates through checked weeks
      var id = $(this).attr('id');
      if (id != "form-requiredWeeks-all") {
        id = id.substring(20);
        weeks += id + ",";
      }
    });

    if (weeks.length > 0) {
      weeks = weeks.substr(0, weeks.length - 1);

      var sem = $('.active-semester-choice').attr('id');
      if (sem == "current-semester") {
        sem = "1";
      }
      else {
        sem = "2";
      }

      console.log("Semester: " + sem + "  Weeks: " + weeks + "  RoomCode: " + $('#form-booking-roomCode').val());

      //Perform API call to retrieve timetable bookings for times and weeks
      $.post("api.cshtml", {requestid: "getRoomTimetable", roomcode: $('#form-booking-roomCode').val(), weeks: weeks, semester: sem},
      function (JSONresult) {

        //console.log( JSONresult[i]['request_details'].request_day );  or request_timestart, request_round, module_code, request_priority (null or string)
        //console.log( JSONresult[i]['weeks-list'][j].week_number );
        //console.log( JSONresult[i]['weeks_range'][j]);
        //console.log( JSONresult[i]['weeks_range'].length );

        for (var i = 0; i < JSONresult.length; i++) {
          var day = JSONresult[i]['request_details'].request_day;
          var dayneat = day.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});  //Makes first letter upper case  //TODO: Copy this to other timetables
          var time = JSONresult[i]['request_details'].request_timestart;

          //if this slot is currently clear
          if (!$('.timetable-table tbody tr[class*="' + day + '"]').find('td[class*="period' + time + '"]').hasClass("timetable-taken")) {

            $('.timetable-table tbody tr[class*="' + day + '"]').find('td[class*="period' + time + '"]').addClass("timetable-taken");
            $('.timetable-table tbody tr[class*="' + day + '"]').find('td[class*="period' + time + '"]').removeClass("timetable-selected");

            //Multiple content should be in form: <span class='timetable-taken-text'>Booked</span><div class='timetable-content-empty'></div>
            var content = "<span class='timetable-taken-text'>Booked</span><div class='timetable-content-empty'>";

            var popContent = "<b>Information for a booked timetable slot.</b><br/>";
            popContent += "Day: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + dayneat + "<br/>";
            popContent += "Period: &nbsp;" + time + "<br/><br/>";
            popContent += "The module <b>" + JSONresult[i]['request_details'].module_code + "</b> has booked this slot for weeks:<br/>";
            //for (var j = 0; j < JSONresult[i]['weeks_range'].length; j++) {
              popContent += JSONresult[i]['weeks_range']/*+ ", "*/;
            //}
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

            contentStart += "<br/><br/>The module <b>" + JSONresult[i]['request_details'].module_code + "</b> has booked this slot for weeks:<br/>";
            for (var j = 0; j < JSONresult[i]['weeks_range'].length; j++) {
              contentStart += JSONresult[i]['weeks_range'][j] + ", ";
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
    $.post("api.cshtml", {requestid: "getBuildingName", buildingcode: buildingCode},
    function (JSONresult) {
      $('#form-booking-roomName').text(JSONresult[0].building_name);
      getRoomTimetable();
    }, 'json');

  }
  else {	//roomCode is for Cope Auditorium
    $('#form-booking-roomName').text("Cope Auditorium");
    getRoomTimetable();
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
  if ($('.tab-active').attr('id') == 'tab-room1') {
    $('.timetable-data').html("<div class='timetable-content-empty'></div>");
    $('.timetable-data').removeClass("timetable-taken");
    $('.timetable-data').removeClass("timetable-disabled");
  }
  else if ($('.tab-active').attr('id') == 'tab-room2' || $('.tab-active').attr('id') == 'tab-room3') {
    $('.timetable-data').html("<div class='timetable-content-empty'></div>");
    $('.timetable-data').removeClass("timetable-taken");
  }

}

//function to grab the details for the submission log entries
function getSubmissionLog() {
  console.log("getSubmissionLog() called");

  var sem = $('.active-semester-choice').attr('id');
  if (sem == "current-semester") {
    sem = "1";
  }
  else {
    sem = "2";
  }

  //call api.cshtml with semester to return the submission log entries (pending this round, rejected previous rounds)
  $.post("api.cshtml", {requestid: "getRoomLogsBooking", semester: sem},
  function (JSONresult) {
    //JSONresult =  JSON.parse($($.parseHTML(JSONresult)).filter("#json").html());

    //console.log( JSONresult[i]['request_details'].request_day );  or request_timestart, request_round, module_code, request_priority (null or string)
    //console.log( JSONresult[i]['weeks-list'][j].week_number );
    //console.log( JSONresult[i]['weeks_range'][j]);
    //console.log( JSONresult[i]['weeks_range'].length );

    var logContent = "";
    var currentModules = [];	//list of modules currently grouped into submission log
    var exclusionIndices = [];
    var logEntryAdditions = []; //Array in form ["module_code---Div contents..."] to add to existing logs

    for (var i = 0; i < JSONresult.length; i++) { //for each result in the return	

      var skip = false;	//skip flag variable		
      for (var idx = 0; idx < exclusionIndices.length; idx++) {
        if (exclusionIndices[idx] == i) {
          skip = true;	//if the current log is in the exclusion array then skip
        }
      }

      if (skip) {
        //console.log("Skipped adding new log-entry (Linked child in Exclusion array)"); //ie. it was previously added onto other request as a linked child
      }
      else {	//for a regular log

        var isNew = true;
        var currentContentStart = "";
        var currentContent = "";
        var currentContentEnd = "";

        for (var k = 0; k < currentModules.length; k++) {
          if (currentModules[k] == JSONresult[i]['request_details'].module_code) {
            isNew = false;
          }
        }

        if (isNew) {	//if there is no log group for this module
          //create a new log group and add this log entry
          currentModules.push(JSONresult[i]['request_details'].module_code);
          currentContentStart += '<div class="log-group-container">';

          currentContentStart += '<div class="log-group log-group-' + JSONresult[i]['request_details'].request_status + '">';

          //module details
          currentContentStart += '<div class="log-heading">';
          currentContentStart += '<span class="log-moduleCode">' + JSONresult[i]['request_details'].module_code + '</span>';
          currentContentStart += '<span class="log-moduleTitle">' + JSONresult[i]['request_details'].module_title + '</span>';
          currentContentStart += '<span class="log-icon"><i class="fa fa-angle-double-down fa-lg"></i></span>';
          currentContentStart += '<span class="log-status">' + JSONresult[i]['request_details'].request_status + '</span>';
          currentContentStart += '</div>';

          currentContentStart += '</div>';

          //module logs (add entries here)
          currentContentStart += '<div class="log-contents-container">';
        }

        //log entry
        currentContent += '<div class="log-entry-' + JSONresult[i]['request_details'].request_status + '">';
        currentContent += '<div class="log-entry-icons">';
        if (JSONresult[i]['request_details'].request_status == "rejected") {
          currentContent += '<span class="log-entry-edit-icon"><i class="fa fa-pencil-square-o fa-lg"></i></span><span class="log-entry-copy-icon log-icon-unused"><i class="fa fa-files-o fa-lg"></i></span><span class="log-entry-delete-icon log-icon-unused"><i class="fa fa-close fa-lg"></i></span>';
        }
        else { //approved OR pending
          currentContent += '<span class="log-entry-edit-icon"><i class="fa fa-pencil-square-o fa-lg"></i></span><span class="log-entry-copy-icon"><i class="fa fa-files-o fa-lg"></i></span><span class="log-entry-delete-icon"><i class="fa fa-close fa-lg"></i></span>';
        }
        currentContent += '</div>';

        currentContent += '<div class="log-entry-information">';
				currentContent += '<span class="log-entry-id" style="display:none;">'+JSONresult[i]['request_details'].request_id+'</span>';
				currentContent += '<span class="log-entry-child" style="display:none;">'+JSONresult[i]['request_details'].request_child+'</span>';
        currentContent += '<span class="log-entry-building">Building: ' + JSONresult[i]['request_details'].building_code + '</span>';
        currentContent += '<span class="log-entry-park">(' + JSONresult[i]['request_details'].park + ')</span>';
        currentContent += '<span class="log-entry-room">Room: ' + JSONresult[i]['request_details'].room_code + '</span>';
        if (JSONresult[i]['request_details'].request_priority !== null) {
          currentContent += '<span class="log-entry-priority">P<i class="fa fa-check"></i></span>';
        }
        currentContent += '<div class="log-entry-status"><span class="log-entry-logStatus">' + JSONresult[i]['request_details'].request_status + '</span></div>';
        currentContent += '<br/>';
        currentContent += '<span class="log-entry-weeks">Weeks: ';
        for (var j = 0; j < JSONresult[i]['weeks_range'].length; j++) {
          currentContent += JSONresult[i]['weeks_range'][j] + " ";
        }
        currentContent += '</span>';
        currentContent += '<span class="log-entry-semester">Semester: ' + JSONresult[i]['request_details'].request_semester + '</span>';
        currentContent += '<span class="log-entry-day">Day: ' + JSONresult[i]['request_details'].request_day + '</span>';
        currentContent += '<span class="log-entry-time">Period: ' + JSONresult[i]['request_details'].request_timestart + '</span>';
        currentContent += '</div>';

        currentContent += '</div>';

        //If log entry has child requests (ie. linked bookings)
        if (JSONresult[i]['request_details'].request_child !== null) {

          var req_child = JSONresult[i]['request_details'].request_child;
          //console.log("Booking has a child request of id:" + req_child);

          for (var y = i; y < JSONresult.length; y++) { //for each log entry following this one
            if (JSONresult[y]['request_details'].request_id == req_child) {	//if the request id is this one's child
              exclusionIndices.push(y);

              //LINKED ENTRY LOG BELOW									
              //log entry
              currentContent += '<div class="log-entry-' + JSONresult[y]['request_details'].request_status + '">';

              currentContent += '<div class="log-entry-information">';
							currentContent += '<span class="log-entry-id" style="display:none;">'+JSONresult[y]['request_details'].request_id+'</span>';
							currentContent += '<span class="log-entry-child" style="display:none;">'+JSONresult[y]['request_details'].request_child+'</span>';
              currentContent += '<span class="log-entry-building">Building: ' + JSONresult[y]['request_details'].building_code + '</span>';
              currentContent += '<span class="log-entry-park">(' + JSONresult[y]['request_details'].park + ')</span>';
              currentContent += '<span class="log-entry-room">Room: ' + JSONresult[y]['request_details'].room_code + '</span>';
              //currentContent += '<div class="log-entry-status"><span class="log-entry-logStatus">'+JSONresult[y]['request_details'].request_status+'</span></div>';
              currentContent += '<br/>';
              currentContent += '<span class="log-entry-weeks">Weeks: ';
              for (var j = 0; j < JSONresult[y]['weeks_range'].length; j++) {
                currentContent += JSONresult[y]['weeks_range'][j] + " ";
              }
              currentContent += '</span>';
              currentContent += '<span class="log-entry-semester">Semester: ' + JSONresult[y]['request_details'].request_semester + '</span>';
              currentContent += '<span class="log-entry-day">Day: ' + JSONresult[y]['request_details'].request_day + '</span>';
              currentContent += '<span class="log-entry-time">Period: ' + JSONresult[y]['request_details'].request_timestart + '</span>';
              currentContent += '</div>';

              currentContent += '</div>';

              if (JSONresult[y]['request_details'].request_child !== null) {	//if there is another child (last possible)

                var req_child2 = JSONresult[y]['request_details'].request_child;
                //console.log("Booking has a child request of id:" + req_child2);

                for (var last = 0; last < JSONresult.length; last++) { //for each log entry
                  if (JSONresult[last]['request_details'].request_id == req_child2) {	//if the request id is this one's child
                    exclusionIndices.push(last);

                    //LINKED ENTRY LOG BELOW									
                    //log entry
                    currentContent += '<div class="log-entry-' + JSONresult[last]['request_details'].request_status + '">';

                    currentContent += '<div class="log-entry-information">';
										currentContent += '<span class="log-entry-id" style="display:none;">'+JSONresult[last]['request_details'].request_id+'</span>';
										currentContent += '<span class="log-entry-child" style="display:none;">'+JSONresult[last]['request_details'].request_child+'</span>';
                    currentContent += '<span class="log-entry-building">Building: ' + JSONresult[last]['request_details'].building_code + '</span>';
                    currentContent += '<span class="log-entry-park">(' + JSONresult[last]['request_details'].park + ')</span>';
                    currentContent += '<span class="log-entry-room">Room: ' + JSONresult[last]['request_details'].room_code + '</span>';
                    //currentContent += '<div class="log-entry-status"><span class="log-entry-logStatus">'+JSONresult[last]['request_details'].request_status+'</span></div>';
                    currentContent += '<br/>';
                    currentContent += '<span class="log-entry-weeks">Weeks: ';
                    for (var j = 0; j < JSONresult[last]['weeks_range'].length; j++) {
                      currentContent += JSONresult[last]['weeks_range'][j] + " ";
                    }
                    currentContent += '</span>';
                    currentContent += '<span class="log-entry-semester">Semester: ' + JSONresult[last]['request_details'].request_semester + '</span>';
                    currentContent += '<span class="log-entry-day">Day: ' + JSONresult[last]['request_details'].request_day + '</span>';
                    currentContent += '<span class="log-entry-time">Period: ' + JSONresult[last]['request_details'].request_timestart + '</span>';
                    currentContent += '</div>';

                    currentContent += '</div>';

                  }
                }
              }

            }
          }
        }

        if (isNew) {
          currentContentEnd += '</div>'; //.log-contents-container

          currentContentEnd += '</div>';

          currentContentEnd += '</div>';

          logContent += currentContentStart + currentContent + currentContentEnd;
        }
        else {
          //Put the log entry into the existing log-group for the module_code
          //Content of this entry is "currentContent"
          //Add it to array of additions: ["COB103---Div content here..."]
          //console.log("Loaded new " + JSONresult[i]['request_details'].module_code + " entry into existing log-group");
          logEntryAdditions.push(JSONresult[i]['request_details'].module_code + "---" + currentContent);
        }
      }

    }

    $('#submissionLog-inner-container').html(logContent);

    //At the end, loop through array, find the correct log group, add to the html content
    for (var loop = 0; loop < logEntryAdditions.length; loop++) {

      var content = logEntryAdditions[loop];
      var modulecode = content.substr(0, content.indexOf("---"));
      content = content.substring((content.indexOf("---")) + 3);

      $('.log-moduleCode').each(function () {	//for each log-group
        if ($(this).text() == modulecode) {		//if the module code is modulecode
          var obj = $(this).parents('.log-group-container').find('.log-contents-container');
          obj.html(obj.html() + content);
        }
      });

    }

    //Loop through each log-group, set the 'log-group-pending/rejected' class
    $('.log-group').each(function () {

      var rejected = false;

      $(this).next().children('div').each(function () {
        if ($(this).hasClass('log-entry-rejected')) {
          rejected = true;
        }
      });

      //remove existing colour classes
      $(this).removeClass('log-group-pending');
      $(this).removeClass('log-group-rejected');

      if (rejected) {	//add REJECTED if necessary
        $(this).addClass('log-group-rejected');
        $(this).find('.log-status').text("Rejected");
      }
      else {	//otherwise add PENDING
        $(this).addClass('log-group-pending');
        $(this).find('.log-status').text("Pending");
      }

    });
		
		//remove icons from linked bookings at tab1
		$('.log-contents-container div').each(function() {
			var child = $(this).find('.log-entry-child').text();
			if (child.length > 0) {
				$('.log-contents-container div').each(function() {
					if ($(this).find('.log-entry-id').text() == child) {
						$(this).find('.log-entry-icons').html("");
						$(this).find('.log-entry-status').html("");
					}
				});
			}
		});


  }, 'json');
}

//function to submit all bookings //TODO: Delete this?
function submitBookings() {
  console.log("submitBookings() called");

  //grab requested facilities
  var park = $('#select-park').val();
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
  var roomuse = $('#select-roomuse').val();
  var priority = $('#form-priority').val();
  if (priority.length == 0) {
    priority = null;
  }
  var lab = 0;
  var wheelchair = 0;
  var hearingloop = 0;
  var computer = 0;
  var projector = 0;
  var dprojector = 0;
  var ohp = 0;
  var visualiser = 0;
  var video = 0;
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
        video = 1;
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

  //grab the room information
  var roomcode = $('#form-booking-roomCode').val();

  var weeks = "";		//in form "1,2,5,6,12,"
  $('#form-requiredWeeks-row1').find('.form-requiredWeeks-checkbox:checked').each(function () {	//iterates through checked weeks
    var id = $(this).attr('id');
    if (id != "form-requiredWeeks-all") {
      id = id.substring(20);
      weeks += id + ",";
    }
  });

}

//function to save state of tab-content
function saveState(tabnumber) {

  //grab requested facilities
  $('#select-park-tab' + tabnumber).text($('#select-park').val());
  var capacity = parseInt($('#form-capacity').val());
  if (!checkInp("capacity", capacity)) {
    capacity = 0;
  }
  $('#form-capacity-tab' + tabnumber).text(capacity);

  var buildingcode = $('#select-building').val();
  if (buildingcode == null) {
    buildingcode = "Any"
  }
  else {
    buildingcode = buildingcode.substr(0, buildingcode.indexOf(' '));
    if (buildingcode.length < 1) {
      buildingcode = "Any"
    }
  }
  $('#select-building-tab' + tabnumber).text(buildingcode);

  $('#select-roomuse-tab' + tabnumber).text($('#select-roomuse').val());
  var priority = $('#form-priority').val();
  if (priority.length == 0) {
    priority = null;
  }
  $('#form-priority-tab1').text(priority);

  var lab = 0;
  var wheelchair = 0;
  var hearingloop = 0;
  var computer = 0;
  var projector = 0;
  var dprojector = 0;
  var ohp = 0;
  var visualiser = 0;
  var video = 0;
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
        video = 1;
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

  $('#lab-tab' + tabnumber).text(lab);
  $('#wheelchair-tab' + tabnumber).text(wheelchair);
  $('#hearingloop-tab' + tabnumber).text(hearingloop);
  $('#computer-tab' + tabnumber).text(computer);
  $('#projector-tab' + tabnumber).text(projector);
  $('#dprojector-tab' + tabnumber).text(dprojector);
  $('#ohp-tab' + tabnumber).text(ohp);
  $('#visualiser-tab' + tabnumber).text(visualiser);
  $('#video-tab' + tabnumber).text(video);
  $('#bluray-tab' + tabnumber).text(bluray);
  $('#vhs-tab' + tabnumber).text(vhs);
  $('#whiteboard-tab' + tabnumber).text(whiteboard);
  $('#chalkboard-tab' + tabnumber).text(chalkboard);
  $('#plasma-tab' + tabnumber).text(plasma);
  $('#pasystem-tab' + tabnumber).text(pasystem);
  $('#radiomic-tab' + tabnumber).text(radiomic);
  $('#review-tab' + tabnumber).text(review);

  $('#roomcode-tab' + tabnumber).text($('#form-booking-roomCode').val());

  $('#tab' + tabnumber + '-monday').text("");
  $('#tab' + tabnumber + '-tuesday').text("");
  $('#tab' + tabnumber + '-wednesday').text("");
  $('#tab' + tabnumber + '-thursday').text("");
  $('#tab' + tabnumber + '-friday').text("");

  $('.timetable-selected').each(function () {
    var obj = $(this).attr('class');
    var period = obj.substr(obj.indexOf("period") + 6, 1);
    var day = $(this).parent().attr('class').substring($(this).parent().attr('class').indexOf("timetable-row") + 15);

    var id = "#tab" + tabnumber + "-" + day;
    $(id).text($(id).text() + period + ", ");

  });

}

function loadState(tabnumber) {
  //set specific req's to blank
  $('#select-specificreqs li').children('.list-activeFacility').each(function () {
    $(this).removeClass('list-activeFacility');
  });

  //set timetable selected to blank
  $('.timetable-data').removeClass('timetable-selected');

  $('#select-park').val($('#select-park-tab' + tabnumber).text());
  $('#form-capacity').val($('#form-capacity-tab' + tabnumber).text());

  $('#select-building').val($('#select-building-tab' + tabnumber).text());

  $('#select-roomuse').val($('#select-roomuse-tab' + tabnumber).text());
  $('#form-priority').val($('#form-priority-tab' + tabnumber).text());

  $('.requirements-tab' + tabnumber + ' span').each(function () {
    if ($(this).text() == 1) {
      var id = $(this).attr('id');
      switch (id) {
        case "lab-tab" + tabnumber:
          $('#facility-Lab').addClass('list-activeFacility');
          break;
        case "wheelchair-tab" + tabnumber:
          $('#facility-Wheelchair').addClass('list-activeFacility');
          break;
        case "hearingloop-tab" + tabnumber:
          $('#facility-InductionLoop').addClass('list-activeFacility');
          break;
        case "computer-tab" + tabnumber:
          $('#facility-Computer').addClass('list-activeFacility');
          break;
        case "projector-tab" + tabnumber:
          $('#facility-Projector').addClass('list-activeFacility');
          break;
        case "dprojector-tab" + tabnumber:
          $('#facility-DualProjector').addClass('list-activeFacility');
          break;
        case "ohp-tab" + tabnumber:
          $('#facility-OHP').addClass('list-activeFacility');
          break;
        case "visualiser-tab" + tabnumber:
          $('#facility-Visualiser').addClass('list-activeFacility');
          break;
        case "video-tab" + tabnumber:
          $('#facility-DVD').addClass('list-activeFacility');
          break;
        case "bluray-tab" + tabnumber:
          $('#facility-BluRay').addClass('list-activeFacility');
          break;
        case "vhs-tab" + tabnumber:
          $('#facility-VHS').addClass('list-activeFacility');
          break;
        case "whiteboard-tab" + tabnumber:
          $('#facility-Whiteboard').addClass('list-activeFacility');
          break;
        case "chalkboard-tab" + tabnumber:
          $('#facility-Chalkboard').addClass('list-activeFacility');
          break;
        case "plasma-tab" + tabnumber:
          $('#facility-Plasma').addClass('list-activeFacility');
          break;
        case "pasystem-tab" + tabnumber:
          $('#facility-PASystem').addClass('list-activeFacility');
          break;
        case "radiomic-tab" + tabnumber:
          $('#facility-RadioMic').addClass('list-activeFacility');
          break;
        case "review-tab" + tabnumber:
          $('#facility-ReVIEW').addClass('list-activeFacility');
          break;
      }
      ;
    }
  });

  $('#form-booking-roomCode').val($('#roomcode-tab' + tabnumber).text());

  if (tabnumber == 2 || tabnumber == 3) {
    $(".form-requiredWeeks-checkbox").attr("disabled", true);
    $('.timetable-data').addClass('timetable-disabled');
		$('#form-priority').text( $('#form-priority-tab1').text() );
		
    //Set all slots to disabled
    //Loop through selected slots on room1, remove disabled for these slots

    var slots1 = $('#tab' + 1 + '-monday').text().split(", ");	// 1, 2, 3, 6, 8, 9,
    for (var i = 0; i < slots1.length - 1; i++) {
      $('.timetable-row2-monday').find('td[class*="period' + slots1[i] + '"]').removeClass('timetable-disabled');
      //$('.timetable-row2-monday').find('td[class*="period' + slots1[i] + '"]').removeClass('timetable-disabled');
    }

    slots1 = $('#tab' + 1 + '-tuesday').text().split(", ");	// 1, 2, 3, 6, 8, 9,
    for (var i = 0; i < slots1.length - 1; i++) {
      $('.timetable-row3-tuesday').find('td[class*="period' + slots1[i] + '"]').removeClass('timetable-disabled');
    }

    slots1 = $('#tab' + 1 + '-wednesday').text().split(", ");	// 1, 2, 3, 6, 8, 9,
    for (var i = 0; i < slots1.length - 1; i++) {
      $('.timetable-row4-wednesday').find('td[class*="period' + slots1[i] + '"]').removeClass('timetable-disabled');
    }

    slots1 = $('#tab' + 1 + '-thursday').text().split(", ");	// 1, 2, 3, 6, 8, 9,
    for (var i = 0; i < slots1.length - 1; i++) {
      $('.timetable-row5-thursday').find('td[class*="period' + slots1[i] + '"]').removeClass('timetable-disabled');
    }

    slots1 = $('#tab' + 1 + '-friday').text().split(", ");	// 1, 2, 3, 6, 8, 9,
    for (var i = 0; i < slots1.length - 1; i++) {
      $('.timetable-row6-friday').find('td[class*="period' + slots1[i] + '"]').removeClass('timetable-disabled');
    }

  }
  else {
    $(".form-requiredWeeks-checkbox").removeAttr("disabled");
    $('.timetable-data').removeClass('timetable-disabled');
  }

  var slots = $('#tab' + tabnumber + '-monday').text().split(", ");	// 1, 2, 3, 6, 8, 9,
  for (var i = 0; i < slots.length - 1; i++) {
    $('.timetable-row2-monday').find('td[class*="period' + slots[i] + '"]').addClass('timetable-selected');
  }

  slots = $('#tab' + tabnumber + '-tuesday').text().split(", ");	// 1, 2, 3, 6, 8, 9,
  for (var i = 0; i < slots.length - 1; i++) {
    $('.timetable-row3-tuesday').find('td[class*="period' + slots[i] + '"]').addClass('timetable-selected');
  }

  slots = $('#tab' + tabnumber + '-wednesday').text().split(", ");	// 1, 2, 3, 6, 8, 9,
  for (var i = 0; i < slots.length - 1; i++) {
    $('.timetable-row4-wednesday').find('td[class*="period' + slots[i] + '"]').addClass('timetable-selected');
  }

  slots = $('#tab' + tabnumber + '-thursday').text().split(", ");	// 1, 2, 3, 6, 8, 9,
  for (var i = 0; i < slots.length - 1; i++) {
    $('.timetable-row5-thursday').find('td[class*="period' + slots[i] + '"]').addClass('timetable-selected');
  }

  slots = $('#tab' + tabnumber + '-friday').text().split(", ");	// 1, 2, 3, 6, 8, 9,
  for (var i = 0; i < slots.length - 1; i++) {
    $('.timetable-row6-friday').find('td[class*="period' + slots[i] + '"]').addClass('timetable-selected');
  }


}

//Checks to see if selected submission slots are at most 3 in a row (side-by-side & linked)
function authenticateSubmission() {
  var tabnumber = 1;
	var msg = "";
  var fine = true;

  //Check they have chosen timetable slots for each tab
  var slotspicked = true;
  var numTabs = $('#select-tab-number').val();
  for (var i = 1; i <= numTabs; i++) { //loop through their room tabs
    var thistabpicked = false;          //flag for slots on this tab
    if ( $('#tab' + i + '-monday').text().length > 0 ) { thistabpicked = true }
    if ( $('#tab' + i + '-tuesday').text().length > 0 ) { thistabpicked = true }
    if ( $('#tab' + i + '-wednesday').text().length > 0 ) { thistabpicked = true }
    if ( $('#tab' + i + '-thursday').text().length > 0 ) { thistabpicked = true }
    if ( $('#tab' + i + '-friday').text().length > 0 ) { thistabpicked = true }
    if (!thistabpicked) {   //if nothing has been selected in this slot then return false
      slotspicked = false;
    }
  }

  if (!slotspicked) { //If slots arent picked for one of the room tabs
    fine = false;
    msg += "You have not selected any timetable slots for one or more of the room tabs.\n\n";
  }
  else {  //If slots are picked for all selected room tabs, check for max 3 hour lecture

    //Check for max 3 hour lecture linked
    var slots = $('#tab' + tabnumber + '-monday').text().split(", "); 	// 1, 2, 3, 6, 8, 9,
    for (var i = 0; i < slots.length - 2; i++) {
      var j = parseInt(slots[i]);
      if ((parseInt(slots[i + 1]) == (j + 1)) && (parseInt(slots[i + 2]) == (j + 2)) && (parseInt(slots[i + 3]) == (j + 3))) {
        fine = false;
      }
    }
    slots = $('#tab' + tabnumber + '-tuesday').text().split(", "); // 1, 2, 3, 6, 8, 9,
    for (var i = 0; i < slots.length - 2; i++) {
      var j = parseInt(slots[i]);
      if ((parseInt(slots[i + 1]) == (j + 1)) && (parseInt(slots[i + 2]) == (j + 2)) && (parseInt(slots[i + 3]) == (j + 3))) {
        fine = false;
      }
    }
    slots = $('#tab' + tabnumber + '-wednesday').text().split(", "); // 1, 2, 3, 6, 8, 9,
    for (var i = 0; i < slots.length - 2; i++) {
      var j = parseInt(slots[i]);
      if ((parseInt(slots[i + 1]) == (j + 1)) && (parseInt(slots[i + 2]) == (j + 2)) && (parseInt(slots[i + 3]) == (j + 3))) {
        fine = false;
      }
    }
    slots = $('#tab' + tabnumber + '-thursday').text().split(", "); // 1, 2, 3, 6, 8, 9,
    for (var i = 0; i < slots.length - 2; i++) {
      var j = parseInt(slots[i]);
      if ((parseInt(slots[i + 1]) == (j + 1)) && (parseInt(slots[i + 2]) == (j + 2)) && (parseInt(slots[i + 3]) == (j + 3))) {
        fine = false;
      }
    }
    slots = $('#tab' + tabnumber + '-friday').text().split(", "); // 1, 2, 3, 6, 8, 9,
    for (var i = 0; i < slots.length - 2; i++) {
      var j = parseInt(slots[i]);
      if ((parseInt(slots[i + 1]) == (j + 1)) && (parseInt(slots[i + 2]) == (j + 2)) && (parseInt(slots[i + 3]) == (j + 3))) {
        fine = false;
      }
    }

    if (fine == false) {
      msg += "You can only have a lecture of length 3 hours maximum.\n\n";
    }

  }
	
	//Check they entered module code
	var modcode = $('#input-moduleInfo').val();
	if (modcode.length < 5) {
		fine = false;
		msg += "Please enter a valid module.\n\n";
	}
	
  //Check roomcode is valid
  var roomcode1 = $('#roomcode-tab1').text();
	var roomcode2 = $('#roomcode-tab2').text();
	var roomcode3 = $('#roomcode-tab2').text();
	if ( (roomcode1.length < 4) && (roomcode2.length < 4) && (roomcode3.length < 4)) {
		fine = false;
		msg += "Enter a valid roomcode in all of the tabs.\n\n";
	}
	
	//Weeks
	var weeksfine = false;
	$('#form-requiredWeeks-row1').find('.form-requiredWeeks-checkbox').each(function () {	//iterates through checked weeks
	  var id = $(this).is(':checked');
	  if (id) {
	    weeksfine = true;
	  }
	});
	if (!weeksfine) {
	  msg += "You did not select any weeks.\n\n";
	  fine = false;
  }
	
	if (!fine) {
		alert(msg);
	}
  return fine;
}

function resetPreferences(tab) {
  loadState(tab);
  $('#select-park').val("Any");
  $('#select-building').val("Any");
  $('#select-roomuse').val("Lecture");
  $('#form-capacity').val("");
  $('#form-priority').val("");
  $('#select-specificreqs li').children('.list-activeFacility').each(function () {
    $(this).removeClass('list-activeFacility');
  });
	$('.timetable-data').removeClass('timetable-selected');
	$('.timetable-data').removeClass('timetable-disabled');
  getSuitableRooms();
  saveState(tab);

  //Reset checkboxes to default 11
  $('#form-requiredWeeks-row1').find('.form-requiredWeeks-checkbox').each(function () {	//iterates through weeks
    var week = $(this).attr("name");
    if (week == "w1" || week == "w2" || week == "w3" || week == "w4" || week == "w5" || week == "w6" || week == "w7" || week == "w8" || week == "w9" || week == "w10" || week == "w11") {
      if (!$(this).is(':checked')) {
        $(this).prop('checked', true);
      }
    }
    else { 
      $(this).prop('checked', false);
    }
  });
}