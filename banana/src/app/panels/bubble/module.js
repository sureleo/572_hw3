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
    'd3'
],
function (angular, app, _, $, d3) {

  var module = angular.module('kibana.panels.bubble', []);
  app.useModule(module);

  module.controller('bubble', function($scope, $timeout, dashboard, querySrv, filterSrv) {
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
          query: 'land',
          custom: ''
      },
      field: 'content',
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

        var keys = [ 'land', 'sea', 'air', 'maritime' ];
        $scope.data = [];
        var data = {};
        
        angular.forEach( keys, function(k){
          var query_land = "q="+k+"&fq=content&wt=json";

          request = request.setQuery(query_land);
          var results = request.doSearch();

          results.then(function(results) {
              data[k] = results.response.numFound;
          });
        });

        function checkData(){
            angular.forEach( keys, function(k){
              if( data[k] == undefined ){
                $timeout( checkData, 500);
                return;
              }
            });
            angular.forEach( data, function(k,v){
                $scope.data.push( {"name": v, "value": k} );
            });
            $scope.render();
        }

        $timeout( checkData, 500);

        // Hide the spinning wheel icon
        $scope.panelMeta.loading = false; 
    };

  });

    module.directive('bubbleChart', function() {
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

                    var chart = d3.select(element[0]).append('svg')
                        .attr('width', width)
                        .attr('height', height)
                        .attr('class', 'bubble');

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
                        .text(function(d) { return d.name.substring(0, d.r / 3); });
                }
            }
        };
    });

});