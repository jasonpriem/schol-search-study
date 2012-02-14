<?php
class Serp {
    private $query;
    private $url;
    private $pageContent;
    private $resultsClicked;
    private $searchEngineName;
    private $timestamp;

    function __construct() {
        $this->resultsClicked = array();
    }
    public function getQuery() {
        return $this->query;
    }
    public function getTimestamp() {
        return $this->timestamp;
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
    public function setTimestamp($timestamp) {
        $this->timestamp = $timestamp;
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
    public function render() {
        $url = urldecode($this->url);
        $query = urldecode($this->query);
        echo "<li class='serp'>";
        echo "<p><span class='search-engine-name ";
        echo ($this->searchEngineName == "Google") ? "" : "scholarly";
        echo "'>{$this->searchEngineName}</span>";
        echo "<span class='link-info'>";
            echo "<span class='date'>".date("H:i, M j", $this->timestamp / 1000)."</span>";
            echo "<a href='$url'>$query</a>";
        echo "</span>";
        echo "<ul class='results-clicked'>";
        foreach ($this->resultsClicked as $k => $resultUrl){
            $decodedResultUrl = urldecode($resultUrl);
            echo "<li><a href='$resultUrl'>$decodedResultUrl</a></li>";
        }
        echo "</ul>";
        echo "</li>";
    }
}
?>