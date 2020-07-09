import {Map, View} from 'ol'
import TileLayer from 'ol/layer/Tile'
import XYZ from 'ol/source/XYZ'
import {ADL_CENTER, ADL_ZOOM} from './constants'
import {prepareRTAgentLayer} from './realtime.layer'
import {prepareIntervalAgentLayer} from './interval.layer'

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

map.addLayer(prepareRTAgentLayer(map))
map.addLayer(prepareIntervalAgentLayer(map))
