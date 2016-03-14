<?php

//header('Content-Type: text/html; charset=ISO-8859-1');
//This page is designed to output API style JSON strings for a specified query
//Database Configuration...
require_once "dbconnect/database.php";
//HTTPS IMPLEMENTATION - DO NOT TOUCH!
require_once "dbconnect/httpsAuth.php";

session_start();
if (isset($_SESSION['dept-code'])) {
  $user = $_SESSION['dept-code'];
  $sql = "SELECT * FROM department WHERE department_code = '$user'";
  $res = &$db->queryAll($sql);
  if (count($res) == 1) {
    //True
  } else {
    session_destroy();
    header('Location: https://co-project.lboro.ac.uk/crew12/Deliverable%202/login.php');
  }
} else {
  session_destroy();
  header('Location: https://co-project.lboro.ac.uk/crew12/Deliverable%202/login.php');
}

function input($post) {
  return filter_input(INPUT_POST, $post, FILTER_SANITIZE_FULL_SPECIAL_CHARS);
}

function getJSON() {
  return json_decode(str_replace('&#34;', '"', filter_input(INPUT_POST, 'json', FILTER_SANITIZE_FULL_SPECIAL_CHARS)), true);
}

if (!(isset($_POST['requestid']))) {
//if (empty(input('requestid'))) {
  echo "[C12-401] Warning. Missing Parameter. Please contact an Admin.";
  die;
}

//Encode a data array to JSON
function encodeJSON($res) {
  if (isset($res)) {
    echo json_encode($res);
  } else {
    echo "[C12-400] Warning. Unexpected Error. Please contact an Admin.";
  }
}

require_once 'library/libDatabaseGet.php';
require_once 'library/libDatabaseSet.php';
require_once "library/dates.php";

$requestid = input('requestid');

if (substr($requestid, 0, 3) == 'get') {
  //GET Functions
  if ($requestid == 'getDeptModuleList') {
    encodeJSON(getModuleCode($db, $_SESSION['dept-code']));
  } elseif ($requestid == 'getSuitableRooms') {
    encodeJSON(
            getRoomSearch(
                    $db, input('park'), //Any, Central, West, East, London
                    input('capacity'), //integer for minimum required capacity
                    input('buildingcode'), //B, CC, D, G, etc
                    input('lab'), //binary (0==No, 1==Yes)
                    input('wheelchair'), input('hearingloop'), input('computer'), input('projector'), input('dprojector'), input('ohp'), input('visualiser'), input('video'), input('bluray'), input('vhs'), input('whiteboard'), input('chalkboard'), input('plasma'), input('pasyste,'), input('radiomic'), input('review')
            )
    );
  } elseif ($requestid == 'getBuildingName') {
    encodeJSON(getBuildingName($db, input('buildingcode')));  //this buildingcode variable must be validated
  } elseif ($requestid == 'getBookingRequests') { //Get all Booking requests made with statuses and other info - Customised SYNTAX
    encodeJSON(getRoomBookingLogs($db, input('semester'), input('year')));
  } elseif ($requestid == 'getParkBuildings') {
    encodeJSON(getBuildings_Park($db, input('park')));
  } elseif ($requestid == 'getBuildingPark') {
    encodeJSON(getParkName($db, input('buildingcode')));
  } elseif ($requestid == 'getRoomTimetable') {
    encodeJSON(getRequestTimetable($db, input('roomcode'), input('semester'), input('weeks')));
  } elseif ($requestid == 'getRoomLogsBooking') {
    encodeJSON(getRequestLog_Booking($db, input('semester'), $_SESSION['dept-code']));
  } elseif ($requestid == 'getRoomLogsAllocation') {
    encodeJSON(getRequestLog_Allocation($db, input('semester'), input('year'), $_SESSION['dept-code']));
  } elseif ($requestid == 'getNotifications') {
    encodeJSON(getNotifications($db));
  } elseif ($requestid == 'getReqs') {
    encodeJSON(getRoomReqs($db, input('roomcode')));
  } elseif ($requestid == 'getModuleTimetable') {
    encodeJSON(getRequestTimetable_ModuleInfo($db, input('modulecode'), input('semester'), input('weeks')));
  } elseif ($requestid == 'getReqList') {
    encodeJSON(getReqsList($db));
  }
} elseif (substr($requestid, 0, 3) == 'set') {
  //SET Functions
  if ($requestid == 'setNewModule') {
    $json = getJSON();
    encodeJSON(setNewModule($db, $json['modulecode'], $json['moduletitle'], $json['deptcode']));
  } elseif ($requestid == 'setUpdateModule') {
    $json = getJSON();
    encodeJSON(setUpdateModule($db, $json['modulecode'], $json['moduletitle'], $json['deptcode']));
  } elseif ($requestid == 'setDeleteModule') {
    $json = getJSON();
    encodeJSON(setDeleteModule($db, $json['modulecode'], $json['moduletitle'], $json['deptcode']));
  } elseif ($requestid == 'setNotifications') {
    encodeJSON(setNotificationStatus($db, input('idlist')));
  } elseif ($requestid == 'setRequests') {
    $json = getJSON();
    encodeJSON(setNotificationStatus($db, $json));
  } elseif ($requestid == 'setBookingsInterpret') {
    $json = getJSON();
    //echo "recieved!";
    //echo var_dump($json);
    encodeJSON(interpretData($db, $json, input('modulecode')));
  }
}
?>