<?php
class Serp {
    private $query;
    private $url;
    private $pageContent;
    private $resultsClicked;

    function __construct() {
        $this->resultsClicked = array();
    }

    public function getQuery() {
        return $this->query;
    }

    public function getResultsClicked() {
        return $this->resultsClicked;
    }

    public function setUrl($url) {
        $this->url = $url;
    }
    public function getUrl() {
        return $this->url;
    }

    public function setPageContent($pageContent) {
        $this->pageContent = $pageContent;
    }

    public function addClickedResult($url){
        $this->resultsClicked[] = $url;
    }
}
?>
