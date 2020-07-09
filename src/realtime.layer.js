import {ADL_EXTENT} from './constants'
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
const POINT_RADIUS = 7
let startAnimation


export const prepareRTAgentLayer = function(map) {
  const agentPositions = new Position(FEATURE_COUNT)
  agentPositions.init(ADL_EXTENT)

  const agentsLayer = new VectorLayer({
    source: new VectorSource({
      features: agentPositions.getPositions(),
    }),
    disableHitDetection: true,
  })

  const positionStyle = new Style({
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
      radius: POINT_RADIUS - 1
    })
  })

// Compute animation on each frame
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

        // draw trainee
        const steps = [5, 10, 15, 25, 40, 60]
        vectorContext.setStyle(traineeStyle)
        steps.forEach(ratio => {
          if (ratio >= 15) {
            vectorContext.setStyle(traineeStyle2)
          }
          vectorContext.drawGeometry(new Point([newPos[0] - (dX * ratio / 100), newPos[1] - (dY * ratio / 100)]))
        })

        vectorContext.setStyle(positionStyle)
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

  return agentsLayer
}
