import {Map, View} from 'ol'
import TileLayer from 'ol/layer/Tile'
import XYZ from 'ol/source/XYZ'
import {ADL_CENTER, ADL_EXTENT, ADL_ZOOM} from './constants'
import VectorSource from 'ol/source/Vector'
import {Position} from './position'
import {getVectorContext} from 'ol/render'
import Point from 'ol/geom/Point'
import VectorLayer from 'ol/layer/Vector'
import {Circle, RegularShape} from 'ol/style'
import Fill from 'ol/style/Fill'
import Style from 'ol/style/Style'
import Stroke from 'ol/style/Stroke'

const FEATURE_COUNT = 50
const INTERVAL_TIME = 2000
const POINT_RADIUS = 7

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
})

const agentPositions = new Position(FEATURE_COUNT)
agentPositions.init(ADL_EXTENT)

const agentsLayer = new VectorLayer({
  source: new VectorSource({
    features: agentPositions.getPositions(),
  }),
  disableHitDetection: true,
  /*
    style: new Style({
      image: new Circle({
        stroke: new Stroke({
          color: 'rgba(0,0,255,1)',
          width: 1
        }),
        fill: new Fill({
          color: 'rgba(255,255,255,0.1)'
        })
      })
    })
  */
})


// Enlarge triangle to give direction
const triangle = new RegularShape({
  fill: new Fill({color: 'red'}),
  points: 3,
  radius: 14,
})
const image = triangle.getImage()
const ctx = image.getContext('2d')
const c2 = document.createElement('canvas')
c2.width = c2.height = image.width
c2.getContext('2d').drawImage(image, 0, 0)
ctx.clearRect(0, 0, image.width, image.height)
ctx.drawImage(c2, 0, 0, image.width, image.height, 6, 0, image.width - 12, image.height)


const agentsLayerStylePoint = new Style({
  image: new Circle({
    fill: new Fill({color: 'red'}),
    radius: POINT_RADIUS
  })
})
const traineeStyle = new Style({
  image: new Circle({
    fill: new Fill({color: 'rgba(100,100,100,.8)'}),
    radius: POINT_RADIUS
  })
})

const traineeStyle2 = new Style({
  image: new Circle({
    fill: new Fill({color: 'rgba(100,100,100,.7)'}),
    radius: POINT_RADIUS-2
  })
})

const agentsLayerStyleTriangle = new Style({
  image: triangle
})

map.addLayer(agentsLayer)

agentsLayer.on('postrender', (event) => {

  const vectorContext = getVectorContext(event)
  const frameState = event.frameState
  const layer = event.target

  layer.getSource().forEachFeature(feature => {
    if (startAnimation != undefined) {
      const timeRatio = (frameState.time - startAnimation) / INTERVAL_TIME
      const p1 = feature.getGeometry().getCoordinates()
      const p0 = feature.get('lastCoord')

      const dX = p1[0] - p0[0]
      const dY = p1[1] - p0[1]

      const newPos = [
        dX * timeRatio + p0[0],
        dY * timeRatio + p0[1],
      ]

      //const speed = Math.sqrt(dX*dX+dY*dY) / (INTERVAL_TIME / 3600)
      const steps = [5, 10, 15, 25, 40, 60]
      vectorContext.setStyle(traineeStyle)
      steps.forEach(ratio => {
        if(ratio >= 15) {
          vectorContext.setStyle(traineeStyle2)
        }
        vectorContext.drawGeometry(new Point([newPos[0] - (dX * ratio/100), newPos[1] - (dY * ratio/100)]))
        })
      const rotation = Math.PI / 2 + Math.atan2(p0[1] - p1[1], p0[0] - p1[0])
      agentsLayerStylePoint.getImage().setRotation(-rotation)

      vectorContext.setStyle(agentsLayerStylePoint)
      vectorContext.drawGeometry(new Point(newPos))
    }
  })
  map.render()
})

setInterval(() => {
  agentPositions.updatePositions()
  agentsLayer.getSource().clear()
  agentsLayer.getSource().addFeatures(agentPositions.getPositions())
  startAnimation = new Date().getTime()
  agentsLayer.changed()
}, INTERVAL_TIME)