<?php

//HTTPS IMPLEMENTATION - DO NOT TOUCH!
require_once "dbconnect/httpsAuth.php";

session_start();
session_destroy();
header('Location: https://co-project.lboro.ac.uk/crew12/Deliverable%202/index.php');
?>