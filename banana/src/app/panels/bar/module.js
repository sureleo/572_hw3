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

  var module = angular.module('kibana.panels.bar', []);
  app.useModule(module);

  module.controller('bar', function($scope, dashboard, querySrv, filterSrv) {
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
      field: 'attr_height',
      max_rows: 10,
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
        // if (filterSrv.getSolrFq() && filterSrv.getSolrFq() != '') {
        //     fq = '&' + filterSrv.getSolrFq();
        // }
        var wt = '&wt=json';
        var fl = '&fl=' + $scope.panel.field;
        var rows_limit = '&rows=' + $scope.panel.max_rows;

        $scope.panel.queries.query = querySrv.getQuery(0) + fq + fl + wt + rows_limit;
            console.log( $scope.panel.queries.query );

        // Set the additional custom query
        if ($scope.panel.queries.custom != null) {
            request = request.setQuery($scope.panel.queries.query + $scope.panel.queries.custom);
        } else {
            request = request.setQuery($scope.panel.queries.query);
        }

        // Execute the search and get results
        var results = request.doSearch();
        /*
        !!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        !Parse your result data here!
        !!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        */
        // Populate scope when we have results
        results.then(function(results) {
            $scope.data = {};
            console.log( results );  
            var parsedResults = d3.csv.parse(results, function(d) {
                console.log(d)
                d[$scope.panel.field] = +d[$scope.panel.field]; // coerce to number
                return d;
            });
            parsedResults = [ 1, 10, 3, 5 ];
            //$scope.data = _.pluck(parsedResults,$scope.panel.field);

            // !!!This line is important!!
            $scope.data = [ 1, 10, 3, 5, 7, 9 ];
            $scope.render();
        });

        // Hide the spinning wheel icon
        $scope.panelMeta.loading = false; 
    };

     $scope.init();
  });

    module.directive('barChart', function() {
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

                    /*
                    All your d3 code should add here.
                    */

                    var parent_width = element.parent().width(),
                        height = parseInt(scope.row.height),
                        width = parent_width - 20,
                        barHeight = height / scope.data.length;

                    var x = d3.scale.linear()
                            .domain([0, d3.max(scope.data)])
                            .range([0, width]);

                    var chart = d3.select(element[0]).append('svg')
                                .attr('width', width)
                                .attr('height', height)

                    var bar = chart.selectAll('g')
                                .data(scope.data)
                              .enter().append('g')
                                .attr('transform', function(d,i) {
                                    return 'translate(0,' + i * barHeight + ")";
                                });

                    bar.append('rect')
                        .attr('width', x)
                        .attr('height', barHeight - 1);

                    bar.append('text')
                        .attr('x', function(d) { return x(d) - 3; })
                        .attr('y', barHeight / 2)
                        .attr('dy', '.35em')
                        .text(function(d) { return d; });
                }
            }
        };
    });

});