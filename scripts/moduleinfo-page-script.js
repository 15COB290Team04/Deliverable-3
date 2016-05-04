$(document).ready(function () {
  loadLecturers();
  loadCourses();

  $('.radio-views').click(function () {
    $('.radio-checks').each(function () {
      $(this).prop("checked", false);
    });
    $(this).find('.radio-checks').prop("checked", true);
    var type = $(this).find('.radio-checks').attr("value");
    $('#timetable-note-type').text(type);
    getTimetable();
  });

  //AUTOFILL SEARCH FOR MODULE TITLE
  $(function () {
    var availableTags = [];

    //getDeptModuleList with deptCode = "CO" returns all modules with CO at start of code, in form "COB106 AI Methods"
    $.post("api.cshtml", { requestid: "getDeptModuleList" },
    function (JSONresult) {
      for (var i = 0; i < JSONresult.length; i++) {
        availableTags.push(JSONresult[i].module_code + " " + JSONresult[i].module_title);
      }
    }, 'json');

    $("#input-moduleInfo").autocomplete({
      source: availableTags,
      close: function () {
        getTimetable();
      }
    });
  });

  $('#input-moduleInfo').on('change input', function () {
    //getTimetable();
  });
  $("#select-semester").on('change', function () {
    getTimetable();
  });

  //DOWNLOAD BUTTON
  $('#download-button-text').click(function () {
    saveTimetable();
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

//FUNCTION TO GET ONE OF THE 3 TIMETABLES
function getTimetable() {
  clearTimetable();
  var weeks = "1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16";
  var sem = $('#select-semester').val();

  var type = $('#timetable-note-type').text();

  if (type == "module") {
    var val = $('#input-moduleInfo').val();
    if (val.length < 3) {
      val = "nothing selected";
    }
    else {
      $('#timetable-note-value').text(val);
    }
  }
  else if (type == "lecturer") {
    var val = $('#input-lecturerInfo').val();
    if (val.length < 3) {
      val = "nothing selected";
    }
    $('#timetable-note-value').text(val);
  }
  else if (type == "course") {
    var val = $('#input-courseInfo').val();
    if (val.length < 3) {
      val = "nothing selected";
    }
    $('#timetable-note-value').text(val);
  }

  if (type == "module") {
    var modulecode = $('#input-moduleInfo').val();
    modulecode = modulecode.substring(0, modulecode.indexOf(' '));

    $.post("api.cshtml", {requestid: "getModuleTimetable", modulecode: modulecode, weeks: weeks, semester: sem},
    function (JSONresult) {
      for (var i = 0; i < JSONresult.length; i++) {
        var day = JSONresult[i]['request_details'].request_day;
        var time = JSONresult[i]['request_details'].request_timestart;
        var dayneat = day.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });

        //if this slot is currently clear
        if (!$('.timetable-table tbody tr[class*="' + day + '"]').find('td[class*="period' + time + '"]').hasClass("timetable-taken")) {

          $('.timetable-table tbody tr[class*="' + day + '"]').find('td[class*="period' + time + '"]').addClass("timetable-taken");

          //Multiple content should be in form: <span class='timetable-taken-text'>Booked</span><div class='timetable-content-empty'></div>
          var content = "<span class='timetable-taken-text'>Booked</span><div class='timetable-content-empty'>";

          var popContent = "<b>Information for a booked timetable slot.</b><br/>";
          popContent += "Day: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + dayneat + "<br/>";
          popContent += "Period: &nbsp;" + time + "<br/><br/>";
          popContent += "The room <b>" + JSONresult[i]['request_details'].room_code + "</b> has been booked by the module <b>"+modulecode+"</b> for weeks:<br/>";
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

          contentStart += "<br/><br/>The room <b>" + JSONresult[i]['request_details'].room_code + "</b> has been booked by the module <b>"+modulecode+"</b> for weeks:<br/>";
          contentStart += JSONresult[i]['weeks_range'];

          newContent = contentStart + contentEnd;
          $('.timetable-table tbody tr[class*="' + day + '"]').find('td[class*="period' + time + '"]').html(newContent);
        }
      }
    }, 'json'); 
  }
  else if (type == "lecturer") {
    var lecname = $('#input-lecturerInfo').val();

    $.post("api.cshtml", {requestid: "getLecturerTimetable", lecturer: lecname, weeks: weeks, semester: sem},
    function (JSONresult) {
      for (var i = 0; i < JSONresult.length; i++) {
        var day = JSONresult[i]['request_details'].request_day;
        var time = JSONresult[i]['request_details'].request_timestart;
        var dayneat = day.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });

        //if this slot is currently clear
        if (!$('.timetable-table tbody tr[class*="' + day + '"]').find('td[class*="period' + time + '"]').hasClass("timetable-taken")) {

          $('.timetable-table tbody tr[class*="' + day + '"]').find('td[class*="period' + time + '"]').addClass("timetable-taken");

          //Multiple content should be in form: <span class='timetable-taken-text'>Booked</span><div class='timetable-content-empty'></div>
          var content = "<span class='timetable-taken-text'>Booked</span><div class='timetable-content-empty'>";

          var popContent = "<b>Information for a booked timetable slot.</b><br/>";
          popContent += "Day: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + dayneat + "<br/>";
          popContent += "Period: &nbsp;" + time + "<br/><br/>";
          popContent += "The room <b>" + JSONresult[i]['request_details'].room_code + "</b> has been booked by the module <b>"+JSONresult[i]['request_details'].module_code+"</b> for weeks:<br/>";
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

          contentStart += "<br/><br/>The room <b>" + JSONresult[i]['request_details'].room_code + "</b> has been booked by the module <b>"+JSONresult[i]['request_details'].module_code+"</b> for weeks:<br/>";
          contentStart += JSONresult[i]['weeks_range'];

          newContent = contentStart + contentEnd;
          $('.timetable-table tbody tr[class*="' + day + '"]').find('td[class*="period' + time + '"]').html(newContent);
        }
      }
    }, 'json'); 
  }
  else if (type == "course") {
    var course = $('#input-courseInfo').val();

    $.post("api.cshtml", {requestid: "getCourseTimetable", course:course, weeks: weeks, semester: sem},
    function (JSONresult) {
      for (var i = 0; i < JSONresult.length; i++) {
        var day = JSONresult[i]['request_details'].request_day;
        var time = JSONresult[i]['request_details'].request_timestart;
        var dayneat = day.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });

        //if this slot is currently clear
        if (!$('.timetable-table tbody tr[class*="' + day + '"]').find('td[class*="period' + time + '"]').hasClass("timetable-taken")) {

          $('.timetable-table tbody tr[class*="' + day + '"]').find('td[class*="period' + time + '"]').addClass("timetable-taken");

          //Multiple content should be in form: <span class='timetable-taken-text'>Booked</span><div class='timetable-content-empty'></div>
          var content = "<span class='timetable-taken-text'>Booked</span><div class='timetable-content-empty'>";

          var popContent = "<b>Information for a booked timetable slot.</b><br/>";
          popContent += "Day: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + dayneat + "<br/>";
          popContent += "Period: &nbsp;" + time + "<br/><br/>";
          popContent += "The room <b>" + JSONresult[i]['request_details'].room_code + "</b> has been booked by the module <b>"+JSONresult[i]['request_details'].module_code+"</b> for weeks:<br/>";
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

          contentStart += "<br/><br/>The room <b>" + JSONresult[i]['request_details'].room_code + "</b> has been booked by the module <b>"+JSONresult[i]['request_details'].module_code+"</b> for weeks:<br/>";
          contentStart += JSONresult[i]['weeks_range'];

          newContent = contentStart + contentEnd;
          $('.timetable-table tbody tr[class*="' + day + '"]').find('td[class*="period' + time + '"]').html(newContent);
        }
      }
    }, 'json'); 
  }
}

