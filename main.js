import './style.css';
import './ol-layerswitcher/dist/ol-layerswitcher.css';
import {Map, View} from './ol';
import TileLayer from './ol/layer/Tile';
import OSM from './ol/source/OSM';
import GeoJSON from './ol/format/GeoJSON';
import VectorLayer from './ol/layer/Vector';
import VectorSource from './ol/source/Vector';
import {Fill, Stroke, Style} from './ol/style';



import LayerSwitcher from './ol-layerswitcher';
import { BaseLayerOptions, GroupLayerOptions } from './ol-layerswitcher';
import TileWMS from './ol/source/TileWMS';


const view = new View({
  center: [-9920914.790650634, 4889523.777846614],
  zoom: 4,
  extent: [-10620914.341856, 4289523.777846614, -9120914.790650634, 5289523.777846614],
});

// Layers
const usaceLeveedAreas = new TileLayer({
  title: "USACE Leveed Areas Boundaries",
  source: new TileWMS({
    url: 'http://localhost:8080/geoserver/wms',
    params: {'LAYERS': 'cite:leveedAreasUSACE', 'TILED': true},
    serverType: 'geoserver',
    transition: 0,
  }),
})
const illinoisCounties = new TileLayer({
  title: "Illinois Counties",
  source: new TileWMS({
    url: 'http://localhost:8080/geoserver/wms',
    params: {'LAYERS': 'cite:illinoisCounties', 'TILED': true},
    serverType: 'geoserver',
    transition: 0
  }),
  
})



const map = new Map({
  target: 'map',
  layers: [
    new TileLayer({
      source: new OSM()
    }),

    new VectorLayer({
      title:'Boundaries From Document',
      source: new VectorSource({
        url: "http://localhost:8080/geoserver/cite/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=cite%3AIadd_Source_Final&maxFeatures=1000&outputFormat=application%2Fjson",
        format: new GeoJSON({
          defaultDataProjection: 'EPSG:4326'
        }),
        wrapX: false,    
      }, {
        name: 'Drainage District Boundaries From Docs',
        tileOptions: {crossOriginKeyword: 'anonymous'},
        transitionEffect: null
      }, ),  style: new Style({
        stroke: new Stroke({
          color: 'rgba(0, 136, 136, 0.8)',
        }),
        fill: new Fill({
          color: 'rgba(80, 136, 136, 0.8)',
        }),
      }),
    }),
    new VectorLayer({
      title:'Other Sourced Drainage Districts',
      source: new VectorSource({
        url: "http://localhost:8080/geoserver/cite/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=cite%3AOtherSource_DD_4326&maxFeatures=1000&outputFormat=application%2Fjson",
        format: new GeoJSON({
          defaultDataProjection: 'EPSG:4326'
        }),
        wrapX: false,    
      }, {
        name: 'Drainage Districts - Other Sources',
        tileOptions: {crossOriginKeyword: 'anonymous'},
        transitionEffect: null
      }, ), style: new Style({
        stroke: new Stroke({
          color: 'rgba(0, 136, 136, 0.8)',
        }),
        fill: new Fill({
          color: 'rgba(0, 50, 136, 0.8)',
        }),
      }),
    }),  
    new VectorLayer({
      title:'Legally Described Drainage Districts',
      source: new VectorSource({
        url: "http://localhost:8080/geoserver/cite/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=cite%3AIADD Doc Legal Description&maxFeatures=1000&outputFormat=application%2Fjson",
        format: new GeoJSON({
          defaultDataProjection: 'EPSG:4326'
        }),
        wrapX: false,    
      }, {
        name: 'Drainage Districts - Legally Described',
        tileOptions: {crossOriginKeyword: 'anonymous'},
        transitionEffect: null
      }, ), style: new Style({
        stroke: new Stroke({
          color: 'rgba(0, 136, 136, 0.8)',
        }),
        fill: new Fill({
          color: 'rgba(0, 136, 50, 0.8)',
        }),
      }),
    }), usaceLeveedAreas, illinoisCounties,
  ],
  view: view,
});


//LayerSwitcher
const layerSwitcher = new LayerSwitcher({
  reverse: true,
  groupSelectStyle: 'group'
});
map.addControl(layerSwitcher);

const featureOverlay = new VectorLayer({
  source: new VectorSource(),
  map: map,
  style: new Style({
    stroke: new Stroke({
      color: 'rgba(255, 255, 255, 0.7)',
      width: 2,
    }),
  }),
});

//highlight and provide name
let highlight;
const displayFeatureInfo = function (pixel) {
  const feature = map.forEachFeatureAtPixel(pixel, function (feature) {
    return feature;
  });

  const info = document.getElementById('info');
  if (feature) {
    info.innerHTML = feature.get('name' )  || '&nbsp;';
  } else {
    info.innerHTML = '&nbsp;';
  }

  if (feature !== highlight) {
    if (highlight) {
      featureOverlay.getSource().removeFeature(highlight);
    }
    if (feature) {
      featureOverlay.getSource().addFeature(feature);
    }
    highlight = feature;
  }
};

map.on('pointermove', function (evt) {
  if (evt.dragging) {
    return;
  }
  const pixel = map.getEventPixel(evt.originalEvent);
  displayFeatureInfo(pixel);
});

map.on('click', function (evt) {
  displayFeatureInfo(evt.pixel);
});