import math
import json
import urllib2
from geopy.geocoders import Nominatim

location_map = {}
useless = set()

def doQuery():
    content_base = "http://localhost:8983/solr/collection1/select?q=*%3A*"
    content_base += "&wt=json&rows=50278"
    print content_base
    json_data = json.load(urllib2.urlopen(content_base))
    return json_data

def parseJson(json_data):
    response = json_data["response"]
    docs = response["docs"]
    for i in xrange(len(docs)):
        if "location" in docs[i]:
            locations = docs[i]["location"]
            for loc in locations:
                try:
                    if loc in location_map:
                        location_map[loc] += 1
                    else:
                        location_map[loc] = 1
                except:
                    print "error" 
    print len(location_map)

def mapLatitude():
    coord_map = {}
    counter = 0
    for i in xrange(60, 91):
        for j in xrange(-180, 181):
            coord_map[str(i) + " " + str(j)] = 0
    for i in xrange(-90, -59):
        for j in xrange(-180, 181):
            coord_map[str(i) + " " + str(j)] = 0

    for key in location_map:
        if key not in useless:
            geolocator = Nominatim()
        try:
            location = geolocator.geocode(key, timeout=10)
            if location == None:
                useless.add(key)
                print "cant resolve " + key
            else:
                latitude = str(int(math.ceil(location.latitude)))
                longitude = str(int(math.ceil(location.longitude)))
                lat_long = latitude + " " + longitude
                print lat_long
                if lat_long in coord_map:
                    coord_map[lat_long] += location_map[key]
                    print "add new key " + location_map[key]
                else:
                    print "not in polar" + key
                    useless.add(key)
        except:
            useless.add(key)
            print "service timeout: " + key

        counter += 1
        print (counter, len(location_map))
    return coord_map

if __name__ == "__main__":
    json_data = doQuery()
    parseJson(json_data)
    f = open('coord_loc_amend.json', 'w+')
    f.write(json.dumps(mapLatitude(), sort_keys=True, indent=4))
    f.close()
