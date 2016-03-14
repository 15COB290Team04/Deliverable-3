<?php

/*
 * @Desc: This library contains common functions used to access the database and output the data in a legal format.
 * @Auth: Crew12
 */

//Get a list of all Departments
function getDeptName($db, $deptcode) {
  $sql = "SELECT department_name FROM department WHERE department_code = '$deptcode';";
  $res = & $db->queryOne($sql);
  return $res;
}

//Get a list of all modules with their corresponding codes matching a pattern
function getModuleCode($db, $deptcode) {
  $sql = "SELECT CONCAT(dept_code,module_part,module_code) AS module_code, module_title FROM module WHERE dept_code = '$deptcode';";
  $res = & $db->queryAll($sql);
  return $res;
}

//Get a module Title based on a Module Code
function getModuleTitle($db, $modulecode) {
  $sql = "SELECT module_title FROM module WHERE CONCAT(dept_code,module_part,module_code) = '$modulecode';";
  $res = & $db->queryOne($sql);
  return $res;
}

function getModuleCodes($db, $moduletitle) {
  $sql = "SELECT CONCAT(dept_code,module_part,module_code) AS module_code FROM module WHERE module_title LIKE '%$moduletitle%';";
  $res = & $db->queryAll($sql);
  return $res;
}

function getModuleTitles($db, $modulecode) {
  $sql = "SELECT module_title FROM module WHERE CONCAT(dept_code,module_part,module_code) LIKE '%$modulecode%';";
  $res = & $db->queryAll($sql);
  return $res;
}

//Get a building Name based on a building Code
function getBuildingName($db, $buildingcode) {
  $sql = "SELECT building_name FROM building WHERE building_code = '$buildingcode';";
  $res = & $db->queryOne($sql);
  return $res;
}

function getParkName($db, $buildingcode) {
  $sql = "SELECT park FROM building WHERE building_code = '$buildingcode';";
  $res = & $db->queryOne($sql);
  return $res;
}

function getBuildings_Park($db, $park) {
  $sql = "SELECT building_code, building_name FROM building" . ($park == "Any" ? ";" : " WHERE park = '$park';");
  $res = & $db->queryAll($sql);
  return $res;
}

function getEnabledFacilities_Park($db, $park) {
  $sql = "SELECT DISTINCT b.facility_name FROM `facility-room` a LEFT JOIN facility b ON a.facility_id = b.facility_id WHERE a.room_code IN (SELECT DISTINCT a.room_code FROM room a LEFT JOIN building b ON a.building_code = b.building_code WHERE b.park = '$park');";
  $res = & $db->queryAll($sql);
  return $res;
}

function getRooms_Park($db, $park) {
  $sql = "SELECT DISTINCT a.room_code FROM room a LEFT JOIN building b ON a.building_code = b.building_code WHERE b.park = '$park';";
  $res = & $db->queryAll($sql);
  return $res;
}

function getPark_Building($db, $buildingcode) {
  $sql = "SELECT park FROM building WHERE building_code = '$buildingcode';";
  $res = & $db->queryOne($sql);
  return $res;
}

function getEnabledFacilities_Building($db, $buildingcode) {
  $sql = "SELECT DISTINCT b.facility_name FROM `facility-room` a LEFT JOIN facility b ON a.facility_id = b.facility_id WHERE a.room_code IN (SELECT DISTINCT a.room_code FROM room a LEFT JOIN building b ON a.building_code = b.building_code WHERE b.building_code = '$buildingcode');";
  $res = & $db->queryAll($sql);
  return $res;
}

function getRooms_Building($db, $buildingcode) {
  $sql = "SELECT DISTINCT a.room_code FROM room a LEFT JOIN building b ON a.building_code = b.building_code WHERE b.building_code = '$buildingcode';";
  $res = & $db->queryAll($sql);
  return $res;
}

function getBuildings($db) {
  $sql = "SELECT building_name FROM building;";
  $res = & $db->queryAll($sql);
  return $res;
}

function getParks($db) {
  $sql = "SELECT DISTINCT park FROM building;";
  $res = & $db->queryAll($sql);
  return $res;
}

function getRooms($db) {
  $sql = "SELECT room_code FROM room;";
  $res = & $db->queryAll($sql);
  return $res;
}