//FUNCTION TO CLEAR TIMETABLE
function clearTimetable() {
  //$('.timetable-data').text("");
  $('.timetable-data').html("<div class='timetable-content-empty'></div>");
  $('.timetable-data').removeClass("timetable-taken");
}

//FUNCTION TO LOAD LECTURER NAMES INTO UI
function loadLecturers() {
  var availableTags = [];

  $.post("api.cshtml", { requestid: "getDeptLecturers" },
    function (JSONresult) {
        for (var i = 0; i < JSONresult.length; i++) {
            availableTags.push(JSONresult[i].name);
        }
    }, 'json');
  $("#input-lecturerInfo").autocomplete({
    source: availableTags,
    close: function () {
      getTimetable();
    }
  });
}

//FUNCTION TO LOAD COURSES INTO UI
function loadCourses(){
    var availableTags = [];

    $.post("api.cshtml", { requestid: "getDeptCourses" },
      function (JSONresult) {
          for (var i = 0; i < JSONresult.length; i++) {
              availableTags.push(JSONresult[i].course_name);
          }
      }, 'json');
    $("#input-courseInfo").autocomplete({
        source: availableTags,
        close: function () {
            var Lecturer = $('#input-courseInfo').val();
            $('#input-courseInfo').val(Lecturer);
        }
    });
  var availableTags = [];

  $.post("api.cshtml", { requestid: "getDeptCourses" },
    function (JSONresult) {
      for (var i = 0; i < JSONresult.length; i++) {
        availableTags.push(JSONresult[i].course_name);
      }
    }, 'json');
  $("#input-courseInfo").autocomplete({
    source: availableTags,
    close: function () {
      getTimetable();
    }
  });
}

