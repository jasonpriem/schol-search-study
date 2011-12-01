<?php
class ActivityLog extends Log {
    private $queryRegexes = array(
        "/http://google.com/\?/",
        "/http://scholar.google.com/scholar\?/",
        "/http://www.ncbi.nlm.nih.gov/pubmed\?/",
        "/http://www.ncbi.nlm.nih.gov/pmc/\?/",
        "/http://academic.research.microsoft.com/Search\?/"
        );

    public function getPageClicks(){
        $pageClicks = array();
        $lines = parent::getLinesArray();
        foreach ($lines as $k => $line) {
            $fields = explode("\t", $line);
            if ($fields[0] == "Show") {
                $myUrl = $fields[3];
                if (!isset($pageClicks[$myUrl])){
                    $pageClicks[$myUrl] = array();
                } 
            }
        }
        
        return $pageClicks;
    }

}
?>
