<?php
class ActivityLog extends Log {

    public function parseSerps(SerpCollection $serpCollection){
        $lines = parent::getLinesArray();
        $thisSerp = false;
        foreach ($lines as $k => $line) {
            $fields = explode("\t", $line);
            preg_match('#https*://.+#', $line, $m);
            $url = ( isset($m[0]) ) ? $m[0] : false; // annoyingly, url is in diff cols, depending on event type

            if ($fields[0] == "Focus") {

                // 1. try to get the serp from the collection.
                $thisSerp = $serpCollection->getSerpByUrl($url);

                // 2. if that didn't work, try to create a new Serp
                if (!$thisSerp) {
                    $thisSerp = $serpCollection->createSerpByUrl($url);
                }

                // 3. if that didn't work, we're dealing with a non-search URL; move on.
                if (!$thisSerp) continue; 
            }
            else if (in_array($fields[0], array('RClick', 'MClick', 'LClick'))){
                if ($thisSerp) {
                    $thisSerp->addClickedResult($url);
                }
            }

        }
        return $serpCollection;
    }

}
?>
