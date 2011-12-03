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
        return end($this->serps);
    }
    public function getSerpByUrl(ActivityLogEvent $event){
        foreach ($this->serps as $k => &$thisSerp){
            if ($thisSerp->getUrl() === $event->getUrl()) {
                return $thisSerp;
            }
        }
        return null;
    }

    public function createSerp(ActivityLogEvent $activityLogEvent){
        $serp = SerpFactory::make($activityLogEvent);
        return $this->addSerp($serp);
    }

    public function renderAsUl(){
        echo "<ul>";
        foreach ($this->serps as $k => $serp) {
            $serp->render();
        }
        echo "</ul>";
    }

    public function fillFromActivityLog(ActivityLog $activityLog) {
        foreach ($activityLog as $k => $event){
            if ($event->isFocus() && $event->hasSearchUrl()) {
                $serp = $this->getSerpByUrl($event); // get the serp if we've already saved it
                if (!isset($serp)) {
                    $serp = $this->createSerp($event); // make a new serp if we don't have this one yet
                }
            }
            else if ($event->isClick()) {
                $serp->addClickedResult($event->getUrl());
            }
        }
    }
}
?>
