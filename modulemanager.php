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
?>
<!DOCTYPE html>
<!--
  Team 12
  Loughborough University (February 2016)
  
  Timetabling Website
  Module Management Page
-->

<html>
  <?php
  $pageName = 'modulemanager';
  include 'dependencies.php';
  ?>
  <body>
    <?php
    $activeNav = 4;
    include 'navigation.php';
    ?>

    <div id="page-content-container">

      <div id="createmodule-container" class="card-container">
        <div class='form-cont' id="form-createmodule">
          <h3 style="margin:15px">Create Module</h3>
          <div class="form-div">
            <span class="form-label">Department Code</span>
            <input type='text' placeholder='e.g. <?= $_SESSION['dept-code'] ?>' id='mod-depcode' class="form-control" style="width:60%" disabled="disabled" value="<?= $_SESSION['dept-code'] ?>"/>
          </div>
          <div class="form-div">
            <span class="form-label">Module Code</span>
            <input type='text' placeholder='e.g. <?= $_SESSION['dept-code'] ?>B290' id='mod-code' class="form-control" style="width:60%"/>
          </div>
          <div class="form-div">
            <span class="form-label">Module Title</span>
            <input type='text' placeholder='e.g. Team Projects' id='mod-title' class="form-control" style="width:70%"/>
          </div>
          <div class="form-div">
            <button id='create-mod' class='btn ok' style="width:90%">CREATE</button>
          </div>
        </div>
      </div>
      <div id="editdeletemodule-container" class="card-container">

        <div style="padding:20px;">
          <h3>Modify Module</h3>
          <div class="editmodule-blocks" id="search-block">
            <p>Module Search:</p>
            <input type='text' placeholder='e.g. COB290 Team Projects' id='input-moduleInfo' class="form-control" style="width:80%" align="middle"/>
          </div>
          <div class="editmodule-blocks" id="upd-block">
            <p>Edit Module:</p>
            <span class="form-label">Module Code</span>
            <input type='text' readonly placeholder='Module Code' id='modupd-code' class="form-control form-edit-input" style="width:67%" disabled="disabled"/>
            <br/>
            <span class="form-label">Module Title</span>
            <input type='text' placeholder='Module Title' id='modupd-title' class="form-control form-edit-input" style="width:68%"/>
            <br/>
            <center>
              <button id='update-mod' class='btn ok' style="margin-top:15px; width: 97%">UPDATE</button>
            </center>
          </div>
          <div class="editmodule-blocks" id="del-block">
            <p>Delete Module:</p>
            <br/>
            <button class='btn del' id='del-mod'>DELETE</button>
          </div>
        </div>
      </div>
    </div>
  </body>
</html>