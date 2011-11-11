<?php
class Log {
    protected $str;
    protected $lines;
    
    function __construct($str) {
        $this->str = $str;
        $this->makeLines($str);
    }

    private function makeLines($string) {
        $this->lines = explode("\n", $string);
    }
}



?>
