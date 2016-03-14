<?php
//Database Configuration...
ini_set("session.cookie_secure", 1);
include_once "dbconnect/database.php";
//HTTPS IMPLEMENTATION - DO NOT TOUCH!
require_once "dbconnect/httpsAuth.php";

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
?>
<!DOCTYPE html>
<!--
  Team 12
  Loughborough University (February 2016)
  
  Timetabling Website
  Room Allocation Page
-->
<html>
  <?php
  $pageName = 'allocations';
  include 'dependencies.php';
  ?>	
  <body>
    <?php
    $activeNav = 1;
    include 'navigation.php';
    ?>

    <!-- MAIN CONTENT -->
    <div id="page-content-container">

      <div id="submissions-container" class="card-container">
        <div id="submissions-header">
          <h3 style="display:inline;">Your Submissions</h3>
          <div class="help-icon" id="help-allocationsYourSubmissions"><i class="fa fa-question-circle fa-lg"></i><span class="help-text">What's this?</span></div>
          <br/><br/>			
          Semester: 
          <select class="form-dropdown-large" id="semester-choice" style="margin-left:15px;">
            <option>Sem 1 - 2013/14</option>
            <option>Sem 2 - 2013/14</option>
            <option>Sem 1 - 2014/15</option>
            <option>Sem 2 - 2014/15</option>
            <option>Sem 1 - 2015/16</option>
            <option selected="selected">Sem 2 - 2015/16</option>
          </select>

        </div>
        <div id="submissions-tabs">
          <ul>
            <li class="submissions-tab tab-active" id="tab-roundPriority">Priority Round</li>
            <li class="submissions-tab" id="tab-round1">Round 1</li>
            <li class="submissions-tab" id="tab-round2">Round 2</li>
            <li class="submissions-tab" id="tab-round3">Round 3</li>
            <li class="submissions-tab" id="tab-roundAdhoc">AD-HOC</li>
          </ul>
        </div>
        <div class="submission-tabs-content">
          <!-- SUBMISSION LOG FOR ROUNDS -->
          <div class="yoursubs-container">
            <div id="yoursubs-roundPriority" class="yoursubs-show">
              <!-- Priority Round-->

            </div> <!-- End of priority round container -->

            <div id="yoursubs-round1" class="yoursubs-hidden">
              <!-- Round 1 -->

            </div> <!-- End of round 1 container -->

            <div id="yoursubs-round2" class="yoursubs-hidden">

              Round2

            </div> <!-- End of round 2 container -->

            <div id="yoursubs-round3" class="yoursubs-hidden">

              Round3

            </div> <!-- End of round 3 container -->

            <div id="yoursubs-roundAdhoc" class="yoursubs-hidden">

              AD-HOC

            </div> <!-- End of round 4 container -->
          </div>
        </div>
      </div>

      <div id="allocations-container" class="card-container">
        <div id="allocations-form">
          <h3 style="display:inline;">Room Allocations</h3>
          <div class="help-icon" id="help-allocationsForm"><i class="fa fa-question-circle fa-lg"></i><span class="help-text">What's this?</span></div>
          <br/>
          <br/>
          <form class="form-inline mo_info">
            <div id="wdytknbt">
              <label>Room Code:</label>
              <input type="text" name="name" class="form-control roomcode" id="form-booking-roomCode" style="width:10%;">
              <label class="full" id="form-booking-roomName"></label>
              <br>
              <div class="form-group" style="margin-top:10px;">
                <label>Semester:</label>
                <select id="select-semester" class="form-dropdown-medium">
                  <option>1</option>
                  <option>2</option>
                </select>
              </div>
            </div>
          </form>
        </div>
        <div id="allocations-display">
          <p style="text-align:center;">Showing timetable for room: <span id="allocations-selectedRoom"></span></p>

          <!-- JQuery Message Popup Dialog -->
          <div class="messagepop pop">
            <b>Information for a booked timetable slot.</b><br/><br/><br/><br/><br/>
            <p></p>
            <p class='close'>Close</p>
          </div>

          <!-- TIMETABLE -->
          <div id="timetable-container">
            <table class="timetable-table">
              <tr class="timetable-row1-headings">
                <td class="timetable-col1-name"></td>
                <td class="timetable-col2-period1">09:00-10:00</td>
                <td class="timetable-col3-period2">10:00-11:00</td>
                <td class="timetable-col4-period3">11:00-12:00</td>
                <td class="timetable-col5-period4">12:00-13:00</td>
                <td class="timetable-col6-period5">13:00-14:00</td>
                <td class="timetable-col7-period6">14:00-15:00</td>
                <td class="timetable-col8-period7">15:00-16:00</td>
                <td class="timetable-col9-period8">16:00-17:00</td>
                <td class="timetable-col10-period9">17:00-18:00</td>
              </tr>
              <tr class="timetable-row2-monday">
                <td class="timetable-col1-name">Monday</td>
                <td class="timetable-col2-period1 timetable-data"></td>
                <td class="timetable-col3-period2 timetable-data"><div class="timetable-content-empty"></div></td>
                <td class="timetable-col4-period3 timetable-data"><div class="timetable-content-empty"></div></td>
                <td class="timetable-col5-period4 timetable-data"><div class="timetable-content-empty"></div></td>
                <td class="timetable-col6-period5 timetable-data"><div class="timetable-content-empty"></div></td>
                <td class="timetable-col7-period6 timetable-data"><div class="timetable-content-empty"></div></td>
                <td class="timetable-col8-period7 timetable-data"><div class="timetable-content-empty"></div></td>
                <td class="timetable-col9-period8 timetable-data"><div class="timetable-content-empty"></div></td>
                <td class="timetable-col10-period9 timetable-data"><div class="timetable-content-empty"></div></td>
              </tr>
              <tr class="timetable-row3-tuesday">
                <td class="timetable-col1-name">Tuesday</td>
                <td class="timetable-col2-period1 timetable-data"><div class="timetable-content-empty"></div></td>
                <td class="timetable-col3-period2 timetable-data"><div class="timetable-content-empty"></div></td>
                <td class="timetable-col4-period3 timetable-data"><div class="timetable-content-empty"></div></td>
                <td class="timetable-col5-period4 timetable-data"><div class="timetable-content-empty"></div></td>
                <td class="timetable-col6-period5 timetable-data"><div class="timetable-content-empty"></div></td>
                <td class="timetable-col7-period6 timetable-data"><div class="timetable-content-empty"></div></td>
                <td class="timetable-col8-period7 timetable-data"><div class="timetable-content-empty"></div></td>
                <td class="timetable-col9-period8 timetable-data"><div class="timetable-content-empty"></div></td>
                <td class="timetable-col10-period9 timetable-data"><div class="timetable-content-empty"></div></td>
              </tr>
              <tr class="timetable-row4-wednesday">
                <td class="timetable-col1-name">Wednesday</td>
                <td class="timetable-col2-period1 timetable-data"><div class="timetable-content-empty"></div></td>
                <td class="timetable-col3-period2 timetable-data"><div class="timetable-content-empty"></div></td>
                <td class="timetable-col4-period3 timetable-data"><div class="timetable-content-empty"></div></td>
                <td class="timetable-col5-period4 timetable-data"><div class="timetable-content-empty"></div></td>
                <td class="timetable-col6-period5 timetable-data"><div class="timetable-content-empty"></div></td>
                <td class="timetable-col7-period6 timetable-data"><div class="timetable-content-empty"></div></td>
                <td class="timetable-col8-period7 timetable-data"><div class="timetable-content-empty"></div></td>
                <td class="timetable-col9-period8 timetable-data"><div class="timetable-content-empty"></div></td>
                <td class="timetable-col10-period9 timetable-data"><div class="timetable-content-empty"></div></td>
              </tr>
              <tr class="timetable-row5-thursday">
                <td class="timetable-col1-name">Thursday</td>
                <td class="timetable-col2-period1 timetable-data"><div class="timetable-content-empty"></div></td>
                <td class="timetable-col3-period2 timetable-data"><div class="timetable-content-empty"></div></td>
                <td class="timetable-col4-period3 timetable-data"><div class="timetable-content-empty"></div></td>
                <td class="timetable-col5-period4 timetable-data"><div class="timetable-content-empty"></div></td>
                <td class="timetable-col6-period5 timetable-data"><div class="timetable-content-empty"></div></td>
                <td class="timetable-col7-period6 timetable-data"><div class="timetable-content-empty"></div></td>
                <td class="timetable-col8-period7 timetable-data"><div class="timetable-content-empty"></div></td>
                <td class="timetable-col9-period8 timetable-data"><div class="timetable-content-empty"></div></td>
                <td class="timetable-col10-period9 timetable-data"><div class="timetable-content-empty"></div></td>
              </tr>
              <tr class="timetable-row6-friday">
                <td class="timetable-col1-name">Friday</td>
                <td class="timetable-col2-period1 timetable-data"><div class="timetable-content-empty"></div></td>
                <td class="timetable-col3-period2 timetable-data"><div class="timetable-content-empty"></div></td>
                <td class="timetable-col4-period3 timetable-data"><div class="timetable-content-empty"></div></td>
                <td class="timetable-col5-period4 timetable-data"><div class="timetable-content-empty"></div></td>
                <td class="timetable-col6-period5 timetable-data"><div class="timetable-content-empty"></div></td>
                <td class="timetable-col7-period6 timetable-data"><div class="timetable-content-empty"></div></td>
                <td class="timetable-col8-period7 timetable-data"><div class="timetable-content-empty"></div></td>
                <td class="timetable-col9-period8 timetable-data"><div class="timetable-content-empty"></div></td>
                <td class="timetable-col10-period9 timetable-data"><div class="timetable-content-empty"></div></td>
              </tr>
            </table>
          </div>

        </div>
      </div>

    </div>


  </body>

</html>