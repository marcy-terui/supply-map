import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'

firebase.initializeApp({
  apiKey: 'AIzaSyAjRpykXqYSl68rgIdUO81fUU-fiq0zcug',
  authDomain: 'supply-map-1536388233819.firebaseapp.com',
  databaseURL: 'https://supply-map-1536388233819.firebaseio.com',
  projectId: 'supply-map-1536388233819',
  storageBucket: 'supply-map-1536388233819.appspot.com',
  messagingSenderId: '689878998686'
})

const firestore = firebase.firestore()
firestore.settings({
  timestampsInSnapshots: true
})

const authProvider = new firebase.auth.GoogleAuthProvider()

export default {
  auth () {
    firebase.auth().signInWithRedirect(authProvider)
  },
  getCurrentUser () {
    return firebase.auth().currentUser
  },
  queryReports (collection, s, w, n, e) {
    return firestore.collection(collection).where(
      'position', '>', new firebase.firestore.GeoPoint(s, w)
    ).where(
      'position', '<', new firebase.firestore.GeoPoint(n, e)
    ).get()
  },
  addReport (collection, lat, lng, comment, status) {
    return new Promise((resolve, reject) => {
      firestore.collection(collection).where(
        'position', '==', new firebase.firestore.GeoPoint(lat, lng)
      ).get().then((querySnapshot) => {
        if (querySnapshot.empty) {
          return firestore.collection(collection).add({
            position: new firebase.firestore.GeoPoint(lat, lng),
            status: status,
            comments: [{
              timestamp: new Date(),
              comment: comment,
              status: status
            }]
          })
            .then((docRef) => {
              console.log('Document written with ID: ', docRef.id)
              resolve('登録に成功しました。')
            })
            .catch((error) => {
              console.error('Error adding document: ', error)
              reject(error)
            })
        } else {
          querySnapshot.forEach((doc) => {
            let data = doc.data()
            data.comments.unshift({
              timestamp: new Date(),
              comment: comment,
              status: status
            })
            if (data.comments.length > 5) {
              data.comments = data.comments.slice(5)
            }
            data.status = status
            firestore.collection(collection).doc(doc.id).set(data).then(() => {
              console.log('Document written with ID: ', doc.id)
              resolve('登録に成功しました。')
            })
              .catch((error) => {
                console.error('Error updating document: ', error)
                reject(error)
              })
          })
        }
      })
    })
  }
}
