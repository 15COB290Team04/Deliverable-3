<?php
//ini_set("session.cookie_secure", 1); //HTTPS IMPLEMENTATION - DISABLED FOR NOW. DO NOT TOUCH!
include_once "dbconnect/database.php";
//HTTPS IMPLEMENTATION - DO NOT TOUCH!
require_once "dbconnect/httpsAuth.php";

$auth = true;

function input($post) {
  return filter_input(INPUT_POST, $post, FILTER_SANITIZE_FULL_SPECIAL_CHARS);
}

if (!empty($_POST['user']) && !empty($_POST['password'])) { //If ID and Password are set
  //Login Verify
  $postUser = input('user');
  $postPassword = input('password');
  $sql = "SELECT * FROM department WHERE department_code = '$postUser' AND department_password = '$postPassword';";
  $res = &$db->queryAll($sql);
  if (count($res) == 1) {
    //Set Session
    session_start();
    $_SESSION['dept-code'] = $res[0]['department_code'];
    $_SESSION['dept-name'] = $res[0]['department_name'];
    $_SESSION['dept-user'] = $res[0]['department_user'];
    $_SESSION['pref-zoom'] = 0;
    $_SESSION['pref-colour'] = 0;
    $auth = true;
    //Set Header
    header('Location: https://co-project.lboro.ac.uk/crew12/Deliverable%202/booking.php');
  } else if (count($res) == 0) {
    $auth = false;
  }
}
?>
<!DOCTYPE html>
<html>
  <head>
    <title>Team12 - Login</title>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <!-- Styles -->
    <link rel="stylesheet" type="text/css" href="styles/main-style.css"/>
    <link rel="stylesheet" type="text/css" href="styles/login-page-style.css"/>
    <link rel="stylesheet" type="text/css" href="styles/font-awesome.css">
    <!-- jQuery -->
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js"></script>
    <!-- Javascript -->
    <script src="scripts/main-script.js" type="text/javascript"></script>
    <!-- Font -->
    <link href='http://fonts.googleapis.com/css?family=Lato:400,700,300' rel='stylesheet' type='text/css'>
    <link href='https://fonts.googleapis.com/css?family=Montserrat:400,700' rel='stylesheet' type='text/css'>
  </head>
  <body>
    <!-- HEADER -->
    <div id="header">
      <div id="header-topSection">
        <!-- Logo -->
        <img src="images/lu-logo-white.png" alt="LU Logo White" id="lu-logo">
        <!-- Heading -->
        <h2 id="main-heading">Departmental Timetabling Utility</h2>
        <!-- Accessibility -->
        <div id="accessibility-options"></div>
      </div>
      <div id="header-navigation">
      </div>
    </div>
    <div id="page-content-container">
      <br/>
      <center>
        <div class="card-container">
          <h2>Enter your credentials</h2><br>
          <section>
            <form method="post" action="login.php" name='login'>
              <input type="text" name="user" placeholder="username" class="login-input form-control"><br>
              <input type="password" name="password" placeholder="password" class="login-input form-control">
              <br/>
              <?php if (!$auth): ?>
                <div id="invalid-login" style="color:red;"><i class="fa fa-times"></i> Oops! Invalid password!</div><br/>
              <?php endif; ?>
              <input type="submit" name='submit' value="Log in" class="login-submit" style='border:none;'>
            </form>
          </section>
        </div>
      </center>
    </div>
  </body>
</html>