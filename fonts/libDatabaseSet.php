<?php

//Module Manager

//We need to find a way to convert this to C#
//When you query a db, it returns the result
//Pass the result into this function, it will tell you in PHP if it executed correctly or if there was an error
function verify($res) {
  if (PEAR::isError($res)) {	//if result is error, return FALSE
    return false;
  } 
	else {											//otherwise, it is a success, return TRUE
    return true;
  }
}

//DONE THIS
function setNewModule($db, $modulecode, $moduletitle, $deptcode) {
  if ($deptcode != substr($modulecode, 0, 2)) {
    return false;
  }
  $modulepart = substr($modulecode, 2, 1);
  $modulecode = substr($modulecode, 3);
  $sql = "INSERT INTO module (dept_code,module_part,module_code,module_title) VALUES ('$deptcode','$modulepart','$modulecode','$moduletitle');";
  $res = & $db->queryAll($sql);
  return verify($res);
}

//DONE THIS
function setUpdateModule($db, $modulecode, $moduletitle, $deptcode) {
  if ($deptcode != substr($modulecode, 0, 2)) {
    return false;
  }
  $sql = "UPDATE module SET module_title = '$moduletitle' WHERE CONCAT(dept_code,module_part,module_code) = '$modulecode';";
  $res = & $db->queryAll($sql);
  return verify($res);
}

//DONE THIS
function setDeleteModule($db, $modulecode, $moduletitle, $deptcode) {
  if ($deptcode != substr($modulecode, 0, 2)) {
    return false;
  }
  $sql = "DELETE FROM module WHERE CONCAT(dept_code,module_part,module_code) = '$modulecode' AND module_title = '$moduletitle';";
  $res = & $db->queryAll($sql);
  return verify($res);
}

//Sets the notification status of a list of request ID's to 0 (From unread to READ)
function setNotificationStatus($db, $idlist) {
  $sql = "UPDATE request SET notification_status=0 WHERE request_id IN ($idlist);";
  $res = & $db->queryAll($sql);
  return verify($res);
}

//Needs to go in API Helper Function section
//Takes in day 'number' and converts to day string
function calcDay($dayNum) {
  switch ($dayNum) {
    case 1:
      return 'monday';
    case 2:
      return 'tuesday';
    case 3:
      return 'wednesday';
    case 4:
      return 'thursday';
    case 5:
      return 'friday';
  }
}

//Needs to go in API Helper Function section
//Gets the last request ID from the database
function getLastID($db) {
  $sql = "SELECT request_id FROM request ORDER BY request_id DESC LIMIT 1";
  $res = & $db->queryOne($sql);
  return $res;
}