function getRoomSearch($db, $park, $students, $buildingcode, $lab, $wheelchair, $hearingloop, $computer, $projector, $dprojector, $ohp, $visualiser, $video, $bluray, $vhs, $whiteboard, $chalkboard, $plasma, $pasystem, $radiomic, $review) {

  if ($park != "Any") { //if a certain park IS chosen			
    if ($buildingcode != "Any") { //if a certain building IS chosen
      $location = "SELECT a.room_code FROM `facility-room` a JOIN facility b ON a.facility_id = b.facility_id JOIN room c ON a.room_code = c.room_code JOIN building d ON c.building_code = d.building_code WHERE d.building_code = '$buildingcode' AND ";
    } else {
      $location = "SELECT a.room_code FROM `facility-room` a JOIN facility b ON a.facility_id = b.facility_id JOIN room c ON a.room_code = c.room_code JOIN building d ON c.building_code = d.building_code WHERE d.park = '$park' AND ";
    }
  } else { //if both building and park is "Any"
    $location = "SELECT a.room_code FROM `facility-room` a JOIN facility b ON a.facility_id = b.facility_id JOIN room c ON a.room_code = c.room_code WHERE ";
  }

  $requirements = "'Start'," . (($lab == 1) ? "'Laboratory'," : "") . (($wheelchair == 1) ? "'Wheelchair Access'," : "") . (($hearingloop == 1) ? "'Hearing Induction Loop Fitted'," : "") . (($computer == 1) ? "'Computer'," : "") . (($projector == 1) ? "'Projector'," : "") . (($dprojector == 1) ? "'Dual Projector'," : "") . (($ohp == 1) ? "'OverHead Projector'," : "") . (($visualiser == 1) ? "'Visualiser'," : "") . (($video == 1) ? "'Video Player'," : "") . (($bluray == 1) ? "'BluRay Player'," : "") . (($vhs == 1) ? "'VHS Player'," : "") . (($whiteboard == 1) ? "'Whiteboard'," : "") . (($chalkboard == 1) ? "'Chalkboard'," : "") . (($plasma == 1) ? "'Plasma'," : "") . (($pasystem == 1) ? "'PA System'," : "") . (($radiomic == 1) ? "'Radio Mic'," : "") . (($review == 1) ? "'ReVIEW Lecture Capture'," : "") . "'End'";

  if (strlen($requirements) > 13) { //if user has specified requirements
    $sql = $location . "c.room_capacity >= $students AND a.facility_id IN (SELECT facility_id FROM facility WHERE facility_name IN ($requirements)) GROUP BY a.room_code HAVING COUNT(a.facility_id) = (SELECT COUNT(facility_id) FROM facility WHERE facility_name IN ($requirements));";
  } else { //to prevent breaking when no requirements selected
    $sql = $location . "c.room_capacity >= $students GROUP BY a.room_code;";
  }
  $res = & $db->queryAll($sql);
  return $res;
}

