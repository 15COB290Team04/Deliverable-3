/*
 Team 12
 Loughborough University
 November 2015
 
 Timetabling Prototype Website
 Main script.js file (includes jQuery)
 Used for all universal parts of website (header / navigation bar etc)
 */

$(document).ready(function () {

  notificationLoad();

  //DETECT USER PREFS ON LOADING PAGE
  if (typeof pref_zoom != 'undefined') {
    if (pref_zoom == 1) {
      zoomFunction();
    }
  }
  if (typeof pref_colour != 'undefined') {
    if (pref_colour == 1) {
      colorFunction();
    }
  }

  //HELP ICON CLICKS
  $(".help-icon").click(function () {
    //Get id
    var id = $(this).attr('id');
    id = id.substr(id.indexOf("-") + 1);
    var helpMessage = "";
    if (id == "allocationsForm") { 		//if allocations form
      helpMessage = "Help for allocations room search:\n\nUse the search bar to find a room.\nClicking a selected room will load up the allocated slots for that room.\nThese allocations were set by the Central Administrators from the previous round(s).\n\nIn the timetable below, you can see what time slots have already been booked.";
    }
    else if (id == "allocationsYourSubmissions") { 		//if allocations "your submissions"
      helpMessage = "Help for Your Submissions:\n\nThis is a log of all your submissions from every round.\n\nYou can navigate the 'round' tabs to see what room requests you submitted that round, and subsequently see which requests were SUCCESSFUL and which were REJECTED.\n\nSelecting a previous year allows you to copy a request from a module and submit it for this year.\n\nClicking the COPY icon will load the submission data into the booking page for this year - copying the content and allowing you to resubmit the request.";
    }
    else if (id == "bookingPage") {	//if booking page top
      helpMessage = "Help for Booking Page:\n\nHere you can request to book rooms for a module.\n\nAt the deadline, all requests get sent to the Central Administrators, the rooms get allocated, and the next round begins.\n\nEnter your department and module details, and then choose the number of rooms you require.";
    }
    else if (id == "roomBooking") { 	//if roomsearch/roombooking
      helpMessage = "Help for Room Booking:\n\nSelect the number of rooms you require for the module. You cannot submit if you choose a room and don't request anything.\n\nThe expandable Room Search box allows you to find a room with the facilities you require, by giving you options to filter the rooms on campus.\nIf you already know the room you would like, skip straight to the 'Room Booking' section and enter the room code.\n\nSelect the weeks you want to book the room for, and use the timetable display to pick one or more free slots.\nThe priority checkbox allows you to send a message to the Central Admin, explaining why it is a priority that you are allocated this room.";
    }
    else if (id == "submissionLog") {	//if submission log at bottom of booking page
      helpMessage = "Help for Submission Log:\n\nThis log shows all submissions you have made for this current round, and the rejected submissions from the previous round.\nAll logs are grouped by their module code.\n\nBy clicking the DELETE icon, you will remove a pending submission (it will not be sent to the Central Administrators at the end of the round.\n\nBy clicking the EDIT icon, you will load the data into the booking page above - allowing you to make a change to your submission, or in the case of a previous rejection - modify the submission and resubmit.\n\nOnce all rejected submissions are dealt with, the module group will change colour from a red to a blue.";
    }
    else {//error
      helpMessage = "Oops! We cannot find this help text.";
    }
    alert(helpMessage);
  });

  /* ACCESSIBILITY OPTIONS */
  $('#fontChange').click(function () {
    zoomFunction();
  });

  /* COLOUR CHANGE */
  $('#toggleColor').click(function () {
    colorFunction();
  });

  $('#user-notifications').click(function () {
    notificationLoad();
    $('.user-notification-dropdown').slideToggle();
  });

  /*NOTIFICATION READ*/
  $("#read-icon").click(function () {
    //Calc ID String
    var idList = "";
    $('.notification-id').each(function () {
      idList += $(this).text() + ',';
    });
    idList = idList.substr(0, idList.length - 1);
    console.log(idList);
    //Call set Post
    $.post("api.cshtml", { requestid: "setNotifications", idlist: idList },
    function (JSONresult) {
      if (JSONresult) {
        $('.notification-container').html("");
        $('#user-notification-alert').css("display", "none");
        notificationLoad();
        alert("Notifications read!");

        //Tarun - Remove and Reset Notifications, Query Success
      }
    }, 'json');
  });
});

//Client-side Validation
function checkInp(type, input) {

  if (type == "capacity") {
    if (input >= 0 && input <= 1000) {
      return true;
    }
    else {
      return false;
    }
  }

}

function zoomFunction() {
  if (parseInt($('#page-content-container').css('font-size')) == 16) {
    $.post("updateprefs.cshtml", {prefid: "zoom", prefval: "1"},
    function (JSONresult) {
      //Reserved
    }, 'json');
    $('#page-content-container').css('font-size', '118%'); //everything increase in size
    $('#header-navigation').css('font-size', '118%'); //navbar increase in size
    $('#header-navigation').css('height', '40px');
    $('#fontChange').removeClass('fa fa-search-plus fa-2x');
    $('#fontChange').addClass('fa fa-search-minus fa-2x');
    $('#help-bookingPage').css('margin-left', '1030px');
    $('#header-navigation ul li').css('height', '35px');
    $('.log-entry-rejected').css('height', '50px');
    $('.log-entry-pending').css('height', '50px');
    $('.log-entry-accepted').css('height', '50px');

  }
  else {
    $.post("updateprefs.cshtml", {prefid: "zoom", prefval: "0"},
    function (JSONresult) {
      //Reserved
    }, 'json');
    $('#page-content-container').css('font-size', '100%'); //everything return to normal size
    $('#header-navigation').css('font-size', '100%'); //navbar return to normal size    
    $('#header-navigation').css('height', '35px');
    $('#fontChange').removeClass('fa fa-search-minus fa-2x');
    $('#fontChange').addClass('fa fa-search-plus fa-2x');
    $('#help-bookingPage').css('margin-left', '1050px');
    $('#header-navigation ul li').css('height', '');
    $('.log-entry-rejected').css('height', '');
    $('.log-entry-pending').css('height', '');
    $('.log-entry-accepted').css('height', '');
  }
}