//Interprets the JSON data read in from clientside
//This is for BOOKING a room for multiple slots (times/days of a week)
//This also includes multiple rooms
//The booking from client side also sends through the list of 'Room Requirements' in the JSON data (ie. Park, Capacity, Projectors etc.)
function interpretData($db, $json, $modulecode) {
  $queue = array();									//Create array queue and newState
  $newState = array();
  $old = $json;											//Array 'old' is assigned the JSON input
  $returnStatus = true;							

	//Loop through the INPUT data to construct the 'newState' array
  for ($x = 0; $x < sizeof($old); $x++) {						//Loop through input data ('old' array)
    for ($y = 0; $y < sizeof($old[$x]); $y++) {			//For each element of old, then loop through each of the sub-elements ie. old[0], old[1], ...
      switch ($y) {																					//IF-ELSE (SWITCH)
        case 0:																							//If the current element is in index 0 of old (the input data) then it is the PARK	
          $newState[$x]['park'] = $old[$x][$y];							//So fill newState array with this data
          break;
        case 1:
          $newState[$x]['building'] = substr($old[$x][$y], strpos($old[$x][$y], ' '));
          break;
        case 2:
          $newState[$x]['capacity'] = empty($old[$x][$y]) ? 0 : $old[$x][$y];
          break;
        case 3:
          $newState[$x]['modulecode'] = $old[$x][$y];
          break;
        case 4:
          $newState[$x]['priority'] = $old[$x][$y];
          break;
        case 5:																							//If the current element is in index 5 of old, go through all 15 of the next indeces to input the WEEKS they want the room for
          $newState[$x]['weeklist'][0] = $old[$x][$y];
          $newState[$x]['weeklist'][1] = $old[$x][$y + 1];
          $newState[$x]['weeklist'][2] = $old[$x][$y + 2];
          $newState[$x]['weeklist'][3] = $old[$x][$y + 3];
          $newState[$x]['weeklist'][4] = $old[$x][$y + 4];
          $newState[$x]['weeklist'][5] = $old[$x][$y + 5];
          $newState[$x]['weeklist'][6] = $old[$x][$y + 6];
          $newState[$x]['weeklist'][7] = $old[$x][$y + 7];
          $newState[$x]['weeklist'][8] = $old[$x][$y + 8];
          $newState[$x]['weeklist'][9] = $old[$x][$y + 9];
          $newState[$x]['weeklist'][10] = $old[$x][$y + 10];
          $newState[$x]['weeklist'][11] = $old[$x][$y + 11];
          $newState[$x]['weeklist'][12] = $old[$x][$y + 12];
          $newState[$x]['weeklist'][13] = $old[$x][$y + 13];
          $newState[$x]['weeklist'][14] = $old[$x][$y + 14];
          break;
        case 21:																						//If the current element is index 21, go through all 17 of the next indeces to input the FACILITIES they require
          $newState[$x]['facilities'][0] = $old[$x][$y];		//This will be 1's and 0's (1=Yes, 0=No)
          $newState[$x]['facilities'][1] = $old[$x][$y + 1];
          $newState[$x]['facilities'][2] = $old[$x][$y + 2];
          $newState[$x]['facilities'][3] = $old[$x][$y + 3];
          $newState[$x]['facilities'][4] = $old[$x][$y + 4];
          $newState[$x]['facilities'][5] = $old[$x][$y + 5];
          $newState[$x]['facilities'][6] = $old[$x][$y + 6];
          $newState[$x]['facilities'][7] = $old[$x][$y + 7];
          $newState[$x]['facilities'][8] = $old[$x][$y + 8];
          $newState[$x]['facilities'][9] = $old[$x][$y + 9];
          $newState[$x]['facilities'][10] = $old[$x][$y + 10];
          $newState[$x]['facilities'][11] = $old[$x][$y + 11];
          $newState[$x]['facilities'][12] = $old[$x][$y + 12];
          $newState[$x]['facilities'][13] = $old[$x][$y + 13];
          $newState[$x]['facilities'][14] = $old[$x][$y + 14];
          $newState[$x]['facilities'][15] = $old[$x][$y + 15];
          $newState[$x]['facilities'][16] = $old[$x][$y + 16];
          break;
        case 38:																											//If the index is 38, this is the start of the 'Timetable Grid'. Each index following is a new day (mon, tues, ...)
          $newState[$x]['grid'][0] = gridDayToArray($old[$x][$y]);		//Use the gridDayToArray() function to convert this into an array for each day	
          $newState[$x]['grid'][1] = gridDayToArray($old[$x][$y + 1]);
          $newState[$x]['grid'][2] = gridDayToArray($old[$x][$y + 2]);
          $newState[$x]['grid'][3] = gridDayToArray($old[$x][$y + 3]);
          $newState[$x]['grid'][4] = gridDayToArray($old[$x][$y + 4]);
          break;
        case 43:																						//Index 43 contains the room code
          $newState[$x]['roomcode'] = $old[$x][$y];
          break;
      }
    }
  }

	//Algorithm Sort     //debug here by "return $newState"
  $index = 0;
  $flag = false;
	//Find multiple room bookings
  for ($i = 0; $i < sizeof($newState[0]['grid']); $i++) {				//For each element in the newState[0]'s timetable grid (ie. Monday grid, Tuesday grid, Weds grid, ...)
    for ($j = 0; $j < sizeof($newState[0]['grid'][$i]); $j++) {	//For each element in each day's grid
			
      if ($newState[0]['grid'][$i][$j] == 1) {					//If this current day's grid is 1 (ie the slot has been selected for booking)
				
        if (sizeof($queue) == 0) {														//If the queue array is currently empty
          $index = null;																				//Set the index to null
        }
        array_push($queue, requestPushBack($newState[0], ($j + 1), ($i + 1), 0, null));		//Use requestPushBack() to add this booking slot (with all it's info) to the queue array 
				
        if (sizeof($newState) > 1) {													//If the newState array still has data (2nd multiple room booking)		
          if ($newState[1]['grid'][$i][$j]) {										//If the next element (newState[1]) ALSO has a 1 at the same grid slot (ie. This is a multiple room booking)
            if ($index == null) {																	//And If the index is null
              $index = 0;																						//Set index back to 0
            }
            $flag = true;																					//Set flag as true (ie. It IS a multiple room booking)
            array_push($queue, requestPushBack($newState[1], ($j + 1), ($i + 1), 1, (sizeof($queue) - 1)));		//Add this booking slot to the queue array
          }
        }
				
        if (sizeof($newState) > 2) {													//If the newState array has data for a 3rd multiple room booking
          if ($newState[2]['grid'][$i][$j]) {										//If this ALSO has a 1 at same grid slot (ie. This is a multiple room booking)
            if ($index == null) {
              $index = 0;
            }
            array_push($queue, requestPushBack($newState[2], ($j + 1), ($i + 1), 2, ($flag) ? (sizeof($queue) - 2) : (sizeof($queue) - 1)));
            $flag = false;
          }
        }
				
      }
			
    }
  }
	
	//Map Request Children
  $lastID = getLastID($db);				//Variable lastID is assigned the return of getLastID() function
  for ($i = 0; $i < sizeof($queue) - 1; $i++) {					//For each element in the queue array
		
		//If they are linked rooms (multiple and if one is rejected all are) - using verifyLinked() function
    if (verifyLinked($queue[$i]['request-timestart'], $queue[$i]['para_d'], $queue[$i]['para_r'], $queue[$i + 1]['request-timestart'], $queue[$i + 1]['para_d'], $queue[$i + 1]['para_r'])) {
      $queue[$i]['child'] = $lastID + $i + 2;		//Set the child element of first element to the second element's ID number in the database
    }
		
  }
	
	//Add requests to database
  for ($i = 0; $i < sizeof($queue); $i++) {	//For each element in the queue array
		//Declare variables
    $queueElem = $queue[$i];					//queueElem is the current element of the queue array
    $sql_day = $queueElem['day'];
    $sql_time = $queueElem['request-timestart'];
    $sql_round = 'round1';
    $sql_semester = '2';
    $sql_year = yearCheck(date('m'));
    $sql_roomcode = $queueElem['roomcode'];
    $sql_building = $queueElem['buildingcode'];
    $sql_park = $queueElem['park'];
    $sql_capacity = $queueElem['capacity'];
    $sql_modulecode = $queueElem['modulecode'];
    $sql_priority = (empty($queueElem['priority'])) ? "" : $queueElem['priority'];
    $sql_status = 'pending';					//TODO: This should be assigned 'approved' if currently in AD-HOC or Private room
    $sql_child = $queueElem['child'];
    $sql_notif = '0';
		
		//SQL - Add the request to the 'dbo.request' table in the database
    $sql = "";
    if ($queueElem['child'] === null) {		//If the element doesnt have a child
      $sql = "INSERT INTO request (request_day, request_timestart, request_round, request_semester, request_year, room_code, building_code, park, capacity, module_code, "
              . "request_priority, request_status, notification_status) VALUES "
              . "('$sql_day', $sql_time, '$sql_round', $sql_semester, $sql_year, '$sql_roomcode', '$sql_building', '$sql_park', $sql_capacity, '$sql_modulecode',"
              . " '$sql_priority', '$sql_status', $sql_notif)";
    } 
		else {	//If the element DOES have a child
      $sql = "INSERT INTO request (request_day, request_timestart, request_round, request_semester, request_year, room_code, building_code, park, capacity, module_code, "
              . "request_priority, request_status, request_child, notification_status) VALUES "
              . "('$sql_day', $sql_time, '$sql_round', $sql_semester, $sql_year, '$sql_roomcode', '$sql_building', '$sql_park', $sql_capacity, '$sql_modulecode',"
              . " '$sql_priority', '$sql_status', $sql_child, $sql_notif)";
    }		
    $res = & $db->queryOne($sql);		//Query the database

    $returnStatus = $returnStatus && verify($res); 		//To test for success, returnStatus = current returnStatus (true/false) AND verify() of this recent request

		//SQL - Insert the weeks into the 'dbo.request-week' table
    for ($j = 0; $j < sizeof($queueElem['weeklist']); $j++) {	//For each element of the week list
			
      $sqlWeek = "";																					//variable sqlWeek (for the SQL string)	
      if ($queueElem['weeklist'][$j] == 1) {									//If the week has been selected (1=Yes)
        $weekNum = $j + 1;																			
        $lid = $lastID + $i + 1;																//The ID of the request
        $sqlWeek = "INSERT INTO `request-week` VALUES ($lid,$weekNum)";	//Make SQL statement to insert weeks
      } 
			else {																									//If the week has NOT been selected
        $sqlWeek = "SELECT request_id FROM request LIMIT 1;";		//Execute this simple SQL statement rather than doing nothing (to prevent db issues)
      }
      $res = & $db->queryOne($sqlWeek);		//Query the database

      $returnStatus = $returnStatus && verify($res);		//To test for success, returnStatus = current returnStatus (true/false) AND verify() of this recent request
    }
		
		//SQL - Insert the facilities into the 'dbo.facility-request' table
    for ($j = 0; $j < sizeof($queueElem['facilities']); $j++) {	//For each element of the facilities list
			
      $sqlFak = "";																		//variable sqlFac (for the SQL string)				
      if ($queueElem['facilities'][$j] == 1) {				//If the facility has been selected (it is required)
        $fakID = $j + 1;																//Facility ID
        $lid = $lastID + $i + 1;												//The ID of the request
        $sqlFak = "INSERT INTO `facility-request` VALUES ($lid,$fakID)";	//Make the SQL statement to insert facility
      } 
			else {																					//If the week has NOT been selected
        $sqlFak = "SELECT request_id FROM request LIMIT 1;";	//Execute this simple SQL statement rather than doing nothing (to prevent db issues)
      }
      $res = & $db->queryOne($sqlFak);		//Query the database
			
      $returnStatus = $returnStatus && verify($res);		//To test for success, returnStatus = current returnStatus (true/false) AND verify() of this recent request
    }
  }
  return $returnStatus;		//Return true or false (True if all db queries were a success)
}

