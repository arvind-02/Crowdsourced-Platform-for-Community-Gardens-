import './Map.css'
import { useEffect, useMemo, useState } from 'react';

const Map = () => {
    const [gardens, setGardens] = useState([]);
    const [currentGarden, setCurrentGarden] = useState(null);

    const atlantaConfig = useMemo(() => ({
        "center": [-84.3880, 33.7490], zoom: 10, view: 'Auto',
        "authOptions": {
            "authType": "subscriptionKey",
            "subscriptionKey": "oJw5kVebBOggGf15Sn_CLR3jIN7xQrQulnRC7567uVc"
        }
    }), []);

    useEffect(() => {
        const getGardens = async () => {
            try {
                let response = await fetch(`/api/garden-get`);
                let json = await response.json();
                setGardens(json);
            } catch (err) {
                console.log(err);
            }
        }
        getGardens();
    }, [setGardens]);

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
                for (var gardenName in gardens) {
                    var garden = gardens[gardenName]
                    var point = new window.atlas.data.Feature(new window.atlas.data.Point([garden.XCOORD, garden.YCOORD]), {
                        name: garden.NAME
                    });
                    datasource.add(point);
                }
                map.events.add('click', resultLayer, function (e) {
                    if (e.shapes && e.shapes.length > 0) {
                        var content, coordinate;
                        var properties = e.shapes[0].getProperties();
                        coordinate = e.shapes[0].getCoordinates();
                        content = `<div class="azurePopup">
                                        <div>${properties.name}</div>
                                   </div>`;
                        if (content && coordinate) {
                            popup.setOptions({ content: content, position: coordinate });
                            popup.open(map);
                            setCurrentGarden(gardens[properties.name]);
                        }
                    }
                });
            })
        }
        createMap();
    }, [gardens, setCurrentGarden, atlantaConfig]);

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