function getRoomSearch_Info($db, $search, $park, $students, $buildingcode, $lab, $wheelchair, $hearingloop, $computer, $projector, $dprojector, $ohp, $visualiser, $video, $bluray, $vhs, $whiteboard, $chalkboard, $plasma, $pasystem, $radiomic, $review) {

  if ($park != "Any") { //if a certain park IS chosen			
    if ($buildingcode != "Any") { //if a certain building IS chosen
      $location = "SELECT a.room_code, c.room_capacity FROM `facility-room` a JOIN facility b ON a.facility_id = b.facility_id JOIN room c ON a.room_code = c.room_code JOIN building d ON c.building_code = d.building_code WHERE d.building_code = '$buildingcode' AND ";
    } else {
      $location = "SELECT a.room_code, c.room_capacity FROM `facility-room` a JOIN facility b ON a.facility_id = b.facility_id JOIN room c ON a.room_code = c.room_code JOIN building d ON c.building_code = d.building_code WHERE d.park = '$park' AND ";
    }
  } else { //if both building and park is "Any"
    $location = "SELECT a.room_code, c.room_capacity FROM `facility-room` a JOIN facility b ON a.facility_id = b.facility_id JOIN room c ON a.room_code = c.room_code WHERE ";
  }

  $requirements = "'Start'," . (($lab == 1) ? "'Laboratory'," : "") . (($wheelchair == 1) ? "'Wheelchair Access'," : "") . (($hearingloop == 1) ? "'Hearing Induction Loop Fitted'," : "") . (($computer == 1) ? "'Computer'," : "") . (($projector == 1) ? "'Projector'," : "") . (($dprojector == 1) ? "'Dual Projector'," : "") . (($ohp == 1) ? "'OverHead Projector'," : "") . (($visualiser == 1) ? "'Visualiser'," : "") . (($video == 1) ? "'Video Player'," : "") . (($bluray == 1) ? "'BluRay Player'," : "") . (($vhs == 1) ? "'VHS Player'," : "") . (($whiteboard == 1) ? "'Whiteboard'," : "") . (($chalkboard == 1) ? "'Chalkboard'," : "") . (($plasma == 1) ? "'Plasma'," : "") . (($pasystem == 1) ? "'PA System'," : "") . (($radiomic == 1) ? "'Radio Mic'," : "") . (($review == 1) ? "'ReVIEW Lecture Capture'," : "") . "'End'";

  if (strlen($requirements) > 13) { //if user has specified requirements
    $sql = $location . "c.room_capacity >= $students AND a.room_code LIKE '%$search%' AND a.facility_id IN (SELECT facility_id FROM facility WHERE facility_name IN ($requirements)) GROUP BY a.room_code HAVING COUNT(a.facility_id) = (SELECT COUNT(facility_id) FROM facility WHERE facility_name IN ($requirements));";
  } else { //to prevent breaking when no requirements selected
    $sql = $location . "c.room_capacity >= $students GROUP BY a.room_code;";
  }
  $res = & $db->queryAll($sql);
  return $res;
}

function getRequestTimetable($db, $roomCode, $semester, $weeks) {
  $year = yearCheck(date('m'));
  $sql = "SELECT a.request_id, a.request_day, a.request_timestart, a.request_round, a.request_semester, a.request_year, a.room_code, a.building_code, a.park, a.capacity, a.module_code, a.request_priority, a.request_status, a.request_child, a.notification_status FROM request a LEFT JOIN `request-week` b ON a.request_id = b.request_id WHERE a.request_status = 'approved' AND a.request_semester = '$semester' AND a.request_year = '$year' AND a.room_code = '$roomCode' AND week_number IN($weeks) GROUP BY a.request_id;";
  $requestArray = & $db->queryAll($sql);
  $res = array();
  $week = array();
  for ($i = 0; $i < sizeof($requestArray); $i++) {
    $res[$i]['request-details'] = $requestArray[$i];
    $sqlWeekCheck = "SELECT week_number FROM `request-week` WHERE request_id = '" . $requestArray[$i]['request_id'] . "';";
    $week = & $db->queryAll($sqlWeekCheck);
    $res[$i]['weeks-list'] = $week;
    $res[$i]['weeks-range'] = getRanges($week);
  }
  return $res;
}

function getRequestTimetable_ModuleInfo($db, $modulecode, $semester, $weeks) {
  $year = yearCheck();
  $sql = "SELECT a.request_id, a.request_day, a.request_timestart, a.request_round, a.request_semester, a.request_year, a.room_code, a.building_code, a.park, a.capacity, a.module_code, a.request_priority, a.request_status, a.request_child, a.notification_status FROM request a LEFT JOIN `request-week` b ON a.request_id = b.request_id WHERE a.request_status = 'approved' AND a.request_semester = '$semester' AND a.request_year = '$year' AND a.module_code = '$modulecode' AND week_number IN($weeks) GROUP BY a.request_id;";
  $requestArray = & $db->queryAll($sql);
  $res = array();
  $week = array();
  for ($i = 0; $i < sizeof($requestArray); $i++) {
    $res[$i]['request-details'] = $requestArray[$i];
    $sqlWeekCheck = "SELECT week_number FROM `request-week` WHERE request_id = '" . $requestArray[$i]['request_id'] . "';";
    $week = & $db->queryAll($sqlWeekCheck);
    $res[$i]['weeks-list'] = $week;
    $res[$i]['weeks-range'] = getRanges($week);
  }
  return $res;
}

