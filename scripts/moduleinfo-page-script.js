$(document).ready(function () {
  loadLecturers();
  loadCourses();

  var headerImg = new Image(); 
  headerImg.src = "Images/timetable-download-header.png";

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
      getTimetable();
    }
  });
}

//FUNCTION TO SAVE TIMETABLE INTO IMAGE
function saveTimetable(){

  //find canvas & get context  
  var canvas = document.getElementById('myCanvas');
  var context = canvas.getContext('2d');

  canvas.width = 400;
  canvas.height = 1000;

  //Fill canvas background white
  context.beginPath();
  context.rect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "white";
  context.fill();

  //Give header to timetable
  context.drawImage(headerImg,0,0);

  //Create title of timetable
  context.font = 'bold 14pt Calibri';
  context.fillStyle = '#333';
  var type = $("#timetable-note-type").text().toUpperCase() + " TIMETABLE";
  var title = $('#timetable-note-value').text();
  context.fillText(type, 30, 80);
  context.font = 'bold 13pt Calibri';
  context.fillText(title, 30, 110);

  //Return to default font
  context.font = '12pt Calibri';

  var finalContents = "";
  var currentPos = 150;

  $('.timetable-taken').each(function () {
    var contents = $(this).find('.timetable-content-empty').html();
    var correctContents = "";

    //get the details for the day of the week
    var dayTitleInfo = contents.substring(51, 55);
    var dayNameInfo = contents.substring(92, (contents.indexOf("<br>", 92)));

    context.font = 'bold 12pt Calibri';
    context.fillText(dayNameInfo, 30, currentPos);
    currentPos += 30;
    context.font = '12pt Calibri';

    //period
    var period = contents.substr(contents.indexOf("Period: &nbsp;") + 14, 1);

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
      roomCode2 = string.substring((string.indexOf("<b>", 5) + 3), (string.indexOf("</b>", (string.indexOf("<b>", 5))))); ;
      moduleCode2 = string.substring((string.indexOf("<b>", 50) + 3), (string.indexOf("</b>", (string.indexOf("<b>", 50)))));
      //var bookingLengthInfo2 = string.substring((string.indexOf("weeks:", 15) + 10), (string.indexOf("<p>")));
      var temp = string.substring(30);
      temp = temp.substring(temp.indexOf('<br>') + 4);
      bookingLengthInfo2 = temp.substring(0, temp.indexOf('<br>'));
      //console.log(bookingLengthInfo2);
    }

    //Tertiary variables for storing multiple bookings
    var roomCode3 = "";
    var moduleCode3 = "";
    var bookingLengthInfo3 = "";

    var count = (contents.match(/The room/g) || []).length;
    if (count == 3) {
      var newString = contents.substring(contents.lastIndexOf('The room'));
      //console.log(newString);
      newString = newString.substring(newString.indexOf('<b>') + 3);
      roomCode3 = newString.substring(0, newString.indexOf('</b>'));
      newString = newString.substring(newString.indexOf('<b>') + 3);
      moduleCode3 = newString.substring(0, newString.indexOf('</b>'));
      newString = newString.substring(newString.indexOf('<br>') + 4);
      bookingLengthInfo3 = newString.substring(0, newString.indexOf('<p>'));
      //console.log(roomCode3 + " " + moduleCode3 + " " + bookingLengthInfo3);
    }

    //Print period
    context.font = 'bold 12pt Calibri';
    context.fillText("Period: " + period, 50, currentPos);
    currentPos += 30;
    context.font = '12pt Calibri';

    //Print first module info
    context.fillText("Module: " + moduleCode1, 70, currentPos);
    currentPos += 20;
    context.fillText("Room: " + roomCode1, 70, currentPos);
    currentPos += 20;
    context.fillText("Weeks: " + bookingLengthInfo, 70, currentPos);
    currentPos += 30;

    if (count >= 2) {
      //Print second module info
      context.fillText("Module: " + moduleCode2, 70, currentPos);
      currentPos += 20;
      context.fillText("Room: " + roomCode2, 70, currentPos);
      currentPos += 20;
      context.fillText("Weeks: " + bookingLengthInfo2, 70, currentPos);
      currentPos += 30;
    }

    if (count >= 3) {
      //Print third module info
      context.fillText("Module: " + moduleCode3, 70, currentPos);
      currentPos += 20;
      context.fillText("Room: " + roomCode3, 70, currentPos);
      currentPos += 20;
      context.fillText("Weeks: " + bookingLengthInfo3, 70, currentPos);
      currentPos += 30;
    }
  });

  var file = canvas.toDataURL("image/png;base64");
  var filename = $('#timetable-note-type').text() + "-timetable-" + $('#timetable-note-value').text() + ".png";
  saveAs(file, filename);

  context.clearRect(0, 0, canvas.width, canvas.height);
}

function saveAs(uri, filename) {
  var link = document.createElement('a');
  if (typeof link.download === 'string') {
    link.href = uri;
    link.download = filename;

    //Firefox requires the link to be in the body
    document.body.appendChild(link);
    
    //simulate click
    link.click();
    

    //remove the link when done
    document.body.removeChild(link);
  } else {
    window.open(uri);
  }
}