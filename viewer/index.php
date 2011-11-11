<?php
include('./Log.php');
include('./SearchLog.php');
include('./ActivityLog.php');

$log = new SearchLog("this is\nmystring\nright here");
print_r($log->getLines());

?>