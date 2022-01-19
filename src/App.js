import './App.less'
import { firebase } from './firebase/firebase'

function App() {
  const db = firebase.database()
  db.ref('Users').on('value', (snapshot) => {
    console.log(snapshot.val())
  })

  db.ref('Users').set('Hello world')

  return <div>Hello World</div>
}

export default App
