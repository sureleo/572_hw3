$(document).on('ready', function(){
    var width = 960;
    var height = 960;
    var projection = d3.geo.mercator().scale(
            (width + 1) / 2 / Math.PI
        ).translate(
            [width / 2, height / 2]
        ).precision(.1);

    var color = d3.scale.category10();
    var graticule = d3.geo.graticule();

    var path = d3.geo.path().projection(projection);

    var svg = d3.select("body").append("svg").attr(
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

    d3.json("readme-world.json", function(error, world) {
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
        });
    });
    d3.select(self.frameElement).style("height", height + "px");
});
