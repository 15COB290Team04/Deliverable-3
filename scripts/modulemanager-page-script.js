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
      var json = JSON.stringify({deptcode: deptcode, modulecode: modcode, moduletitle: modtitle});
      console.log(json);
      $.post("api.cshtml", {requestid: "setDeleteModule", json: json},
      function (JSONresult) {
        console.log("Response: " + JSONresult);
        if (JSONresult) {
          $("#modupd-code").val("");
          $("#modupd-title").val("");
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
      var json = JSON.stringify({deptcode: deptcode, modulecode: modcode, moduletitle: modtitle});
      console.log(json);
      $.post("api.cshtml", {requestid: "setUpdateModule", json: json},
      function (JSONresult) {
        console.log("Response: " + JSONresult);
        if (JSONresult) {
          $("#modupd-code").val("");
          $("#modupd-title").val("");
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
  var json = JSON.stringify({deptcode: modDepCode, modulecode: modCode, moduletitle: modtitle});
  $.post("api.cshtml", {requestid: "setNewModule", json: json},
  function (JSONresult) {
    console.log("Response: " + JSONresult);
    if (JSONresult) {
      $("#mod-code").val("");
      $("#mod-title").val("");
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