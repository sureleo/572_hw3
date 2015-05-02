/*

  ## query

  ### Parameters
  * query ::  A string or an array of querys. String if multi is off, array if it is on
              This should be fixed, it should always be an array even if its only
              one element
*/
define([
    'angular',
    'app',
    'underscore',
    'jquery',
    'd3',
    'd3.tip'
],
function (angular, app, _, $, d3) {

  var module = angular.module('kibana.panels.piechar', []);
  app.useModule(module);

  module.controller('piechar', function($scope, $timeout, dashboard, querySrv, filterSrv) {
   $scope.panelMeta = {
      modals: [
          {
              description: 'Inspect',
              icon: 'icon-info-sign',
              partial: 'app/partials/inspector.html',
              show: $scope.panel.spyable
          }
      ],
      editorTabs: [
          {
              title: 'Queries',
              src: 'app/partials/querySelect.html'
          }
      ],
      status: 'Experimental',
      description: 'Bar module for tutorial'
  };

    // Set and populate defaults
    var _d = {
      /*
        !!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        !Custermized your query here!
        !!!!!!!!!!!!!!!!!!!!!!!!!!!!!
      */
      queries: {
          mode: 'all',
          query: '*:*',
          custom: ''
      },
      field: 'content_type',
      max_rows: 100,
      spyable: true,
      show_queries: true
    };
    _.defaults($scope.panel, _d);

    $scope.init = function() {
        $scope.$on('refresh',function(){
            $scope.get_data();
        });
        $scope.get_data();
    };

    $scope.set_refresh = function(state) {
      $scope.refresh = state;
    };

    $scope.close_edit = function() {
      if ($scope.refresh) {
          $scope.get_data();
      }
      $scope.refresh = false;
      $scope.$emit('render');
    };

    $scope.render = function() {
        $scope.$emit('render');
    };

    $scope.get_data = function() {
        // Show the spinning wheel icon
        $scope.panelMeta.loading = true;

        // Set Solr server
        $scope.sjs.client.server(dashboard.current.solr.server + dashboard.current.solr.core_name);
        var request = $scope.sjs.Request();

        // Construct Solr query
        var fq = '';
        var wt = '&wt=json';
        var fl = '&fl=' + $scope.panel.field;
        var rows_limit = '&rows=' + $scope.panel.max_rows;

        $scope.panel.queries.query = querySrv.getQuery(0) + fq + fl + wt + rows_limit;
        console.log( $scope.panel.queries.query );
        
        request = request.setQuery( $scope.panel.queries.query );
        
        var results = request.doSearch();
        results.then( function(results){
        	$scope.data = [];
        	$scope.render();
        });

        // Hide the spinning wheel icon
        $scope.panelMeta.loading = false; 
    };

  });

    module.directive('pieChart', function() {
        return {
            restrict: 'E',
            link: function(scope, element) {
                scope.$on('render',function(){
                    render_panel();
                });

                // Render the panel when resizing browser window
                angular.element(window).bind('resize', function() {
                    render_panel();
                });

                // Function for rendering panel
                function render_panel() {
                    // Clear the panel
                    element.html('');
                    var parent_width = element.parent().width(),
                        height = parseInt(scope.row.height),
                        width = parent_width - 20;

                    var svg = d3.select(element[0]).append('svg')
                        .attr('width', width)
                        .attr('height', height)
                        .append("g")
                        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
                        
 var radius = Math.min(width, height) / 2,
    innerRadius = 0.3 * radius;

var pie = d3.layout.pie()
    .sort(null)
    .value(function(d) { return d.width; });

 var tip = d3.tip()
   .attr('class', 'd3-tip')
   .offset([0, 0])
   .html(function(d) {
        return d.data.label + ": <span style='color:orangered'>" + d.data.amount + "</span>";
   });

var arc = d3.svg.arc()
  .innerRadius(innerRadius)
  .outerRadius(function (d) { 
    return (radius - innerRadius) * (d.data.score / 100.0) + innerRadius; 
  });

var outlineArc = d3.svg.arc()
        .innerRadius(innerRadius)
        .outerRadius(radius);

// var svg = d3.select("body").append("svg")
//     .attr("width", width)
//     .attr("height", height)
//     .append("g")
//     .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

 svg.call(tip);
   console.log( 1123 );

d3.csv('app/panels/piechar/content_type.csv', function(error, data) {
  data.forEach(function(d) {
    console.log( d );
    d.id     =  d.id;
    d.order  = +d.order;
    d.color  =  d.color;
    d.weight = +d.weight;
    d.score  = +d.score;
    d.width  = +d.weight;
    d.label  =  d.label;
    d.amount = d.amount;
  });
  // for (var i = 0; i < data.score; i++) { console.log(data[i].id) }
  
  var path = svg.selectAll(".solidArc")
      .data(pie(data))
    .enter().append("path")
      .attr("fill", function(d) { return d.data.color; })
      .attr("class", "solidArc")
      .attr("stroke", "gray")
      .attr("d", arc)
       .on('mouseover', tip.show)
       .on('mouseout', tip.hide);

  var outerPath = svg.selectAll(".outlineArc")
      .data(pie(data))
    .enter().append("path")
      .attr("fill", "none")
      .attr("stroke", "gray")
      .attr("class", "outlineArc")
      .attr("d", outlineArc);  


  // calculate the weighted mean score
  var score = 81106; 
    /*data.reduce(function(a, b) {
      //console.log('a:' + a + ', b.score: ' + b.score + ', b.weight: ' + b.weight);
      return a + (b.score * b.weight); 
    }, 0) / 
    data.reduce(function(a, b) { 
      return a + b.weight; 
    }, 0);
*/
  svg.append("svg:text")
    .attr("class", "aster-score")
    .attr("dy", ".35em")
    .attr("text-anchor", "middle") // text-align: right
    .text(Math.round(score));

});
/*
                    var color = d3.scale.category20c(),
                        format = d3.format(",d");

                    var bubble = d3.layout.pack()
                        .sort(null)
                        .size([width, height])
                        .padding(1.5);

                    var node = chart.selectAll(".node")
                        .data(bubble.nodes({"children":scope.data})
                        .filter(function(d) { return !d.children; }))
                        .enter().append("g")
                        .attr("class", "node")
                        .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

                    node.append("circle")
                        .attr("r", function(d) { return d.r; })
                        .style("fill", function(d) { return color(d.name); });
       
                    node.append("title")
                        .text(function(d) { return d.name + ": " + format(d.value); });

                    node.append("text")
                        .attr("dy", ".5em")
                        .style("text-anchor", "middle")
                        .text(function(d) { return d.name.substring(0, d.r / 3); });*/
                }
            }
        };
    });

});
