<?php

include_once "dbconnect/database.php";
//HTTPS IMPLEMENTATION - DO NOT TOUCH!
require_once "dbconnect/httpsAuth.php";

session_start();
ini_set("session.cookie_secure", 1);
if (!empty($_SESSION['dept-code'])) {
  $user = $_SESSION['dept-code'];
  $sql = "SELECT * FROM department WHERE department_code = '$user'";
  $res = &$db->queryAll($sql);
  if (count($res) == 1) {
    header('Location: https://co-project.lboro.ac.uk/crew12/Deliverable%202/booking.php');
  }
} else {
  session_destroy();
  header('Location: https://co-project.lboro.ac.uk/crew12/Deliverable%202/login.php');
}
?>