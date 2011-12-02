<?php

class SerpFactory {
    public static $queryRegexes = array(
        "Google" =>     "#http://www\.google\.com/search\?q=([^&]+)#",
        "gScholar" =>   "#http://scholar\.google\.com/scholar\?q=([^&]+)#",
        "PubMed" =>     "#http://www\.ncbi\.nlm\.nih\.gov/pubmed\?.*?term=([^&]+)#",
        "PMC" =>        "#http://www\.ncbi\.nlm\.nih\.gov/pmc\?.*?term=([^&]+)#",
        "msAcademic"=>  "#http://academic.research.microsoft.com/Search\?query=([^&]+)#"
        );
    static function make($url) {
        if (strpos($url, "http") !== 0) {
            throw new Exception("'$url' isn't a url");
        }
        foreach(self::$queryRegexes as $searchEngineName => $regex){
            if (preg_match($regex, $url, $m)){
                $serp = new Serp();
                $serp->setUrl($url);
                $serp->setQuery($m[1]);
                $serp->setSearchEngineName($searchEngineName);
                return $serp;
            }
        }        
        return false;
    }

}
?>
