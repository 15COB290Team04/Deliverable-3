$(document).ready(function () {
    loadLecturers();
    loadCourses();
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
                getModuleTimetable();
            }
        });

        $('#input-moduleInfo').on('change input', function () {
            getModuleTimetable();
        });
        $("#select-semester").on('change input', function () {
            getModuleTimetable();
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
});

function getRoomTimetable() {
  clearTimetable();
  var weeks = "1,2,3,4,5,6,7,8,9,10,11,12,13,14,15";
  var sem = $('#select-semester').val();
  var roomcode = $('#input-roomcode').val().substring(0, 6);

  $.post("api.cshtml", {requestid: "getRoomTimetable", roomcode: roomcode, weeks: weeks, semester: sem},
  function (JSONresult) {
    for (var i = 0; i < JSONresult.length; i++) {
      var day = JSONresult[i]['request-details'].request_day;
      var time = JSONresult[i]['request-details'].request_timestart;
      var dayneat = day.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
      //if this slot is currently clear
      if (!$('.timetable-table tbody tr[class*="' + day + '"]').find('td[class*="period' + time + '"]').hasClass("timetable-taken")) {

        $('.timetable-table tbody tr[class*="' + day + '"]').find('td[class*="period' + time + '"]').addClass("timetable-taken");

        //Multiple content should be in form: <span class='timetable-taken-text'>Booked</span><div class='timetable-content-empty'></div>
        var content = "<span class='timetable-taken-text'>Booked</span><div class='timetable-content-empty'>";

        var popContent = "<b>Information for a booked timetable slot.</b><br/>";
        popContent += "Day: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + dayneat + "<br/>";
        popContent += "Period: &nbsp;" + time + "<br/><br/>";
        popContent += "The room <b>" + JSONresult[i]['request-details'].room_code + "</b> has been booked by this module for weeks:<br/>";
        for (var j = 0; j < JSONresult[i]['weeks-range'].length; j++) {
        popContent += JSONresult[i]['weeks-range'][j] + ", ";
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

        contentStart += "<br/><br/>The room <b>" + JSONresult[i]['request-details'].room_code + "</b> has been booked by this module for weeks:<br/>";
        for (var j = 0; j < JSONresult[i]['weeks-range'].length; j++) {
          contentStart += JSONresult[i]['weeks-range'][j] + ", ";
        }

        newContent = contentStart + contentEnd;
        $('.timetable-table tbody tr[class*="' + day + '"]').find('td[class*="period' + time + '"]').html(newContent);
      }

    }

  }, 'json');
}

function clearTimetable() {

  //$('.timetable-data').text("");
  $('.timetable-data').html("<div class='timetable-content-empty'></div>");
  $('.timetable-data').removeClass("timetable-taken");

}

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
            var Lecturer = $('#input-lecturerInfo').val();
            $('#input-lecturerInfo').val(Lecturer);
        }
    });
}

function loadCourses(){
    var availableTags = [];

    $.post("api.cshtml", { requestid: "getDeptCourses" },
      function (JSONresult) {
          for (var i = 0; i < JSONresult.length; i++) {
              availableTags.push(JSONresult[i].name);
          }
      }, 'json');
    $("#input-courseInfo").autocomplete({
        source: availableTags,
        close: function () {
            var Lecturer = $('#input-courseInfo').val();
            $('#input-courseInfo').val(Lecturer);
        }
    });
}

function saveTimetable(){
    var canvas = document.getElementById("myCanvas");
    var context = canvas.getContext("2d");
    var imageObj = new Image();
    var correctContents = "";
    $('.timetable-taken').each(function () {

        var contents = $(this).find('.timetable-content-empty').html();
        //get the details for the day of the week
        var dayTitleInfo = contents.substring(51, 56);
        var dayNameInfo = contents.substring(92, (contents.indexOf("<br>", 92)));
        //get the deatails of the Period
        var periodTitleInfo = contents.substring(contents.indexOf("Period"), (contents.indexOf("Period") + 8));
        var periodTimeInfo = contents.substring((contents.indexOf("Period") + 14), (contents.indexOf("<br>", (contents.indexOf("Period") + 8))));
        //get the details of the module
        var moduleTitleInfo = contents.substring(contents.indexOf("The module"), (contents.indexOf("The module") + 11));
        var moduleNameInfo = contents.substring((contents.indexOf("The module") + 14), (contents.indexOf("</b>", (contents.indexOf("The module") + 14)))); ;
        //get the length of the booking 
        var bookingTitleInfo = contents.substring(contents.indexOf(" has"), (contents.indexOf(" has") + 32));
        var bookingLengthInfo = contents.substring((contents.indexOf(" has") + 36), (contents.indexOf("<p>", (contents.indexOf(" has") + 36))));
        //concenate the data
        var correctContents = dayTitleInfo + dayNameInfo + "\n" + periodTitleInfo + periodTimeInfo + "\n" + moduleTitleInfo + moduleNameInfo + "\n" + "It" + bookingTitleInfo + " " + bookingLengthInfo;

        console.log(correctContents);

        return correctContents;
    });

        context.drawImage(imageObj, 10, 10);
        context.font = "20px Calibri";
        context.fillText(correctContents, 10, 40);

        var win = window.open();
        win.document.write("<img src='" + canvas.toDataURL() + "'/>");
    
    imageObj.src = "mail-image.jpg"; 
}

