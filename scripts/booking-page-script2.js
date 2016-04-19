function readState(tabnumber) {
  var json = [];
  json.push($('#select-park-tab' + tabnumber).text());
  json.push($('#select-building-tab' + tabnumber).text());
  json.push($('#form-capacity-tab' + tabnumber).text());
  json.push($('#input-moduleInfo').val().substring(0, $('#input-moduleInfo').val().indexOf(' ')));
  json.push($('#form-priority-tab' + tabnumber).text() == "" ? null : $('#form-priority-tab' + tabnumber).text());
  $('#form-requiredWeeks-row1').find('.form-requiredWeeks-checkbox').each(function () {	//iterates through checked weeks
    var id = $(this).is(':checked');
    //console.log("TESTFUNC: " + id);
    (id) ? json.push(1) : json.push(0);
  });
  json.push($('#lab-tab' + tabnumber).text() == 0 ? 0 : 1);
  json.push($('#wheelchair-tab' + tabnumber).text() == 0 ? 0 : 1);
  json.push($('#hearingloop-tab' + tabnumber).text() == 0 ? 0 : 1);
  json.push($('#computer-tab' + tabnumber).text() == 0 ? 0 : 1);
  json.push($('#projector-tab' + tabnumber).text() == 0 ? 0 : 1);
  json.push($('#dprojector-tab' + tabnumber).text() == 0 ? 0 : 1);
  json.push($('#ohp-tab' + tabnumber).text() == 0 ? 0 : 1);
  json.push($('#visualiser-tab' + tabnumber).text() == 0 ? 0 : 1);
  json.push($('#video-tab' + tabnumber).text() == 0 ? 0 : 1);
  json.push($('#bluray-tab' + tabnumber).text() == 0 ? 0 : 1);
  json.push($('#vhs-tab' + tabnumber).text() == 0 ? 0 : 1);
  json.push($('#whiteboard-tab' + tabnumber).text() == 0 ? 0 : 1);
  json.push($('#chalkboard-tab' + tabnumber).text() == 0 ? 0 : 1);
  json.push($('#plasma-tab' + tabnumber).text() == 0 ? 0 : 1);
  json.push($('#pasystem-tab' + tabnumber).text() == 0 ? 0 : 1);
  json.push($('#radiomic-tab' + tabnumber).text() == 0 ? 0 : 1);
  json.push($('#review-tab' + tabnumber).text() == 0 ? 0 : 1);
  json.push($('#tab' + tabnumber + '-monday').text());
  json.push($('#tab' + tabnumber + '-tuesday').text());
  json.push($('#tab' + tabnumber + '-wednesday').text());
  json.push($('#tab' + tabnumber + '-thursday').text());
  json.push($('#tab' + tabnumber + '-friday').text());
  json.push($('#roomcode-tab' + tabnumber).text());
  console.log(json);
  return json;
}

function allRoomBookings() {
  var master = [];
  var states = $('#select-tab-number').val();
  switch (states) {
    case '1':
      master.push(readState(1));
      break;
    case '2':
      master.push(readState(1));
      master.push(readState(2));
      break;
    case '3':
      master.push(readState(1));
      master.push(readState(2));
      master.push(readState(3));
      break;
  }
  var modulecode = $('#input-moduleInfo').text().substring(0, $('#input-moduleInfo').val().indexOf(' '));
  var output = JSON.stringify(master);
  $.post("api.cshtml", {requestid: "setBookingsInterpret", json: output, modulecode: modulecode},
  function (JSONresult) {
    if (JSONresult) {
			resetPreferences(1);
			resetPreferences(2);
			resetPreferences(3);
			getSubmissionLog();
      alert("Successfully submitted bookings");
    }
    else {
			resetPreferences(1);
			resetPreferences(2);
			resetPreferences(3);
			getSubmissionLog();
      alert("Error. Bookings unsuccessful. \n\nPlease revise your preferences and try again.");
    }
		location.reload(); 
  }, 'json');
  console.log('After Req..');
}