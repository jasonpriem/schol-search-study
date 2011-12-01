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
    private function getExtantSerpFromUrl($url){
        foreach ($this->serps as $k => &$thisSerp){
            if ($thisSerp->getUrl() === $url) {
                return $thisSerp;
            }
        }
        return false;
    }
    /**
     * Gets or makes-then-gets a Serp object with a given URL field.
     * If the Serp with the given URL is in the collection, this gets it;
     *  otherwise, it makes a new one, adds the URL, adds it to the collection, then gets it.
     *
     * @param String $url
     * @return Object a Serp object that has that URL
     */
    public function getSerpFromUrl($url){
        if ($this->getExtantSerpFromUrl($url)) {
            return $this->getExtantSerpFromUrl($url);
        }
        else {
            $serp = new Serp();
            $serp->setUrl($url);
            $this->addSerp($serp);
            return $this->getSerpFromUrl($url);
        }
    }
}
?>