function getRequestLog_Booking($db, $semester, $deptcode) { //Currently gives duplicate entries for multiple weeks
  $year = yearCheck(date('m'));
  $sql = "SELECT a.request_id, a.request_day, a.request_timestart, a.request_round, a.request_semester, a.request_year, a.room_code, a.building_code, a.park, a.capacity, a.module_code, a.request_priority, a.request_status, a.request_child, a.notification_status, b.building_name, c.module_title FROM request a LEFT JOIN building b ON a.building_code = b.building_code LEFT JOIN module c ON a.module_code = CONCAT(c.dept_code,c.module_part,c.module_code) WHERE request_semester = '$semester' AND request_year = '$year' AND request_status IN('pending', 'rejected') AND a.module_code LIKE '$deptcode%';";
  $requestArray = & $db->queryAll($sql);
  $res = array();
  $week = array();
  for ($i = 0; $i < sizeof($requestArray); $i++) {
    $res[$i]['request-details'] = $requestArray[$i];
    $sqlWeekCheck = "SELECT week_number FROM `request-week` WHERE request_id = '" . $requestArray[$i]['request_id'] . "';";
    $week = & $db->queryAll($sqlWeekCheck);
    $res[$i]['weeks-active'] = $week;
    $res[$i]['weeks-range'] = getRanges($week);
  }
  return $res;
}

function getRequestLog_Allocation($db, $semester, $year, $deptcode) { //Currently gives duplicate entries for multiple weeks
  $sql = "SELECT a.request_id, a.request_day, a.request_timestart, a.request_round, a.request_semester, a.request_year, a.room_code, a.building_code, a.park, a.capacity, a.module_code, a.request_priority, a.request_status, a.request_child, a.notification_status, b.building_name, c.module_title FROM request a LEFT JOIN building b ON a.building_code = b.building_code LEFT JOIN module c ON a.module_code = CONCAT(c.dept_code,c.module_part,c.module_code) WHERE request_semester = '$semester' AND request_year = '$year' AND a.module_code LIKE '$deptcode%';";
  $requestArray = & $db->queryAll($sql);
  $res = array();
  $week = array();
  for ($i = 0; $i < sizeof($requestArray); $i++) {
    $res[$i]['request-details'] = $requestArray[$i];
    $sqlWeekCheck = "SELECT week_number FROM `request-week` WHERE request_id = '" . $requestArray[$i]['request_id'] . "';";
    $week = & $db->queryAll($sqlWeekCheck);
    $res[$i]['weeks-active'] = $week;
    $res[$i]['weeks-range'] = getRanges($week);
  }
  return $res;
}

function getNotifications($db) {
  $sql = "SELECT a.request_id, a.request_day, a.request_timestart, a.room_code, a.module_code, a.request_child, a.request_status, a.notification_status FROM request AS a WHERE a.notification_status = 1 AND a.request_status IN('approved', 'rejected');";
  $request = & $db->queryAll($sql);
  $res = array();
  $week = array();
  for ($i = 0; $i < sizeof($request); $i++) {
    $res[$i]['request-details'] = $request[$i];
    $sqlWeekCheck = "SELECT week_number FROM `request-week` WHERE request_id = '" . $request[$i]['request_id'] . "';";
    $week = & $db->queryAll($sqlWeekCheck);
    $res[$i]['weeks-active'] = $week;
    $res[$i]['weeks-range'] = getRanges($week);
  }
  return $res;
}

function getRoomReqs($db, $roomcode) {
  $sql = "SELECT c.facility_name FROM room a JOIN `facility-room` b ON a.room_code = b.room_code JOIN facility c ON b.facility_id = c.facility_id WHERE a.room_code = '$roomcode';";
  $res = & $db->queryAll($sql);
  return $res;
}

function getRanges($nums) {
  $ranges = array();
  for ($i = 0, $len = count($nums); $i < $len; $i++) {
    $rStart = $nums[$i]['week_number'];
    $rEnd = $rStart;
    while (isset($nums[$i + 1]['week_number']) && $nums[$i + 1]['week_number'] - $nums[$i]['week_number'] == 1) {
      $rEnd = $nums[++$i]['week_number'];
    }
    $ranges[] = $rStart == $rEnd ? $rStart : $rStart . ' - ' . $rEnd;
  }
  return $ranges;
}

function yearCheck($m) {
  if ($m > 6) {
    return date('Y');
  } else {
    return date('Y') - 1;
  }
}

function getReqsList($db) {
  $sql = "SELECT * FROM facilities;";
  $res = & $db->queryAll($sql);
  return $res;
}
