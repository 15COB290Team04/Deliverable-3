<?php

//Database Configuration...
include_once "dbconnect/database.php";
//ini_set("session.cookie_secure", 1); //HTTPS IMPLEMENTATION - DISABLED FOR NOW. DO NOT TOUCH!
session_start();
if (!empty($_SESSION['dept-code'])) {
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

if (isset($_POST['prefid']) && isset($_POST['prefval'])) {
  if (input('prefid') == 'zoom') {
    if (input('prefval') == '1') {
      $_SESSION['pref-zoom'] = 1;
      echo "zoom = 1";
    } else {
      $_SESSION['pref-zoom'] = 0;
      echo "zoom = 0";
    }
  } elseif (input('prefid') == 'colour') {
    if (input('prefval') == '1') {
      $_SESSION['pref-colour'] = 1;
      echo "zoom = 1";
    } else {
      $_SESSION['pref-colour'] = 0;
      echo "zoom = 0";
    }
  }
}