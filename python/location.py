import math
import json
import urllib
import urllib2
from geopy.geocoders import Nominatim

def doQuery():
    initial_url = "http://localhost:8983/solr/collection1/select?"
    params = {
        "wt": "json",
        "rows": "50278",
        "q": "location:*"
    }
    query_string = urllib.urlencode(params)
    json_data = json.load(urllib2.urlopen(initial_url+query_string))
    return json_data

def parseJson(json_data):
    location_map = {}
    response = json_data["response"]
    docs = response["docs"]
    for i in xrange(len(docs)):
        locations = docs[i]["location"]
        for loc in locations:
            try:
                if loc in location_map:
                    location_map[loc] += 1
                else:
                    location_map[loc] = 1
            except:
                print "error"

    return location_map

def mapLatitude(location_map, coord_full_map, coord_high_map):
    useless = set()
    counter = 0
    for key in location_map:
        #handle bad locations
        if key in useless:
            continue

        geolocator = Nominatim()
        try:
            location = geolocator.geocode(key, timeout=10)
            if location == None:
                useless.add(key)
                print "cant resolve " + key
            else:
                latitude = location.latitude
                longitude = location.longitude
                lat_long = str(latitude) + " " + str(longitude)
                print lat_long
                if lat_long in coord_full_map:
                    coord_full_map[lat_long][0] += location_map[key]
                else:
                    coord_full_map[lat_long] = (location_map[key], key)

                if latitude > 60 or latitude < -60:
                    if lat_long in coord_high_map:
                        coord_high_map[lat_long][0] += location_map[key]
                    else:
                        coord_high_map[lat_long] = (location_map[key], key)

        except:
            useless.add(key)
            print "service timeout: " + key

        counter += 1
        print (counter, len(location_map))

def toD3Places(coord_map):
    places = []
    for key in coord_map:
        latitude = float(key.split()[0])
        longitude = float(key.split()[1])
        d = {
            "name": coord_map[key][1],
            "occurrence": coord_map[key][0],
            "coordinate": {
                "latitude": latitude,
                "longitude": longitude
            }
        }
        places.append(d)
    return places


if __name__ == "__main__":
    json_data = doQuery()
    location_map = parseJson(json_data)
    coord_full_map = {}
    coord_high_map = {}
    mapLatitude(location_map, coord_full_map, coord_high_map)
    full_places = toD3Places(coord_full_map)
    lat_high_places = toD3Places(coord_high_map)

    f = open('full_places.json', 'w+')
    f.write(json.dumps(full_places, sort_keys=True, indent=4))
    f.close()

    f = open('high_lat_places.json', 'w+')
    f.write(json.dumps(lat_high_places, sort_keys=True, indent=4))
    f.close()
