<?php

ini_set("session.cookie_secure", 1);
$auth = isset($_SERVER["HTTPS"]) && $_SERVER["HTTPS"] != "";
if (!$auth) {
  $r = "https://" . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];
  header("Location: $r");
  exit("Please use a secure HTTPS connection!");
}
