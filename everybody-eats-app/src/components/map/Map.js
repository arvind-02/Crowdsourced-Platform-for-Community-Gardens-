import './Map.css'
import { useEffect, useMemo, useState } from 'react';

const Map = () => {
    const [gardens, setGardens] = useState([]);
    const [coordsToNames, setCoordsToNames] = useState({});
    const [currentGarden, setCurrentGarden] = useState(null);
    const [gardenPositions, setGardenPositions] = useState([]);

    const atlantaConfig = useMemo(() => ({
        "center": [-84.3880, 33.7490], zoom: 10, view: 'Auto',
        "authOptions": {
            "authType": "subscriptionKey",
            "subscriptionKey": "oJw5kVebBOggGf15Sn_CLR3jIN7xQrQulnRC7567uVc"
        }
    }), []);
    var subscriptionKeyCredential = new window.atlas.service.SubscriptionKeyCredential(atlantaConfig.authOptions.subscriptionKey);
    var pipeline = window.atlas.service.MapsURL.newPipeline(subscriptionKeyCredential);
    var searchURL = useMemo(() => new window.atlas.service.SearchURL(pipeline), [pipeline]);

    useEffect(() => {
        const getGardens = async () => {
            try {
                let response = await fetch(`/api/garden-get`);
                let json = await response.json();
                setGardens(json);
            } catch (err) {
                console.log(err);
                setGardens({
                    "Bayside": {
                        "NAME": "Bayside", 
                        "ADDRESS": "2949 Bell Blvd. Bayside, NY 11360",
                        "CONTACT_INFO": "test@test.com",
                        "DESCRIPTION": "Lovely site with great greens",
                        "IMAGE_URL": "https://www.gardeningknowhow.com/wp-content/uploads/2013/06/community-garden.jpg"
                    }
                })
            }
        }
        getGardens();
    }, [setGardens]);

    useEffect(() => {
        const getGardenPositions = async () => {
            var newCoordsToNames = coordsToNames;
            var newGardenPositions = gardenPositions;
            for (var gardenName in gardens) {
                var gardenData = gardens[gardenName];
                var query = gardenData["ADDRESS"];
                try {
                    var results = await searchURL.searchAddress(window.atlas.service.Aborter.timeout(10000), query, {
                        limit: 1
                    })
                    var data = results.geojson.getFeatures();
                    newGardenPositions.push(data);
                    if (data["features"]) {
                        newCoordsToNames[data["features"][0]["geometry"]["coordinates"]] = gardenName;
                    }
                } catch (err) {
                    console.log(err);
                }
            }
            setCoordsToNames(newCoordsToNames);
            setGardenPositions(newGardenPositions);
        }
        getGardenPositions();
    }, [gardens, searchURL, coordsToNames, setCoordsToNames, gardenPositions, setGardenPositions]);

    useEffect(() => {
        const createMap = () => {
            var map = new window.atlas.Map("map", {
                center: atlantaConfig.center,
                zoom: atlantaConfig.zoom,
                view: atlantaConfig.view,
                authOptions: atlantaConfig.authOptions
            });
            var datasource = new window.atlas.source.DataSource();
            var resultLayer = new window.atlas.layer.SymbolLayer(datasource, null, {
                iconOptions: {
                    image: 'pin-round-darkblue',
                    anchor: 'center',
                    allowOverlap: true
                },
                textOptions: {
                    anchor: "top"
                }
            });
            var popup = new window.atlas.Popup();
            map.events.add('ready', () => {
                map.sources.add(datasource);
                map.layers.add(resultLayer);
                for (var gardenPosition of gardenPositions) {
                    datasource.add(gardenPosition);
                }
                map.events.add('click', resultLayer, function (e) {
                    if (e.shapes && e.shapes.length > 0) {
                        var content, coordinate;
                        coordinate = e.shapes[0].data.geometry.coordinates;
                        content = `<div class="azurePopup">
                                        <div>${coordsToNames[coordinate]}</div>
                                   </div>`;
                        if (content && coordinate) {
                            popup.setOptions({ content: content, position: coordinate });
                            popup.open(map);
                            setCurrentGarden(gardens[coordsToNames[coordinate]]);
                        }
                    }
                });
            })
        }
        createMap();
    }, [gardenPositions, coordsToNames, gardens, setCurrentGarden, atlantaConfig]);

    return (
        <div className="mapPage">
            <div id="map">

            </div>
            <div className="gardenInfo">
                {(currentGarden) ? (
                    <div className="row">
                        <div className="col-4">
                            <h4>Garden Name</h4>
                            <p>{currentGarden.NAME}</p>
                            <h4>Garden Address</h4>
                            <p>{currentGarden.ADDRESS}</p>
                            <h4>Description</h4>
                            <p>{currentGarden.DESCRIPTION.replaceAll("%0A", "\n")}</p>
                            <p><strong>Please contact {currentGarden.EMAIL} for more information</strong></p>
                        </div>
                        <div className="col-8 imageCol">
                            {(currentGarden.IMAGE_URL) ? (<img src={currentGarden.IMAGE_URL} alt="Community garden" />) : ""}
                        </div>
                    </div>
                ) : ""}
            </div>
        </div>
    );
}

export default Map;