//Needs to go in API Helper Function section
//Function to condense a timetable state into an array with all booking info & the Time/Day/Room params
function requestPushBack($state, $para_t, $para_d, $para_r) {		//State, Time, Day, Room number (ie. from slot 1 (index 0), 2 (1), or 3 (2) of room booking UI [for multi rooms])
  $res = array();																			//Create array: res
  $res['day'] = calcDay($para_d);
  $res['roomcode'] = $state['roomcode'];
  $res['weeklist'] = $state['weeklist'];
  $res['facilities'] = $state['facilities'];
  $res['buildingcode'] = $state['building'];
  $res['park'] = $state['park'];
  $res['capacity'] = $state['capacity'];
  $res['modulecode'] = $state['modulecode'];
  $res['priority'] = $state['priority'];
  $res['child'] = null;
  $res['request-timestart'] = $para_t;
  $res['request-year'] = yearCheck(date('m'));				//Use the yearCheck() function with @DateTime.Now.Month parameter
  $res['para_d'] = $para_d;
  $res['para_r'] = $para_r;
  return $res;
}

//Needs to go in API Helper Function section
//Function to take the day grid input (as a string in form "0,0,1,0,1,0,0,0,0" for example) and return an array
function gridDayToArray($string) {
  $res = split(', ', $string);										//Split the string by the commas and put into array 'res'
  $datetime = array(0, 0, 0, 0, 0, 0, 0, 0, 0);		//Start with array of 9x 0's (this means no periods are selected as 0=No)
  for ($k = 0; $k < sizeof($res); $k++) {					//For each of the elements in res
    if ($res[$k] > 0) {															//If the element is a 1 (ie the time period in the day is selected)
      $datetime[$res[$k] - 1] = 1;										//Set the datetime array slot to 1 (1=Yes)
    }
  }
  return $datetime;																//Return the array of selected periods in a day
}

//Needs to go in API Helper Function section
//Verify if 2 slots are LINKED (ie. if they are multiple rooms, or a double/triple period)
function verifyLinked($t1, $d1, $r1, $t2, $d2, $r2) {	//inputs are time,day,roomnumber (in UI) for each
	
  if (($t1 == $t2) && ($d1 == $d2) && ($r1 < $r2)) {	//Case when it is a MULTIPLE ROOM (ie. same slot (time/day) but different room from UI)
    return true;
  }
  if (($t1 + 1 == $t2) && ($d1 == $d2)) {	//Case when it is a DOUBLE LENGTH slot (ie. the time of second is 1 hour after (next period) but day is same)
    return true;
  }
  return false;	//otherwise return false, as they are not linked
}