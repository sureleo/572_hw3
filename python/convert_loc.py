import json

with open("full_places.json") as jf:

    data = json.loads( jf.read() )
    ret = {}
    for d in data:
        ret[d["name"]] = ( d["coordinate"]["latitude"], d["coordinate"]["longitude"] )


    wf = open( "location_coord_map.json", "w" )
    wf.write( json.dumps(ret) )