function colorFunction() {
  console.log($('#main-heading').css('color'));
  if ($('#main-heading').css('color') == "rgb(250, 250, 250)") {
    $.post("updateprefs.cshtml", {prefid: "colour", prefval: "1"},
    function (JSONresult) {
      //Reserved
    }, 'json');
    $('#toggleColor').css('color', 'black');
    $('#main-heading').css('color', 'black');
    $('#lu-logo').attr('src', 'images/lu-logo-black.png');
    $('#header-navigation').css('background-color', 'white');
    $('#accessibility-options').css('color', 'black');
    $('#user-details').css('color', 'black');
    $('#fontChange').css('color', 'black');
    $('#logoutButton').css('color', 'black');
    $('#user-notifications').css('color', 'black');
    $('#header').css('background-color', 'lightgrey');
    $('body').css('background-color', 'black');
    $('body').css('background-image', 'none');
    $('.btn-blue').css('background-color', 'black');
    $('.log-group-accepted').css('background-color', 'lightgrey');
    $('.log-group-rejected').css('background-color', 'lightgrey');
    $('.log-group-pending').css('background-color', 'lightgrey');
    $('.tab-content').css('background-color', 'white');
    $('.timetable-row1-headings').css('background-color', 'white');
    $('.timetable-col1-name').css('background-color', 'white');
    $('.tab-active').css('background-color', 'white');
    $('.room-tab').css('background-color', 'white');
    $('.form-requiredWeeks-all').css('background-color', 'white');
    $('#selected-room-info').css('background-color', 'lightgrey');
    $('.log-entry-pending').css('background-color', 'white');
    $('.log-entry-rejected').css('background-color', 'white');
    $('.log-entry-accepted').css('background-color', 'white');
    $('.btn.ok').css('background-color', 'lightgrey');
    $('.btn.del').css('background-color', 'lightgrey');
  }
  else {
    $.post("updateprefs.cshtml", {prefid: "colour", prefval: "0"},
    function (JSONresult) {
      //Reserved
    }, 'json');
    $('#toggleColor').css('color', '');
    $('#main-heading').css('color', '');
    $('#lu-logo').attr('src', 'images/lu-logo-white.png');
    $('#header-navigation').css('background-color', '');
    $('#accessibility-options').css('color', '');
    $('#user-details').css('color', '');
    $('#fontChange').css('color', '');
    $('#logoutButton').css('color', '');
    $('#user-notifications').css('color', '');
    $('#header').css('background-color', '');
    $('body').css('background-color', '');
    $('body').css('background-image', '');
    $('.btn-blue').css('background-color', '');
    $('.log-group-accepted').css('background-color', '');
    $('.log-group-rejected').css('background-color', '');
    $('.log-group-pending').css('background-color', '');
    $('.tab-content').css('background-color', '');
    $('.timetable-row1-headings').css('background-color', '');
    $('.timetable-col1-name').css('background-color', '');
    $('.room-tab').css('background-color', '');
    $('.tab-active').css('background-color', '');
    $('.room-tab:not(.tab-active):hover').css('background-color', '');
    $('.form-requiredWeeks-all').css('background-color', '');
    $('#selected-room-info').css('background-color', '');
    $('.log-entry-pending').css('background-color', '');
    $('.log-entry-rejected').css('background-color', '');
    $('.log-entry-accepted').css('background-color', '');
    $('.btn.ok').css('background-color', '');
    $('.btn.del').css('background-color', '');
  }
}

/*NOTIFICATION LOAD*/
function notificationLoad() {
  console.log("notificationLoad() called");

  //Call get Post
  $.post("api.cshtml", { requestid: "getNotifications" },
  function (JSONresult) {
    var notificationList = "";
    for (var i = 0; i < JSONresult.length; i++) {
      if (JSONresult[i]['request_details'].request_status == "approved") {
        notificationList += "<div class='notification-accepted log-group-accepted'>";
      }
      else {
        notificationList += "<div class='notification-rejected log-group-rejected'>";
      }
      notificationList += JSONresult[i]['request_details'].module_code + "&nbsp;&nbsp;Room: ";
      notificationList += JSONresult[i]['request_details'].room_code + "&nbsp;&nbsp; <br/>Day: ";
      notificationList += JSONresult[i]['request_details'].request_day + "&nbsp;&nbsp; Time: ";
      notificationList += JSONresult[i]['request_details'].request_timestart + "&nbsp;&nbsp; ";
      notificationList += "Weeks: ";
      notificationList += JSONresult[i]['weeks_range'];
      notificationList += "<span class='notification-id' style='display:none;'>";
      notificationList += JSONresult[i]['request_details'].request_id + "</span></div>";
    }
    //console.log(notificationList);
    if (notificationList !== "") {
      $('#user-notification-alert').css('display', 'inline');
    }
    $('#notification-container').html(notificationList);

  }, 'json');

}

