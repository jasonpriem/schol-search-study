<?php
include('./Serp.php');
include('./SerpFactory.php');
include('./SerpCollection.php');
include('./ActivityLogEvent.php');
include('./ActivityLog.php');
date_default_timezone_set('America/New_York'); 

$testFile = './testdata/activity.test';
$dataFile = './data/lemurlogtoolbar_log';

if (isset($_GET['person'])) {
    $fileToLoad = $dataFile . '.' . $_GET['person'];
}
else {
    $fileToLoad = $testFile;
}

$activityLog = new ActivityLog(file_get_contents($fileToLoad));

$serpCollection = new SerpCollection();
$serpCollection->fillFromActivityLog($activityLog);

?><!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <link rel="stylesheet" type="text/css" href="main.css" />
        <title>log viewer</title>
    </head>
<h1>search pilot logs viewer</h1>
<?php $serpCollection->renderAsUl(); ?>
