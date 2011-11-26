<?php
class Log {
    protected $str;
    
    function __construct($str) {
        $this->str = $str;
    }

    protected function getLinesArray() {
        return explode("\n", $this->str);
    }
}



?>
