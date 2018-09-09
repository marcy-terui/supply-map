export default {
  getCurrentPosition (options) {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, options)
    })
  },
  searchAddress (google, map, address) {
    return new Promise((resolve, reject) => {
      const geocoder = new google.maps.Geocoder()
      geocoder.geocode({'address': address}, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK) {
          map.setCenter(results[0].geometry.location)
          resolve(new google.maps.Marker({
            map: map,
            position: results[0].geometry.location
          }))
        } else {
          console.log('Geocode was not successful for the following reason: ' + status)
        }
      })
    })
  },
  async currentAddress (google, map) {
    const pos = await this.getCurrentPosition()
    return new Promise((resolve, reject) => {
      const latlng = new google.maps.LatLng(
        pos.coords.latitude,
        pos.coords.longitude
      )
      map.panTo(latlng)
      resolve(new google.maps.Marker({
        map: map,
        position: latlng
      }))
    })
  }
}
