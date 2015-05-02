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
    'd3.geo.projection',
    'topojson'
],
function (angular, app, _, $, d3) {
  "use strict";

  var topojson = require('topojson');
  console.log(topojson);

  var module = angular.module('kibana.panels.map', []);
  app.useModule(module);

  module.controller('query2', function($scope, dashboard, querySrv, filterSrv) {
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

                    var width = 960;
                    var height = 960;
                    var projection = d3.geo.mercator().scale(
                            (width + 1) / 2 / Math.PI
                        ).translate(
                            [width / 2, height / 2]
                        ).precision(0.1);
                    var formatNumber = d3.format(",.0f");

                    var color = d3.scale.category10();
                    var graticule = d3.geo.graticule();

                    var place_json = $.ajax({
                        type: 'GET',
                        url: './app/panels/query2/full_places.json',
                        dataType: 'json',
                        success: function() {
                            var placesText = place_json.responseText;
                            var places = jQuery.parseJSON(placesText);
                            var radius = d3.scale.sqrt().domain([0, 1e4]).range([0, 15]);
                            loadD3(radius, places);
                        }
                    });

                    var path = d3.geo.path().projection(projection);

                    var svg = d3.select(element[0]).append("svg").attr(
                        "width", width
                    ).attr(
                        "height", height
                    );

                    svg.append("path").datum(graticule).attr(
                        "class", "graticule"
                    ).attr(
                        "d", path
                    );

                    svg.append("path").datum(graticule.outline).attr(
                        "class", "graticule outline"
                    ).attr(
                        "d", path
                    );

                    var loadD3 = function(radius, places) {
                        //draw the bubble
                        svg.selectAll(".pin").data(places).enter().append(
                            "circle", ".pin"
                        ).sort(
                            function(a, b) {
                                return b.occurrence - a.occurrence;
                            }
                        ).attr(
                            "class", "bubble"
                        ).attr("transform", function(d) {
                            if(Math.abs(d.coordinate.latitude) === 90) {
                                return;
                            }
                            return "translate(" + projection([
                              d.coordinate.longitude,
                              d.coordinate.latitude
                            ]) + ")";
                        }).attr(
                            "r", function(d) {
                                return radius(d.occurrence);
                            }
                        ).append("title").text(
                            function(d) {
                                return d.name + "\nOccurrence " + formatNumber(d.occurrence);
                            }
                        );

                        //d3 map itself.
                        d3.json("./app/panels/query2/readme-world.json", function(error, world) {
                            var countries = topojson.feature(world, world.objects.countries).features;
                            var neighbors = topojson.neighbors(world.objects.countries.geometries);

                            svg.selectAll(".country").data(countries).enter().insert(
                                "path", ".graticule"
                            ).attr(
                                "class", "country"
                            ).attr(
                                "d", path
                            ).style(
                                "fill",
                                function(d, i) {
                                    return color(
                                        d.color = d3.max(
                                            neighbors[i],
                                            function(n) {
                                                return countries[n].color;
                                            }
                                        ) + 1 | 0
                                    );
                                }
                            );
                        });
                        //d3.select(self.frameElement).style("height", height + "px");
                    };
                }
            }
        };
    });
});
