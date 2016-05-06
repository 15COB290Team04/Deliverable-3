/*
 Loughborough University (February 2016)
 
 Timetabling Website
 Allocations page's script file (includes jQuery)
 Used for scripts on the allocations page ONLY
 */

$(document).ready(function () {

  loadRoomCodeChoices();
  getSubmissionLog();

  //ROOM SELECTION LOADS TIMETABLE
  $('#form-booking-roomCode').on("input", function () {
    loadRoomCodeChoices();
  });

  //SEM VALYE FOR LOG
  $('#semester-choice').change(function () {
    getSubmissionLog();
  });

  //TIMETABLE FUNCTIONS
  $(".timetable-data").click(function () {

    if ($(this).hasClass("timetable-taken")) {	//if it IS a taken/booked slot
      $('.pop').html($(this).find('.timetable-content-empty').html());
      $('.pop').fadeToggle();
    }

  });

  //SUBMISSION LOG SLIDER
  $(document).on('click', '.log-group', function () {
    //$(".log-group").click(function(){
    $(this).siblings(".log-contents-container").slideToggle("slow");
    $(this).find('.log-icon').children().toggleClass("fa-angle-double-down fa-angle-double-up");
  });

  $(document).on('click', '.close', function () { //essential to make dynamically inserted html elements have the click handler
    //$('.close').on('click', function() {
    $('.pop').fadeToggle();
    $('.pop').delay(1000).html("<b>Information for a booked timetable slot.</b><br/><br/><br/><br/><br/><p></p><p class='close'>Close</p>");
  });

  //YOUR SUBMISSIONS TAB CLICKS
  $(".submissions-tab").on("click", function () {
    var prevActiveId = $(this).parent().find('.tab-active').attr('id');
    $('#' + prevActiveId).removeClass('tab-active');

    $(this).addClass('tab-active');

    prevActiveId = prevActiveId.substr(prevActiveId.indexOf("-") + 1);
    $('#yoursubs-' + prevActiveId).removeClass('yoursubs-show');
    $('#yoursubs-' + prevActiveId).addClass('yoursubs-hidden');


    var id = $(this).attr('id');
    id = id.substr(id.indexOf("-") + 1);
    $('#yoursubs-' + id).removeClass('yoursubs-hidden');
    $('#yoursubs-' + id).addClass('yoursubs-show');
  });

  //SUBMISSION LOG SLIDER
  $(".log-group").click(function () {
    $(this).siblings(".log-contents-container").slideToggle("slow");
    $(this).find(".log-icon i").toggleClass("fa-angle-double-down fa-angle-double-up");
  });

  //FILTER FOR APPROVED BLOCKS
  $("#filter-approved").click(function () {
    //filterSubmissionLog(0, null); //0:clear
    filterSubmissionLog(1, "approved"); //1: state -> approved
  });

  //FILTER FOR PENDING BLOCKS
  $("#filter-pending").click(function () {
    //filterSubmissionLog(0); //0:clear
    filterSubmissionLog(1, "pending"); //1: state -> pending
  });

  //FILTER FOR REJECTED BLOCKS
  $("#filter-rejected").click(function () {
    //filterSubmissionLog(0); //0:clear
    filterSubmissionLog(1, "rejected"); //1: state -> rejected
  });

  //CLEAR FIlTER
  $("#filter-clear").click(function () {
    filterSubmissionLog(0); //0:clear
  });

  $(document).on('click', '.log-entry-delete-icon', function () {
    var idList = "";

    if (!$(this).hasClass('log-icon-unused')) {

      var r = confirm("Are you sure you wish to cancel this request?");
      if (r) {

        var thisReqId = $(this).parent().next().find('.log-entry-id').text();
        idList += thisReqId;

        var childReqId = $(this).parent().next().find('.log-entry-child').text();
        console.log("THIS: " + thisReqId + ", CHILD: " + childReqId);

        while (childReqId != "null") {
          idList += "," + childReqId;
          var child = $(".log-entry-id").filter(function () { return ($(this).text() === childReqId) });
          childReqId = child.next('.log-entry-child').text();
        }

        //Returns list of requestid's in form "30,31,32,33"
        console.log(idList);

        cancelRequest(idList);
      }
    }
    else {
      console.log("You cant cancel a rejected request!");
    }
  });

});



  //AUTOFILL SEARCH FOR ROOM CODE SELECTION
  function loadRoomCodeChoices() {
    console.log("loadRoomCodeChoices called");
    $(function () {
      $.post("api.cshtml", {
        requestid: "getSuitableRooms", private: "Any", park: "Any", capacity: 0, buildingcode: "Any", lab: 0, wheelchair: 0, hearingloop: 0, computer: 0, projector: 0, dprojector: 0, ohp: 0, visualiser: 0, video: 0, bluray: 0, vhs: 0, whiteboard: 0, chalkboard: 0, plasma: 0, pasystem: 0, radiomic: 0, review: 0
      },
      function (JSONresult) {
        var roomList = [];
        for (var j = 0; j < JSONresult.length; j++) {
          roomList.push(JSONresult[j].room_code);
        }

        $("#form-booking-roomCode").autocomplete({
          source: roomList,
          close: function () {
            //alert("roomcode changed. "+$("#form-booking-roomCode").val());
            filterSubmissionLog(2, $("#form-booking-roomCode").val()); //2: room -> room name
          }
        });

      }, 'json');
    });
  }

