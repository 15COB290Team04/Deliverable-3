<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

//University Server - Crew12 Access
$host = "co-project.lboro.ac.uk:3306";
$dbname = "crew12";
$username = "crew12";
$password = "bsp32zyw";

require_once 'MDB2.php';
// Create connection
$dsn = "mysql://$username:$password@$host/$dbname";
$db = & MDB2::connect($dsn);
if (PEAR::isError($db)) {
  die($db->getMessage());
  console . log("DB ERROR");
}
$db->setFetchMode(MDB2_FETCHMODE_ASSOC);
?>