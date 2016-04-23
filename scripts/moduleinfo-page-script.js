/*
 Loughborough University (February 2016)
 
 Timetabling Website
 Moduleinfo page's script file (includes jQuery)
 Used for scripts on the module information page ONLY
 */

$(document).ready(function () {

  //AUTOFILL SEARCH FOR MODULE TITLE
  $(function () {
    var availableTags = [];

    //getDeptModuleList with deptCode = "CO" returns all modules with CO at start of code, in form "COB106 AI Methods"
    $.post("api.cshtml", {requestid: "getDeptModuleList"},
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
      //if this slot is currently clear
      if (!$('.timetable-table tbody tr[class*="' + day + '"]').find('td[class*="period' + time + '"]').hasClass("timetable-taken")) {

        $('.timetable-table tbody tr[class*="' + day + '"]').find('td[class*="period' + time + '"]').addClass("timetable-taken");

        //Multiple content should be in form: <span class='timetable-taken-text'>Booked</span><div class='timetable-content-empty'></div>
        var content = "<span class='timetable-taken-text'>Booked</span><div class='timetable-content-empty'>";

        var popContent = "<b>Information for a booked timetable slot.</b><br/>";
        popContent += "Day: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + day + "<br/>";
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

function clearTimetable() {

  //$('.timetable-data').text("");
  $('.timetable-data').html("<div class='timetable-content-empty'></div>");
  $('.timetable-data').removeClass("timetable-taken");

}
