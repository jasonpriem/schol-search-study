<?php

class SerpCollection implements Iterator {

    private $serps = array();
    private $position = 0;

    public function __construct() {
        $this->position = 0;
    }

    function rewind() {
        $this->position = 0;
    }

    function current() {
        return $this->serps[$this->position];
    }

    function key() {
        return $this->position;
    }

    function next() {
        ++$this->position;
    }

    function valid() {
        return isset($this->array[$this->position]);
    }
    public function addSerp(Serp $serp){
        $this->serps[] = $serp;
    }
    public function getSerpByUrl($url){
        foreach ($this->serps as $k => &$thisSerp){
            if ($thisSerp->getUrl() === $url) {
                return $thisSerp;
            }
        }
        return false;
    }

    public function createSerpByUrl($url){
        $serp = SerpFactory::make($url);
        if ($serp) { // the SerpFactory didn't like the URL...must've been a non-search page
            $this->addSerp($serp);
            return $this->getSerpByUrl($url);
        }
        else {
            return false;
        }
    }
}
?>
