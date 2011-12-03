<?php

class ActivityLogEvent {
    private $str;
    private $queryRegexes = array(
        "Google" =>     "#http://www\.google\.com/search\?q=([^&]+)#",
        "gScholar" =>   "#http://scholar\.google\.com/scholar\?q=([^&]+)#",
        "PubMed" =>     "#http://www\.ncbi\.nlm\.nih\.gov/pubmed\?.*?term=([^&]+)#",
        "PMC" =>        "#http://www\.ncbi\.nlm\.nih\.gov/pmc\?.*?term=([^&]+)#",
        "msAcademic"=>  "#http://academic.research.microsoft.com/Search\?query=([^&]+)#"
        );
    function __construct($str) {
        $this->str = $str;
    }

    public function isFocus() {
        $fields = explode("\t", $this->str);
        return ($fields[0] === "Focus");
    }

    public function isClick() {
        $fields = explode("\t", $this->str);
        return (in_array($fields[0], array('RClick', 'MClick', 'LClick')));
    }
    public function hasSearchUrl() {
        $both = $this->getQueryAndSearchEngineName();
        return isset($both[0]);
    }

    public function getUrl() {
        // annoyingly, we can't be sure what col the url is in, so we have to regex
        preg_match('#https*://.+#', $this->str, $m);
        $url = ( isset($m[0]) ) ? $m[0] : null;
        return $url;
    }
    
    private function getQueryAndSearchEngineName() {
        $url = $this->getUrl();
        if (isset($url)) {
            foreach ($this->queryRegexes as $searchEngineName => $regex){
                preg_match($regex, $url, $m);
                if (isset($m[1])) return array($searchEngineName, $m[1]);
            }
        }
        return array(null, null);
    }

    public function getQuery() {
        $both = $this->getQueryAndSearchEngineName();
        return $both[1];
    }

    public function getTimestamp() {
        preg_match('#\b\d{10,}\b#', $this->str, $m);
        if (!isset($m[0])) {
            throw new Exception("This event doesn't have a timestamp: " . $this->str);
        }
        return $m[0];
    }

    public function getSearchEngingName() {
        $both = $this->getQueryAndSearchEngineName();
        return $both[0];
    }

}
?>
