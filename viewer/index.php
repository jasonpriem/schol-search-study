<?php
include('./Log.php');
include('./SearchLog.php');
include('./ActivityLog.php');
include('./Search.php');
include('./SearchParser.php');
date_default_timezone_set('America/New_York'); 
$searchParser = new SearchParser(file_get_contents('./data/search.test'));
$search = new Search($searchParser);
$search->render();


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