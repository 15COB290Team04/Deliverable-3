<head>

  <!-- COMMON DEPENDENCIES -->
  <!-- Preference Variables -->
  <script type="text/javascript">
    var pref_zoom = <?= $_SESSION['pref-zoom'] ?>;
    var pref_colour = <?= $_SESSION['pref-colour'] ?>;
  </script>
  <!-- Styles -->
  <link rel="stylesheet" type="text/css" href="styles/main-style.css"/>
  <link rel="stylesheet" type="text/css" href="styles/font-awesome.css">
  <!-- jQuery -->
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js"></script>
  <!--	<link rel="stylesheet" href="https://ajax.googleapis.com/ajax/libs/jqueryui/1.11.4/themes/smoothness/jquery-ui.css">-->
  <link rel="stylesheet" type="text/css" href="styles/jquery-ui.css"/>
  <script src="https://ajax.googleapis.com/ajax/libs/jqueryui/1.11.4/jquery-ui.min.js"></script>
  <!-- Javascript -->
  <script src="scripts/main-script.js" type="text/javascript"></script>
  <!-- Font -->
  <link href='https://fonts.googleapis.com/css?family=Lato:400,700,300' rel='stylesheet' type='text/css'>
  <link href='https://fonts.googleapis.com/css?family=Montserrat:400,700' rel='stylesheet' type='text/css'>

  <!-- PAGE SPECIFIC -->
  <?php
  if ($pageName == 'booking') {
    echo '<link rel="stylesheet" type="text/css" href="styles/booking-page-style.css"/>';
    echo '<script src="scripts/booking-page-script.js" type="text/javascript"></script>';
    echo '<script src="scripts/booking-page-script2.js" type="text/javascript"></script>';
    echo '<title>Team12 Room Booking</title>';
  } elseif ($pageName == 'allocations') {
    echo '<link rel="stylesheet" type="text/css" href="styles/allocations-page-style.css"/>';
    echo '<script src="scripts/allocations-page-script.js" type="text/javascript"></script>';
    echo '<title>Team12 Room Allocations</title>';
  } elseif ($pageName == 'roominfo') {
    echo '<link rel="stylesheet" type="text/css" href="styles/roominfo-page-style.css"/>';
    echo '<script src="scripts/roominfo-page-script.js" type="text/javascript"></script>';
    echo '<title>Team12 Room Information</title>';
  } elseif ($pageName == 'moduleinfo') {
    echo '<link rel="stylesheet" type="text/css" href="styles/moduleinfo-page-style.css"/>';
    echo '<script src="scripts/moduleinfo-page-script.js" type="text/javascript"></script>';
    echo '<title>Team12 Module Information</title>';
  } elseif ($pageName == 'modulemanager') {
    echo '<link rel="stylesheet" type="text/css" href="styles/modulemanager-page-style.css"/>';
    echo '<script src="scripts/modulemanager-page-script.js" type="text/javascript"></script>';
    echo '<title>Team12 Module Management</title>';
  } else {
    echo '<title>Team12 Timetabling Website';
  }
  ?>

</head>