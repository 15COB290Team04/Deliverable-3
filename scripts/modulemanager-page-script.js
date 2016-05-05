/*
 Loughborough University (February 2016)
 
 Timetabling Website
 Modulemanager page's script file (includes jQuery)
 Used for scripts on the module manager page ONLY
 */
var modSelList = [];

$(document).ready(function () {
  //AUTOFILL SEARCH FOR MODULE TITLE
  loadModules();
  //AUTOFILL SEARCH FOR MODULE LECTURERS
  loadLecturers();
  $('#input-moduleInfo').change(function () {
    var modCode = $('#input-moduleInfo').val().substring(0, $('#input-moduleInfo').val().indexOf(' '));
    $('#modupd-code').val(modCode);
    console.log(modCode);
    var modTitle = $('#input-moduleInfo').val().substring($('#input-moduleInfo').val().indexOf(' ') + 1);
    $('#modupd-title').val(modTitle);
    console.log(modTitle);
    $.post("api.cshtml", { requestid: "getModuleLecturers", modulecode: modCode },
      function (JSONresult) {
        for (var i = 0; i < JSONresult.length; i++) {
          if (i == 0) { $("#lecturer1-upd").val(JSONresult[i].name); }
          else if (i == 1) { $("#lecturer2-upd").val(JSONresult[i].name); }
          else if (i == 2) { $("#lecturer3-upd").val(JSONresult[i].name); }
          else if (i == 3) { $("#lecturer4-upd").val(JSONresult[i].name); }
        }

      }, 'json');
  });
  $("#create-mod").click(function () {
    addMod();
  });
  $("#del-mod").click(function () {
    var r = confirm("Are you sure you wish to delete the selected Module?\n\nThis action cannot be undone.");
    if (r == true) {
      var modulecode = $('#input-moduleInfo').val();
      modulecode = modulecode.substring(0, modulecode.indexOf(' '));

      $.post("api.cshtml", { requestid: "setDeleteModule", modulecode: modulecode },
      function (JSONresult) {
        if (JSONresult) {
          $('#input-moduleInfo').val("");
          $("#modupd-code").val("");
          $("#modupd-title").val("");
          $("#lecturer1-upd").val("");
          $("#lecturer2-upd").val(""); 
          $("#lecturer3-upd").val("");
          $("#lecturer4-upd").val("");
          alert("Module Deleted.");
          loadModules();
        } else {
          alert("Error. Operation FAILED!");
          loadModules();
        }
      }, 'json');
    }
    return false;
  });
  $("#update-mod").click(function () {
    var r = confirm("Are you sure you wish to update the selected Module with the new details?\n\nThis action cannot be undone.");
    if (r == true) {
      var modulecode = $('#input-moduleInfo').val();
      modulecode = modulecode.substring(0, modulecode.indexOf(' '));
      var deptcode = $("#mod-depcode").val();
      var modtitle = $("#modupd-title").val();
      var modLec1 = "";
      if ($("#lecturer1-upd").val() != null) {
        modLec1 += $("#lecturer1-upd").val();
      }
      var modLec2 = "";
      if ($("#lecturer2-upd").val() != null) {
        modLec2 += $("#lecturer2-upd").val();
      }
      var modLec3 = "";
      if ($("#lecturer3-upd").val() != null) {
        modLec3 += $("#lecturer3-upd").val();
      }
      var modLec4 = "";
      if ($("#lecturer4-upd").val() != null) {
        modLec4 += $("#lecturer4-upd").val();
      }
      var json = JSON.stringify({ modulecode: modulecode, moduletitle: modtitle, lecturer1: modLec1, lecturer2: modLec2, lecturer3: modLec3, lecturer4: modLec4 });
      console.log(json);
      $.post("api.cshtml", { requestid: "setUpdateModule", json: json },
            function (JSONresult) {
              console.log("Response: " + JSONresult);
              if (JSONresult) {
                $("#modupd-code").val("");
                $("#modupd-title").val("");
                $("#lecturer1").val(""); /*Added*/
                $("#lecturer2").val(""); /*Added*/
                $("#lecturer3").val(""); /*Added*/
                $("#lecturer4").val(""); /*Added*/
                alert("Module Updated.");
                loadModules();
              } else {
                alert("Error. Operation FAILED!");
                loadModules();
              }
            }, 'json');
    }
    return false;
  });
  $("#searchmod-keyword").keyup(function () {
  });
});

