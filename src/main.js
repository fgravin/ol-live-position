import {Map, View} from 'ol'
import TileLayer from 'ol/layer/Tile'
import XYZ from 'ol/source/XYZ'
import {ADL_CENTER, ADL_EXTENT, ADL_ZOOM} from './constants'
import VectorSource from 'ol/source/Vector'
import {Position} from './position'
import {getVectorContext} from 'ol/render'
import Point from 'ol/geom/Point'
import VectorLayer from 'ol/layer/Vector'
import {Circle} from 'ol/style'
import Fill from 'ol/style/Fill'
import Style from 'ol/style/Style'

const FEATURE_COUNT = 50
const INTERVAL_TIME = 2000

let startAnimation

const map = new Map({
  target: 'map',
  layers: [
    new TileLayer({
      source: new XYZ({
        url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      })
    })
  ],
  view: new View({
    center: ADL_CENTER,
    zoom: ADL_ZOOM
  })
});

const agentPositions = new Position(FEATURE_COUNT)
agentPositions.init(ADL_EXTENT)

const agentsLayer = new VectorLayer({
  source: new VectorSource({
    features: agentPositions.getPositions(),
  }),
  disableHitDetection: true
})

const agentsLayerStyle = new Style({
  image: new Circle({
    fill: new Fill({color: 'red'}),
    radius: 5
  })
})

map.addLayer(agentsLayer)

agentsLayer.on('postrender', (event) => {

  const vectorContext = getVectorContext(event)
  const frameState = event.frameState
  const layer = event.target

  layer.getSource().forEachFeature(feature => {
    if(startAnimation != undefined) {
      const timeRatio = (frameState.time - startAnimation) / INTERVAL_TIME
      const newCoord = feature.getGeometry().getCoordinates()
      const lastCoord = feature.get('lastCoord')

      const dX = newCoord[0] - lastCoord[0]
      const dY = newCoord[1] - lastCoord[1]

      const newPos = [
        dX * timeRatio + lastCoord[0],
        dY * timeRatio + lastCoord[1],
      ]
      vectorContext.setStyle(agentsLayerStyle)
      vectorContext.drawGeometry(new Point(newPos))
    }
  })
  map.render();
})

setInterval(() => {
  agentPositions.updatePositions()
  agentsLayer.getSource().clear()
  agentsLayer.getSource().addFeatures(agentPositions.getPositions())
  startAnimation = new Date().getTime()
  agentsLayer.changed()
}, INTERVAL_TIME)