<?php

//Module Manager

function verify($res) {
  if (PEAR::isError($res)) {
    return false;
  } else {
    return true;
  }
}

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

function setUpdateModule($db, $modulecode, $moduletitle, $deptcode) {
  if ($deptcode != substr($modulecode, 0, 2)) {
    return false;
  }
  $sql = "UPDATE module SET module_title = '$moduletitle' WHERE CONCAT(dept_code,module_part,module_code) = '$modulecode';";
  $res = & $db->queryAll($sql);
  return verify($res);
}

function setDeleteModule($db, $modulecode, $moduletitle, $deptcode) {
  if ($deptcode != substr($modulecode, 0, 2)) {
    return false;
  }
  $sql = "DELETE FROM module WHERE CONCAT(dept_code,module_part,module_code) = '$modulecode' AND module_title = '$moduletitle';";
  $res = & $db->queryAll($sql);
  return verify($res);
}

function setNotificationStatus($db, $idlist) {
  $sql = "UPDATE request SET notification_status=0 WHERE request_id IN ($idlist);";
  $res = & $db->queryAll($sql);
  return verify($res);
}

/* PRIVATE USE FUNCTIONS */

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

function getLastID($db) {
  $sql = "SELECT request_id FROM request ORDER BY request_id DESC LIMIT 1";
  $res = & $db->queryOne($sql);
  return $res;
}

