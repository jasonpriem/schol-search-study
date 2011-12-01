<?php
class ActivityLog extends Log {
    private $queryRegexes = array(
        "#http://www\.google\.com/search\?q=([^&]+)#",
        "#http://scholar\.google\.com/scholar\?q=([^&]+)#",
        "#http://www\.ncbi\.nlm\.nih\.gov/pubmed\?.*?term=([^&]+)#",
        "#http://www\.ncbi\.nlm\.nih\.gov/pmc\?.*?term=([^&]+)#",
        "#http://academic.research.microsoft.com/Search\?query=([^&]+)#"
        );

    public function isSearchUrl($url){
        if (strpos($url, "http") === 0) {
            foreach($this->queryRegexes as $k => $regex){
                if (preg_match($regex, $url)){
                    return true;
                }
            }
        }
        else {
            throw new Exception("That's not a url.");
        }
        return false;
    }

    public function parseSerps(SerpCollection $serpCollection){
        $lines = parent::getLinesArray();
        foreach ($lines as $k => $line) {
            $fields = explode("\t", $line);
            if ($fields[0] == "Show" && $this->isSearchUrl($fields[3])) {
                // the thisSerp object is passed by reference; we're working directly
                // on the one in the serpCollection here.
                $thisSerp = $serpCollection->getSerpFromUrl($fields[3]);
                // logic to add the query to $thisSerp goes here
            }
            // logic to add clicked urls to $thisSerp goes here

        }
        return $serpCollection;
    }

}
?>
