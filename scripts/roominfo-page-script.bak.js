/*
 Loughborough University (February 2016)
 
 Timetabling Website
 Roominfo page's script file (includes jQuery)
 Used for scripts on the room information page ONLY
 */

$(document).ready(function () {
  //SPECIAL REQUIREMENT SELECTION
  $('.spe_list li span').click(function () {
    //var requirement = $(this).attr('id');
    $(this).toggleClass('list-activeFacility');
    getSuitableRooms();
  });


});

//GET SUITABLE ROOMS
function getSuitableRooms() {
  console.log("getSuitableRooms() called");
  var park = "Any";	//perform a test for Any selected
  var capacity = 0
  var buildingcode = "Any";
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

  $.post("https://co-project.lboro.ac.uk/crew12/Deliverable%202/api.php", {
    requestid: "getSuitableRooms", park: park, capacity: capacity, buildingcode: buildingcode, lab: lab, wheelchair: wheelchair,
    hearingloop: hearingloop, computer: computer, projector: projector, dprojector: dprojector, ohp: ohp, visualiser: visualiser, video: dvd,
    bluray: bluray, vhs: vhs, whiteboard: whiteboard, chalkboard: chalkboard, plasma: plasma, pasystem: pasystem, radiomic: radiomic, review: review
  },
  function (JSONresult) {
    JSONresult = JSON.parse($($.parseHTML(JSONresult)).filter("#json").html());

    var roomList = "";
    for (var j = 0; j < JSONresult.length; j++) {
      roomList += "<option>" + JSONresult[j].room_code + "</option>";
    }
    $('#form-numRooms').html("(" + JSONresult.length + ")");
    $("#form-roomSelection").html(roomList);

  }, 'html');

}