<?php
class Serp {
    private $query;
    private $url;
    private $pageContent;
    private $resultsClicked;
    private $searchEngineName;

    function __construct() {
        $this->resultsClicked = array();
    }

    public function getQuery() {
        return $this->query;
    }

    public function getUrl() {
        return $this->url;
    }

    public function getPageContent() {
        return $this->pageContent;
    }

    public function getResultsClicked() {
        return $this->resultsClicked;
    }
    
    public function getSearchEngineName() {
        return $this->searchEngineName;
    }

    public function setQuery($query) {
        $this->query = $query;
    }

    public function setUrl($url) {
        $this->url = $url;
    }

    public function setPageContent($pageContent) {
        $this->pageContent = $pageContent;
    }

    public function setSearchEngineName($searchEngineName) {
        $this->searchEngineName = $searchEngineName;
    }

     public function addClickedResult($url){
        $this->resultsClicked[] = $url;
    }
}
?>
