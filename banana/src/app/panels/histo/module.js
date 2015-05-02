

/*
  ## Bar module
  * For tutorial on how to create a custom Banana module.
*/
define([
  'angular',
  'app',
  'underscore',
  'jquery',
  'd3'
],
function (angular, app, _, $, d3) {
  'use strict';

  var module = angular.module('kibana.panels.histo', []);
  app.useModule(module);

  module.controller('histo', function($scope, dashboard, querySrv, filterSrv) {
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
      description: 'Barchart module for tutorial'
    };

    // Define panel's default properties and values
    var _d = {
      queries: {
        mode: 'all',
        query: 'land',
        custom: ''
      },
      field: 'attr_height',
      max_rows: 10,
      spyable: true,
      show_queries: true
    };

    // Set panel's default values
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
//           fq = '&' + filterSrv.getSolrFq();
//       }
      var wt = '&wt=csv';
      var fl = '&fl=' + $scope.panel.field;
      var rows_limit = '&rows=' + $scope.panel.max_rows;

      $scope.panel.queries.query = querySrv.getQuery(0) + fq + fl + wt + rows_limit;

      // Set the additional custom query
      if ($scope.panel.queries.custom != null) {
          request = request.setQuery($scope.panel.queries.query + $scope.panel.queries.custom);
      } else {
          request = request.setQuery($scope.panel.queries.query);
      }

      // Execute the search and get results
      var results = request.doSearch();

      // Populate scope when we have results
      results.then(function(results) {
        $scope.data = {};

        var parsedResults = d3.csv.parse(results, function(d) {
          d[$scope.panel.field] = +d[$scope.panel.field]; // coerce to number
          return d;
        });

        $scope.data = _.pluck(parsedResults,$scope.panel.field);
        $scope.render();
      });

      // Hide the spinning wheel icon
      $scope.panelMeta.loading = false;
    };
  });

  module.directive('histoChart', function() {
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
              margin = {top: 20, right: 40, bottom: 30, left: 20},
              width = parent_width - 20,
              barHeight = height / 14;

		  var x = d3.scale.ordinal().rangeRoundBands([0, width], .05);
          var y = d3.scale.linear().range([height, 0]);

          var svg = d3.select(element[0]).append('svg')
                        .attr('width', width)
                        .attr('height', height)
                        .append("g")
    					.attr("transform", "translate(" +0 + "," + 0 + ")");
		  
		  var values = [0,0,0,0,0,0,0,0,0,0,0,0,0,0];
          var ranges = [1900,1910,1920,1930,1940,1950,1960,1970,1980,1990,2000,2010,2020,2030];

          x.domain(ranges);
          d3.json("./app/panels/histo/oil_content_year.json", function(error, data) {
             					console.log(data);
  					ranges.forEach(function(target, index) {
 
  						for(var i = 0; i < 10; i++) {
        					if(data[(target + i)]) {
  		  						values[index] += data[(target + i)];
  							}
  						}
  					});
  					
  					y.domain([0, d3.max(values)]);
  					var barWidth = width / 14;
  
  					var xAxis = d3.svg.axis().scale(x).orient("bottom");
  		 			svg.append("g")
      					.attr("class", "x axis")
      					.attr("transform", "translate(0," + (height - 19) + ")")
      					.call(xAxis)
    					.selectAll("text")
      					.style("text-anchor", "end")
      					.attr("dx", "1em")
      					.attr("dy", "1em");
      
      				var bar = svg.selectAll("bar")
      					.data(values)
    					.enter().append("g")
      					.attr("transform", function(d, i) { return "translate(" + i * barWidth + ",0)"; });

  					bar.append("rect")
      					.attr("y", function(d) { return y(d) - 10; })
      					.attr("height", function(d) { return height - 10 - y(d); })
      					.attr("width", barWidth - 1);

  					bar.append("text")
      					.attr("x", barWidth / 2)
      					.attr("y", function(d) { return y(d) - 20; })
      					.attr("dy", ".75em")
      					.text(function(d) { return d; });
  			});
        }
      }
    };
  });
});
