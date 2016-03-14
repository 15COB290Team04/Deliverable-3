<!-- HEADER -->
<div id="header">
  <div id="header-topSection">
    <!-- Logo -->
    <img src="images/lu-logo-white.png" alt="LU Logo White" id="lu-logo">
    <!-- Heading -->
    <h2 id="main-heading">Departmental Timetabling Utility</h2>
    <!-- Accessibility -->
    <div id="accessibility-options">
      <span id="user-details" style='font-size:1.2em;'>Department&nbsp;&nbsp;   
        <span id="username" style='font-weight:700;'>	<?php echo $_SESSION['dept-code']; ?></span>
      </span>
      <span>&nbsp;&nbsp;&nbsp;&nbsp;<i id="user-notifications" class="fa fa-bell fa-2x accessibility-option"></i><span id='user-notification-alert'><i class="fa fa-exclamation fa-lg"></i></span></span>
      <span>&nbsp;&nbsp;&nbsp;&nbsp;<i id="toggleColor" class="fa fa-eye fa-2x accessibility-option"></i></span>
      <span>&nbsp;&nbsp;&nbsp;&nbsp;<i class="fa fa-search-plus fa-2x accessibility-option" id="fontChange"></i></span>
      <span>&nbsp;&nbsp;&nbsp;&nbsp;<a href="logout.php" class="accessibility-option" id="logoutButton"><i class="fa fa-sign-out fa-2x"></i></a></span>
    </div>
  </div>
  <div id="header-navigation">
    <ul>
      <li>
        <a href="booking.php">
          <?php
          if ($activeNav == 0)
            echo "<span class='nav-element-active'>Room Booking Requests</span>";
          else
            echo "Room Booking Requests";
          ?>
        </a>
      </li>
      <li>
        <a href="allocations.php">
          <?php
          if ($activeNav == 1)
            echo "<span class='nav-element-active'>Room Allocations</span>";
          else
            echo "Room Allocations";
          ?>
        </a>
      </li>
      <li>
        <a href="roominfo.php">
          <?php
          if ($activeNav == 2)
            echo "<span class='nav-element-active'>Room Information</span>";
          else
            echo "Room Information";
          ?>
        </a>
      </li>
      <li>
        <a href="moduleinfo.php"><?php
          if ($activeNav == 3)
            echo "<span class='nav-element-active'>Module Information</span>";
          else
            echo "Module Information";
          ?>
        </a>
      </li>
      <li>
        <a href="modulemanager.php">
          <?php
          if ($activeNav == 4)
            echo "<span class='nav-element-active'>Module Management</span>";
          else
            echo "Module Management";
          ?>
        </a>
      </li>
    </ul>
  </div>

  <div class='user-notification-dropdown card-container'><i class="fa fa-bell"></i>&nbsp;&nbsp;Notifications
    <span id='read-icon' style='margin-left:95px;'>Clear <i class="fa fa-check"></i></span>
    <br/>
    <br/>
    <div id='notification-container'></div>
    <br/>
  </div>
</div>

