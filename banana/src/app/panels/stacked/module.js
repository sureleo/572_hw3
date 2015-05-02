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

  var module = angular.module('kibana.panels.stacked', []);
  app.useModule(module);

  module.controller('stacked', function($scope, dashboard, querySrv, filterSrv) {
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
            // !!!This line is important!!
            $scope.data = [{
            "Arctic#1975":202,"Arctic#1985":235,"Arctic#1995":305,"Arctic#2005":295,
            "Australia#1975":90,"Australia#1985":178,"Australia#1995":209,"Australia#2005":210,
            "alaska#1975":100,"alaska#1985":150,"alaska#1995":260,"alaska#2005":220,
            "United States#1975":89,"United States#1985":130,"United States#1995":160,"United States#2005":205,
            "Cambridge#1975":58,"Cambridge#1985":59,"Cambridge#1995":79,"Cambridge#2005":109,
            "Berlin#1975":10,"Berlin#1985":70,"Berlin#1995":120,"Berlin#2005":98,
        
    },['Arctic','Australia','alaska','United States','Cambridge','Berlin']];

            $scope.render();
        });

        // Hide the spinning wheel icon
        $scope.panelMeta.loading = false; 
    };

  });

    module.directive('stackedChart', function() {
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
                    console.log( "12312312" );

                    /*
                    All your d3 code should add here.
                    */
                    
                    var parent_width = element.parent().width(),
                        height = parseInt(scope.row.height),
                        width = parent_width - 20;


                    
                    var svg = d3.select(element[0]).append('svg')
                                .attr('width', width)
                                .attr('height', height)
                                .append("g");
//                                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                    
//                    var svg = d3.select(element[0]).append("svg")
//                        .attr("width", width + margin.left + margin.right)
//                        .attr("height", height + margin.top + margin.bottom)
//                      .append("g")
//                        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
//                    
                    
                    console.log(scope.data)
                    dic =scope.data[0]
                    loc =scope.data[1]
                    count=0
                    
                    var margin = {top: 40, right: 10, bottom: 20, left: 10},
                        width = width - margin.left - margin.right,
                        height = height - margin.top - margin.bottom;

                    var n = 4, // number of layers
                        m = 6, // number of samples per layer
                        stack = d3.layout.stack(),
                        layers = stack(d3.range(n).map(function() { return bumpLayer(m, .1); })),
                        yGroupMax = d3.max(layers, function(layer) { return d3.max(layer, function(d) { return d.y; }); }),
                        yStackMax = d3.max(layers, function(layer) { return d3.max(layer, function(d) { return d.y0 + d.y; }); });



                    var x = d3.scale.ordinal()
                        .domain(d3.range(m))
                        .rangeRoundBands([0, width], .08);

                    var y = d3.scale.linear()
                        .domain([0, yStackMax])
                        .range([height, 0]);

                    var color = d3.scale.linear()
                        .domain([0, n - 1])
                        .range(["#aad", "#556"]);

                    var xAxis = d3.svg.axis()
                        .scale(x)
                        .tickSize(0)
                        .tickPadding(6)
                        .orient("bottom")
                        .tickFormat(function(d) { return loc[d] });


                    var layer = svg.selectAll(".layer")
                        .data(layers)
                      .enter().append("g")
                        .attr("class", "layer")
                        .style("fill", function(d, i) { return color(i); });

                    var rect = layer.selectAll("rect")
                        .data(function(d) { return d; })
                      .enter().append("rect")
                        .attr("x", function(d) { return x(d.x); })
                        .attr("y", height)
                        .attr("width", x.rangeBand())
                        .attr("height", 0);

                    rect.transition()
                        .delay(function(d, i) { return i * 10; })
                        .attr("y", function(d) { return y(d.y0 + d.y); })
                        .attr("height", function(d) { return y(d.y0) - y(d.y0 + d.y); });

                    svg.append("g")
                        .attr("class", "x axis")
                        .attr("transform", "translate(0," + height + ")")
                        .call(xAxis);

                    d3.selectAll("input").on("change", change);

                    var timeout = setTimeout(function() {
                      d3.select("input[value=\"grouped\"]").property("checked", true).each(change);
                    }, 2000);

                    function change() {
                      clearTimeout(timeout);
                      if (this.value === "grouped") transitionGrouped();
                      else transitionStacked();
                    }

                    function transitionGrouped() {
                      y.domain([0, yGroupMax]);

                      rect.transition()
                          .duration(500)
                          .delay(function(d, i) { return i * 10; })
                          .attr("x", function(d, i, j) { return x(d.x) + x.rangeBand() / n * j; })
                          .attr("width", x.rangeBand() / n)
                        .transition()
                          .attr("y", function(d) { return y(d.y); })
                          .attr("height", function(d) { return height - y(d.y); });
                    }

                    function transitionStacked() {
                      y.domain([0, yStackMax]);

                      rect.transition()
                          .duration(500)
                          .delay(function(d, i) { return i * 10; })
                          .attr("y", function(d) { return y(d.y0 + d.y); })
                          .attr("height", function(d) { return y(d.y0) - y(d.y0 + d.y); })
                        .transition()
                          .attr("x", function(d) { return x(d.x); })
                          .attr("width", x.rangeBand());
                    }

                    // Inspired by Lee Byron's test data generator.
                    function bumpLayer(n, o) {
                        var a = [], i;
                        times=[1975,1985,1995,2005]
                        time=times[count]
                        count+=1
                            for (var j=0;j<20;j++){
                                loca=loc[j]
                                if (loca=='Earth'){
                                    continue
                                }
                                if (dic[loca+'#'+time]){
                                    a.push(dic[loca+'#'+time])
                                }
                                else{
                                    a.push(0)
                                }
                            }
                        console.log(loc)
                        console.log(a)
                    //    for (i = 0; i < n; ++i) a[i] = o + o * Math.random();
                    //    for (i = 0; i < 5; ++i) bump(a);
                        return a.map(function(d, i) { return {x: i, y: Math.max(0, d)}; });

                    }

                    
                    

               
                }
            }
        };
    });

});