function addMod() {
  var modDepCode = $("#mod-depcode").val();  
  var modCode = $("#mod-code").val();
  var modtitle = $("#mod-title").val();
  var modPart = $("#mod-part").val();/*Added*/
  var modLec1 = $("#lecturer1").val();/*Added*/
  
  var modLec2 = "";
  if ($("#lecturer2").val() != null) {
    modLec2 += $("#lecturer2").val();
  }
  var modLec3 = "";
  if ($("#lecturer3").val() != null) {
    modLec3 += $("#lecturer3").val();
  }
  var modLec4 = "";
  if ($("#lecturer4").val() != null) {
    modLec4 += $("#lecturer4").val();
  }

  var json = JSON.stringify({deptcode: modDepCode, modulepart: modPart, modulecode: modCode, moduletitle: modtitle, lecturer1: modLec1, lecturer2: modLec2, lecturer3: modLec3, lecturer4: modLec4});
  $.post("api.cshtml", {requestid: "setNewModule", json: json},
  function (JSONresult) {
    console.log("Response: " + JSONresult);
    if (JSONresult) {
      $("#mod-part").val("");/*Added*/
      $("#mod-code").val("");
      $("#mod-title").val("");
      $("#lecturer1").val("");/*Added*/
      $("#lecturer2").val("");/*Added*/
      $("#lecturer3").val("");/*Added*/
      $("#lecturer4").val("");/*Added*/
      alert("Module Added.");
      loadModules();
    } else {
      alert("Oops. Something went wrong.");
      loadModules();
    }
  }, 'json');
}

function loadModules() {
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
      var modCode = $('#input-moduleInfo').val().substring(0, $('#input-moduleInfo').val().indexOf(' '));
      $('#modupd-code').val(modCode);
      var modTitle = $('#input-moduleInfo').val().substring($('#input-moduleInfo').val().indexOf(' ') + 1);
      $('#modupd-title').val(modTitle);
      $("#input-moduleInfo").blur();
    }
  });
}

function loadLecturers(){
    var availableTags = [];

    $.post("api.cshtml", {requestid: "getDeptLecturers"},
      function (JSONresult) {
        for (var i = 0; i < JSONresult.length; i++) {
          availableTags.push(JSONresult[i].name);
        }
      }, 'json');
      $("#lecturer1").autocomplete({
          source: availableTags,
          close: function () {
              var Lecturer = $('#lecturer1').val();
              $('#lecturer1').val(Lecturer);
          }
      });
      $("#lecturer2").autocomplete({
          source: availableTags,
          close: function () {
              var Lecturer = $('#lecturer2').val();
              $('#lecturer2').val(Lecturer);
          }
      });
      $("#lecturer3").autocomplete({
          source: availableTags,
          close: function () {
              var Lecturer = $('#lecturer3').val();
              $('#lecturer3').val(Lecturer);
          }
      });
      $("#lecturer4").autocomplete({
          source: availableTags,
          close: function () {
              var Lecturer = $('#lecturer4').val();
              $('#lecturer4').val(Lecturer);
          }
      });
      //sort it out so it works with the additional lecturers 
      $("#lecturer1-upd").autocomplete({
          source: availableTags,
          close: function () {
              var Lecturer = $('#lecturer1-upd').val();
              $('#lecturer1-upd').val(Lecturer);
          }
      });
      $("#lecturer2-upd").autocomplete({
          source: availableTags,
          close: function () {
              var Lecturer = $('#lecturer2-upd').val();
              $('#lecturer2-upd').val(Lecturer);
          }
      });
      $("#lecturer3-upd").autocomplete({
          source: availableTags,
          close: function () {
              var Lecturer = $('#lecturer3-upd').val();
              $('#lecturer3-upd').val(Lecturer);
          }
      });
      $("#lecturer4-upd").autocomplete({
          source: availableTags,
          close: function () {
              var Lecturer = $('#lecturer4-upd').val();
              $('#lecturer4-upd').val(Lecturer);
          }
      });
}

var count = 0;

function addLecturers(){
  if (count == 0) {
    count++;
    $('.form-hidden-1').show();
    console.log("Showing extra lecturer (Lec 2)");
  }
  else if (count == 1) {
    count++;
    $('.form-hidden-2').show();
    console.log("Showing extra lecturer (Lec 3)");
  }
  else if (count == 2) {
    count++;
    $('.form-hidden-3').show();
    console.log("Showing extra lecturer (Lec 4)");
    $('#toggle-btn').css('opacity', '0.2');
    $('#toggle-btn:hover').css('cursor','default');
  }
}