function getRoomTimetable() {

  clearTimetable();

  if (true) {	//if the selected room is valid

    console.log("getRoomTimetable() called");

    var weeks = "1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,";

    if (weeks.length > 0) {
      weeks = weeks.substr(0, weeks.length - 1);

      var sem = $('#select-semester').val();

      console.log("Semester: " + sem + "  Weeks: " + weeks + "  RoomCode: " + $('#form-booking-roomCode').val());

      //Perform API call to retrieve timetable bookings for times and weeks
      $.post("api.cshtml", { requestid: "getRoomTimetable", roomcode: $('#form-booking-roomCode').val(), weeks: weeks, semester: sem },
      function (JSONresult) {

        //console.log( JSONresult[i]['request_details'].request_day );  or request_timestart, request_round, module_code, request_priority (null or string)
        //console.log( JSONresult[i]['weeks_list'][j].week_number );
        //console.log( JSONresult[i]['weeks_range'][j]);
        //console.log( JSONresult[i]['weeks_range'].length );

        for (var i = 0; i < JSONresult.length; i++) {
          var day = JSONresult[i]['request_details'].request_day;
          var dayneat = day.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
          var time = JSONresult[i]['request_details'].request_timestart;

          //if this slot is currently clear
          if (!$('.timetable-table tbody tr[class*="' + day + '"]').find('td[class*="period' + time + '"]').hasClass("timetable-taken")) {

            $('.timetable-table tbody tr[class*="' + day + '"]').find('td[class*="period' + time + '"]').addClass("timetable-taken");

            //Multiple content should be in form: <span class='timetable-taken-text'>Booked</span><div class='timetable-content-empty'></div>
            var content = "<span class='timetable-taken-text'>Booked</span><div class='timetable-content-empty'>";

            var popContent = "<b>Information for a booked timetable slot.</b><br/>";
            popContent += "Day: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + dayneat + "<br/>";
            popContent += "Period: &nbsp;" + time + "<br/><br/>";
            popContent += "The module <b>" + JSONresult[i]['request_details'].module_code + "</b> has booked this slot for weeks:<br/>";
            popContent += JSONresult[i]['weeks_range'];
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

        $('#allocations-selectedRoom').text($('#form-booking-roomCode').val());

      }, 'json');

    }

  }

}

//erases content of current timetable
function clearTimetable() {

  //$('.timetable-data').text("");
  $('.timetable-data').html("<div class='timetable-content-empty'></div>");
  $('.timetable-data').removeClass("timetable-taken");

}

function getSubmissionLog() {
  console.log("getSubmissionLog() called");

  //SELECT YEAR/SEM CHOICE
  //Sem 1 - 2013/14
  var inp = $('#semester-choice').val();
  var sem = inp.substr(4, 1);
  var year = inp.substr(8, 4);

  //call api.cshtml with semester to return the submission log entries (pending this round, rejected previous rounds)
  $.post("api.cshtml", {requestid: "getRoomLogsAllocation", semester: sem, year: year},
  function (JSONresult) {
    //JSONresult =  JSON.parse($($.parseHTML(JSONresult)).filter("#json").html());

    //console.log( JSONresult[i]['request_details'].request_day );  or request_timestart, request_round, module_code, request_priority (null or string)
    //console.log( JSONresult[i]['weeks_list'][j].week_number );
    //console.log( JSONresult[i]['weeks_range'][j]);
    //console.log( JSONresult[i]['weeks_range'].length );

    var logContent = "";
    var currentModules = [];	//list of modules currently grouped into submission log
    var exclusionIndices = [];
    var logEntryAdditions = []; //Array in form ["module_code---Div contents..."] to add to existing logs

    for (var i = 0; i < JSONresult.length; i++) { //for each result in the return	
      console.log(i);
      var skip = false;	//skip flag variable		
      for (var idx = 0; idx < exclusionIndices.length; idx++) {
        if (exclusionIndices[idx] == i) {
          skip = true;	//if the current log is in the exclusion array then skip
        }
      }

      if (skip) {
        console.log("Skipped adding new log-entry (Linked child in Exclusion array)"); //ie. it was previously added onto other request as a linked child
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
          console.log("Created new log-group for " + JSONresult[i]['request_details'].module_code);
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
        currentContent += '<span class="log-entry-round">Round: ' + JSONresult[i]['request_details'].request_round.toUpperCase() + '</span>';
        currentContent += '</div>';

        currentContent += '</div>';

        //If log entry has child requests (ie. linked bookings)
        if (JSONresult[i]['request_details'].request_child !== null) {

          var req_child = JSONresult[i]['request_details'].request_child;
          console.log("Booking has a child request of id:" + req_child);

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
                console.log("Booking has a child request of id:" + req_child2);

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
          console.log("Loaded new " + JSONresult[i]['request_details'].module_code + " entry into existing log-group");
          logEntryAdditions.push(JSONresult[i]['request_details'].module_code + "---" + currentContent);
        }
      }

    }

    $('#yoursubs-roundPriority').html(logContent);

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

    //Loop through each log-group, set the 'log-group-pending/rejected/approved' class
    $('.log-group').each(function () {

      var rejected = false;
      var pending = false;

      $(this).next().children('div').each(function () {
        if ($(this).hasClass('log-entry-rejected')) {
          rejected = true;
        }
        if ($(this).hasClass('log-entry-pending')) {
          pending = true;
        }
      });

      //remove existing colour classes
      $(this).removeClass('log-group-pending');
      $(this).removeClass('log-group-approved');
      $(this).removeClass('log-group-rejected');

      if (rejected) {	//add REJECTED if necessary
        $(this).addClass('log-group-rejected');
        $(this).find('.log-status').text("Rejected");
      }
      else {	//otherwise add PENDING or APPROVED
        if (pending) {
          $(this).addClass('log-group-pending');
          $(this).find('.log-status').text("Pending");
        }
        else {
          $(this).addClass('log-group-approved');
          $(this).find('.log-status').text("Approved");
        }
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
						$(this).find('.log-entry-round').text("");
					}
				});
			}
		});

  }, 'json');
}

