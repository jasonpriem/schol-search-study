<?php

class Search {
    private $searchParser;
    
    public function __construct($searchParser) {
        $this->searchParser = $searchParser;
    }
    public function render() {
        echo "<ul>";
        echo "<li class='query'>" . $this->searchParser->getQuery() . "</li>";
        $timeString = date('j M', $this->searchParser->getTimestamp());
        echo "<li class='timestamp'>$timeString</li>";
        echo "<li class='serp'>" . $this->searchParser->getPageContent() . "</li>";
    }
    
}

?>
