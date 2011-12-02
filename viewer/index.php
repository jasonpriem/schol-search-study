<?php
include('./Log.php');
include('./SerpFactory.php');
include('./SearchLog.php');
include('./ActivityLog.php');
include('./Search.php');
include('./SearchParser.php');
include('./Serp.php');
include('./SerpCollection.php');
date_default_timezone_set('America/New_York'); 

$activityLog = new ActivityLog(file_get_contents('./data/activity.test'));
$serpCollection = new SerpCollection();
print_r($activityLog->parseSerps(new SerpCollection() ));




?>
<h2>Okay, what's this thing need to be able to do?</h2>
<pre>
* open the page log
* make an array of clicks on each page, keyed by url
* open the search text file
* make an array of searches
* parse each search
* print the thing
</pre>