//FUNCTION TO SAVE TIMETABLE INTO IMAGE
function saveTimetable(){
    //var canvas = document.getElementById("myCanvas");
    //var context = canvas.getContext("2d");
    var finalContents = "";

        $('.timetable-taken').each(function () {
        var contents = $(this).find('.timetable-content-empty').html();
        var correctContents = "";
        //Sort out the double day booking example need to split the return values up some how


        //get the details for the day of the week
        var dayTitleInfo = contents.substring(51, 56);
        var dayNameInfo = contents.substring(92, (contents.indexOf("<br>", 92)));
        //get the length of the booking 
        var bookingLengthInfo = contents.substring((contents.indexOf("weeks") + 10), (contents.indexOf("<", (contents.indexOf("weeks") + 10))));
        //the room and module codes using the bold tags they have
        var roomCode1 = contents.substring((contents.indexOf("<b>", 5) + 3), (contents.indexOf("</b>", (contents.indexOf("<b>", 5)))));
        var moduleCode1 = contents.substring((contents.indexOf("<b>", 138) + 3), (contents.indexOf("</b>", (contents.indexOf("<b>", 138)))));
        //Secondary variables for storing if there are multiple bookings        
        var roomCode2 = "";
        var moduleCode2 = "";
        var bookingLengthInfo2 = "";

        var string = contents.substring((contents.indexOf("</b>", (contents.indexOf("<b>", 138)))), contents.length);
        if (string.indexOf('<b>') > 0) {

            var roomCode2 = string.substring((string.indexOf("<b>", 5) + 3), (string.indexOf("</b>", (string.indexOf("<b>", 5))))); ;
            var moduleCode2 = string.substring((string.indexOf("<b>", 50) + 3), (string.indexOf("</b>", (string.indexOf("<b>", 50)))));
            var bookingLengthInfo2 = string.substring((string.indexOf("weeks:", 15) + 10), (string.indexOf("<p>")));
        }
        //write the text that will be printed based on the variablesin the code
        if (roomCode2 == "" && moduleCode2 == "" && bookingLengthInfo2 == "") {
            finalContents += dayTitleInfo + " " + dayNameInfo + ": " + "\n" + "\n" + "The room " + roomCode1 + " is booked by " + moduleCode1 + ": " + "\n" + "On the weeks " + bookingLengthInfo + "\n" + ": ";
        } else {
            finalContents += dayTitleInfo + " " + dayNameInfo + ": " + "\n" + "\n" + "The room  " + roomCode1 + " is booked by " + moduleCode1 + ": " + "\n" + "On the weeks " + bookingLengthInfo + "\n" + "\n" + ": " + "The room " + roomCode2 + " is booked by  " + moduleCode2 + ": " + "\n" + "On the weeks " + bookingLengthInfo2 + "\n" + ": ";
        }

        //console.log(correctContents);

        //finalContents += correctContents;
        return finalContents;
    });
    
        var canvas = document.getElementById('myCanvas');
        var context = canvas.getContext('2d');
        var maxWidth = 100;
        var lineHeight = 25;
        var x = (canvas.width - maxWidth) / 2;
        var y = 60;
        var text = finalContents;

        context.font = '10pt Calibri';
        context.fillStyle = '#333';

        wrapText(context, text, x, y, maxWidth, lineHeight);
                
        var win = window.open();
        win.document.write("<img src='" + canvas.toDataURL() + "'/>");
    //imageObj.src = "mail-image.jpg"; 
}

function wrapText(context, text, x, y, maxWidth, lineHeight) {
        var words = text.split(/\: /);
        var line = '';

        for(var n = 0; n < words.length; n++) {
          var testLine = line + words[n] + ' ';
          var metrics = context.measureText(testLine);
          var testWidth = metrics.width;
          if (testWidth > maxWidth && n > 0) {
            context.fillText(line, x, y);
            line = words[n] + ' ';
            y += lineHeight;
          }
          else {
            line = testLine;
          }
        }
        context.fillText(line, x, y);
 }
