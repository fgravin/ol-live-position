import {ADL_EXTENT} from './constants'
import VectorSource from 'ol/source/Vector'
import {Position} from './position'
import VectorLayer from 'ol/layer/Vector'
import {RegularShape} from 'ol/style'
import Fill from 'ol/style/Fill'
import Style from 'ol/style/Style'

const FEATURE_COUNT = 15
const INTERVAL_TIME = 3000
let startAnimation

export const prepareIntervalAgentLayer = function(map) {
  const agentPositions = new Position(FEATURE_COUNT)
  agentPositions.init(ADL_EXTENT)

  const triangle = new RegularShape({
    fill: new Fill({color: 'blue'}),
    points: 3,
    radius: 14,
  })
  const style = new Style({
    image: triangle
  })
  const styleFn = function(feature) {
    const p1 = feature.getGeometry().getCoordinates()
    const p0 = feature.get('lastCoord')

    if(p0) {
      const rotation = Math.PI / 2 + Math.atan2(p0[1] - p1[1], p0[0] - p1[0])
      style.getImage().setRotation(-rotation)
      return style
    }
  }

  const agentsLayer = new VectorLayer({
    source: new VectorSource({
      features: agentPositions.getPositions(),
    }),
    disableHitDetection: true,
    style: styleFn
  })

  // Enlarge triangle to give direction
  const image = triangle.getImage()
  const ctx = image.getContext('2d')
  const c2 = document.createElement('canvas')
  c2.width = c2.height = image.width
  c2.getContext('2d').drawImage(image, 0, 0)
  ctx.clearRect(0, 0, image.width, image.height)
  ctx.drawImage(c2, 0, 0, image.width, image.height, 6, 0, image.width - 12, image.height)
  // ***

  setInterval(() => {
    agentPositions.updatePositions()
    agentsLayer.getSource().clear()
    agentsLayer.getSource().addFeatures(agentPositions.getPositions())
    startAnimation = new Date().getTime()
    agentsLayer.changed()
  }, INTERVAL_TIME)

  return agentsLayer
}