function filterSubmissionLog(choice, data) {
  switch (choice) {
    case 0: //clear filter
      $("#form-booking-roomCode").val("");
      $(".log-group-container").each(function (index, element) {
        $(element).css("display", "block");
        $(element).find(".log-contents-container").first().children().each(function (i, e) {
          $(e).css("display", "block");
        });
      });
      break;
    case 1: //filter by state
      findString = "";
      switch (data) {
        case "approved":
          groupString = ".log-group-approved";
          entryString = "log-entry-approved";
          break;
        case "pending":
          groupString = ".log-group-pending";
          entryString = "log-entry-pending";
          break;
        case "rejected":
          groupString = ".log-group-rejected";
          entryString = "log-entry-rejected";
          break;
        default:
          alert("there is a problem with the filter data value, please alert dev team")
          break;
      }
      $(".log-group-container").each(function (index, element) {
        if (!($(element).find(groupString).length > 0)) { //Hide blocks not containing relevant items
          $(element).css("display", "none");
        } else {
          $(element).find(".log-contents-container").first().children().each(function (i, e) {
            if (!($(e).hasClass(entryString))) {
              $(e).css("display", "none");
            }
          });
        }
      });
      break;
    case 2: //filter by room
      roomString = data;
      $(".log-group-container").each(function (gindex, gelement) {
        $(gelement).find(".log-contents-container").first().children().each(function (cindex, celement) {
          if (!($(celement).find(".log-entry-information").first().find(".log-entry-room").first().text().indexOf(roomString) >= 0)) {
            $(celement).css("display", "none");
            $(gelement).css("display", "none");
          }
        });
      });
      break;
    default:
      alert("There has been a problem with the filter id, please alert development team");
  }
}

function cancelRequest(idList) { 
  $.post("api.cshtml", { requestid: "setCancelRequest", idlist: idList },
  function (JSONresult) {
    getSubmissionLog();
  }, 'json');
}