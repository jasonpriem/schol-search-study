<?php
class ActivityLog implements Iterator {
    private $array = array();
    private $logStr;
    private $position = 0;

    public function __construct($logStr) {
        $this->logStr = $logStr;
        $this->array = explode("\n", $this->logStr);
        $this->position = 0;
    }

    function rewind() {
        $this->position = 0;
    }

    function current() {
        return new ActivityLogEvent( $this->array[$this->position] );
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


}
?>