function interpretData($db, $json, $modulecode) {
  $queue = array();
  $newStates = array();
  $old = $json;
  $returnStatus = true;
  //echo "<pre>".print_r($json)."</pre>";
  for ($x = 0; $x < sizeof($old); $x++) {
    for ($y = 0; $y < sizeof($old[$x]); $y++) {
      switch ($y) {
        case 0:
          $newState[$x]['park'] = $old[$x][$y];
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
        case 5:
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
        case 21:
          $newState[$x]['facilities'][0] = $old[$x][$y];
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
        case 38:
          $newState[$x]['grid'][0] = gridDayToArray($old[$x][$y]);
          //echo "<pre>".print_r($old[$x])."</pre>";
          $newState[$x]['grid'][1] = gridDayToArray($old[$x][$y + 1]);
          $newState[$x]['grid'][2] = gridDayToArray($old[$x][$y + 2]);
          $newState[$x]['grid'][3] = gridDayToArray($old[$x][$y + 3]);
          $newState[$x]['grid'][4] = gridDayToArray($old[$x][$y + 4]);
          break;
        case 43:
          $newState[$x]['roomcode'] = $old[$x][$y];
          break;
      }
    }
  }
//echo "<pre>".print_r($newState)."</pre>";
//errorDebug(sizeof($newState[0]['grid']) . "NewState");
//Algorithm Sort
//return $newState;
  $index = 0;
  $flag = false;
  //errorDebug("<br>");
  for ($i = 0; $i < sizeof($newState[0]['grid']); $i++) {
    //errorDebug("Fired<br>");
    for ($j = 0; $j < sizeof($newState[0]['grid'][$i]); $j++) {
      //errorDebug($newState[0]['grid'][$i][$j] . "<br>");
      if ($newState[0]['grid'][$i][$j] == 1) {
        if (sizeof($queue) == 0) {
          $index = null;
        }
        array_push($queue, requestPushBack($newState[0], ($j + 1), ($i + 1), 0, null));
        if (sizeof($newState) > 1) {
          if ($newState[1]['grid'][$i][$j]) {
            if ($index == null) {
              $index = 0;
            }
            $flag = true;
            array_push($queue, requestPushBack($newState[1], ($j + 1), ($i + 1), 1, (sizeof($queue) - 1)));
          }
        }
        if (sizeof($newState) > 2) {
          if ($newState[2]['grid'][$i][$j]) {
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
//Map Children
  $lastID = getLastID($db);
  for ($i = 0; $i < sizeof($queue) - 1; $i++) {
    if (verifyLinked($queue[$i]['request-timestart'], $queue[$i]['para_d'], $queue[$i]['para_r'], $queue[$i + 1]['request-timestart'], $queue[$i + 1]['para_d'], $queue[$i + 1]['para_r'])) {
      $queue[$i]['child'] = $lastID + $i + 2;
    }
  }
//Add to DB
  //errorDebug(sizeof($queue) . "SizeQueue");
  for ($i = 0; $i < sizeof($queue); $i++) {
//Var Declare
    $stupid = $queue[$i];
    //echo "<pre>".print_r($queue)."</pre>";
    $sql_day = $stupid['day'];
    $sql_time = $stupid['request-timestart'];
    $sql_round = 'round1';
    $sql_semester = '2';
    $sql_year = yearCheck(date('m'));
    $sql_roomcode = $stupid['roomcode'];
    $sql_building = $stupid['buildingcode'];
    $sql_park = $stupid['park'];
    $sql_capacity = $stupid['capacity'];
    $sql_modulecode = $stupid['modulecode'];
    $sql_priority = (empty($stupid['priority'])) ? "" : $stupid['priority'];
    $sql_status = 'pending';
    $sql_child = $stupid['child'];
    $sql_notif = '0';
//SQL - Requests
    $sql = "";
    if ($stupid['child'] === null) {
      $sql = "INSERT INTO request (request_day, request_timestart, request_round, request_semester, request_year, room_code, building_code, park, capacity, module_code, "
              . "request_priority, request_status, notification_status) VALUES "
              . "('$sql_day', $sql_time, '$sql_round', $sql_semester, $sql_year, '$sql_roomcode', '$sql_building', '$sql_park', $sql_capacity, '$sql_modulecode',"
              . " '$sql_priority', '$sql_status', $sql_notif)";
    } else {
      $sql = "INSERT INTO request (request_day, request_timestart, request_round, request_semester, request_year, room_code, building_code, park, capacity, module_code, "
              . "request_priority, request_status, request_child, notification_status) VALUES "
              . "('$sql_day', $sql_time, '$sql_round', $sql_semester, $sql_year, '$sql_roomcode', '$sql_building', '$sql_park', $sql_capacity, '$sql_modulecode',"
              . " '$sql_priority', '$sql_status', $sql_child, $sql_notif)";
    }
    $res = & $db->queryOne($sql);
    //errorDebug($sql . " - " . verify($res) . $i . "<br>");
    $returnStatus = $returnStatus && verify($res);
//SQL - Week
    for ($j = 0; $j < sizeof($stupid['weeklist']); $j++) {
      $sqlWeek = "";
      if ($stupid['weeklist'][$j] == 1) {
        $weekNum = $j + 1;
        $lid = $lastID + $i + 1;
        $sqlWeek = "INSERT INTO `request-week` VALUES ($lid,$weekNum)";
      } else {
        $sqlWeek = "SELECT request_id FROM request LIMIT 1;";
      }
      $res = & $db->queryOne($sqlWeek);
      //errorDebug($sqlWeek . " - " . verify($res) . $i . " " . $j . "<br>");
      $returnStatus = $returnStatus && verify($res);
    }
//SQL - Facilities
    for ($j = 0; $j < sizeof($stupid['facilities']); $j++) {
      $sqlFak = "";
      if ($stupid['facilities'][$j] == 1) {
        $fakID = $j + 1;
        $lid = $lastID + $i + 1;
        $sqlFak = "INSERT INTO `facility-request` VALUES ($lid,$fakID)";
      } else {
        $sqlFak = "SELECT request_id FROM request LIMIT 1;";
      }
      $res = & $db->queryOne($sqlFak);
      //errorDebug($sqlFak . " - " . verify($res) . $i . " " . $j);
      $returnStatus = $returnStatus && verify($res);
    }
  }
  //errorDebug($returnStatus . " After Faclities");
  return $returnStatus;
}

function requestPushBack($state, $para_t, $para_d, $para_r) {
  $res = array();
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
  $res['request-year'] = yearCheck(date('m'));
  $res['para_d'] = $para_d;
  $res['para_r'] = $para_r;
  return $res;
}

function gridDayToArray($string) {
  $res = split(', ', $string);
  $datetime = array(0, 0, 0, 0, 0, 0, 0, 0, 0);
  for ($k = 0; $k < sizeof($res); $k++) {
    if ($res[$k] > 0) {
      $datetime[$res[$k] - 1] = 1;
    }
  }
  return $datetime;
}

function verifyLinked($t1, $d1, $r1, $t2, $d2, $r2) {
  if (($t1 == $t2) && ($d1 == $d2) && ($r1 < $r2)) {
    return true;
  } else
  if (($t1 + 1 == $t2) && ($d1 == $d2)) {
    return true;
  }
  return false;
}

function errorDebug($string) {
  echo $string;
}
