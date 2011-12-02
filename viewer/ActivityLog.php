<?php
class ActivityLog extends Log {

    public function parseSerps(SerpCollection $serpCollection){
        $lines = parent::getLinesArray();
        foreach ($lines as $k => $line) {
            $fields = explode("\t", $line);
            if ($fields[0] == "Show") {
                $url = $fields[3];
                // the thisSerp object is passed by reference; we're working directly
                // on the one in the serpCollection here.
                $thisSerp = $serpCollection->getSerpByUrl($url);
                if (!$thisSerp) {
                    $thisSerp = $serpCollection->createSerpByUrl($url);
                }
                if (!$thisSerp) continue; // this must be some random non-search URL.
            }
            // logic to add clicked urls to $thisSerp goes here

        }
        return $serpCollection;
    }

}
?>
