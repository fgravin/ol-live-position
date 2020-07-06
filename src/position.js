import {GeoJSON} from 'ol/format'

const random = require('geojson-random');

export class Position {

  constructor(count) {
    this.count = count
    this.entities = {}
  }

  init(extent) {
    this.randomPositions(extent)
  }

  getPositions() {
    return Object.values(this.entities)
  }

  randomPositions(extent) {
    const features = this.toOlFeatures(random.point(this.count, extent))
    this.entities = features.reduce((acc, feature, i) => {
      feature.setId(i)
      acc[i] = feature
      return acc
    }, {})
  }

  updatePositions() {
    this.randomMovement(this.count).forEach( move => {
      const feature = this.entities[move.id]
      this.updateGeom(feature, move)
    })
  }

  updateGeom(feature, delta) {
    const geom = feature.getGeometry()
    const coordinates = geom.getCoordinates()
    feature.set('lastCoord', coordinates)
    geom.setCoordinates([coordinates[0] + delta.dX, coordinates[1] + delta.dY])

  }

  randomMovement() {
    return [...Array(this.count).keys()].map(elt => {
      return {
        id: elt,
        dX: Math.floor(Math.random() * 1000) - 500,
        dY: Math.floor(Math.random() * 1000) - 500
      }
    })
  }

  toOlFeatures(geojson) {
    const format = new GeoJSON()
    return format.readFeatures(geojson, {
      featureProjection: 'EPSG:3857',
      dataProjection: 'EPSG:3857',
    })
  }
}