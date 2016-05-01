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
    });
    $("#create-mod").click(function () {
        addMod();
    });
    $("#del-mod").click(function () {
        var r = confirm("Are you sure you wish to delete the selected Module?\n\nThis action cannot be undone.");
        if (r == true) {
            var deptcode = $("#mod-depcode").val();
            var modcode = $("#modupd-code").val();
            var modtitle = $("#modupd-title").val();
            var modLec1 = $("#lecturer1").val(); /*Added*/
            var modLec2 = $("#lecturer2").val(); /*Added*/
            var modLec3 = $("#lecturer3").val(); /*Added*/
            var json = JSON.stringify({ deptcode: deptcode, modulecode: modcode, moduletitle: modtitle });
            console.log(json);
            $.post("api.cshtml", { requestid: "setDeleteModule", json: json },
      function (JSONresult) {
          console.log("Response: " + JSONresult);
          if (JSONresult) {
              $("#modupd-code").val("");
              $("#modupd-title").val("");
              $("#lecturer1").val(""); /*Added*/
              $("#lecturer2").val(""); /*Added*/
              $("#lecturer3").val(""); /*Added*/
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
        var r = confirm("Are you sure you wish to update the selected Module with the new title?\n\nThis action cannot be undone.");
        if (r == true) {
            var deptcode = $("#mod-depcode").val();
            var modcode = $("#modupd-code").val();
            var modtitle = $("#modupd-title").val();
            var modLec1 = $("#lecturer1").val(); /*Added*/
            var modLec2 = $("#lecturer2").val(); /*Added*/
            var modLec3 = $("#lecturer3").val(); /*Added*/
            var json = JSON.stringify({ deptcode: deptcode, modulecode: modcode, moduletitle: modtitle, lecturer1: modLec1, lecturer2: modLec2, lecturer3: modLec3 });
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

  var json = JSON.stringify({deptcode: modDepCode, modulepart: modPart, modulecode: modCode, moduletitle: modtitle, lecturer1: modLec1, lecturer2: modLec2, lecturer3: modLec3});
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
      alert("Module Added.");
      loadModules();
    } else {
      alert("Error. Operation FAILED!");
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
}

var count = 0;

function addLecturers(){                
     if (count == 0){
         count++;
         var div = document.getElementById('mod-details');
        div.innerHTML += ('<span class="form-label">Module Lecturer:</span>\
        <input type="text" placeholder="e.g. Andre Schappo" id="lecturer2" class="form-control"/>\
                  <br/>\
                  <br/>');
         loadLecturers();
      } else if (count == 1) {
         count++;
         var div = document.getElementById('mod-details');
        div.innerHTML += ('<span class="form-label">Module Lecturer:</span>\
        <input type="text" placeholder="e.g. Firat Batmaz" id="lecturer3" class="form-control"/>\
                  <br/>\
                  <br/>');
        document.getElementById('toggle-btn').style.display = "none";
        document.getElementById('create-mod').style.marginLeft = "45%";
        loadLecturers();
      }    
}