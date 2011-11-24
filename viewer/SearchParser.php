<?php

class SearchParser {
    private $str;
    
    public function __construct($str) {
        $this->str = $str;
    }
    public function getTimestamp() {
        preg_match("/(?<=ID=)\d+/", $this->str, $m);
        return $m[0];
    }
    public function getUrl(){
        preg_match("/(?<=URL=).+/", $this->str, $m);
        return $m[0];
        
    }
    public function getPageContent(){
        preg_match("/Length=\d+(.+)/s", $this->str, $m);
        return $m[1];
        
    }
    public function getQuery(){
        $url = $this->getUrl();
        $q = $url;
        if (strpos($url, "//google.com")){
            echo " " . (strpos($this->str, "//google.com")) . " ";
            preg_match('/q=([^&]+)/', $url, $m);
            $q = urldecode($m[1]);
        }
        else if (strpos($url, "//scholar.google.com")){
            preg_match('/q=([^&]+)/', $url, $m);
            $q = urldecode($m[1]);
        }
        return $q;
    }
}

?>
