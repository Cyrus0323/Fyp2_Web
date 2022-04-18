import { proxy } from 'valtio'

const initialValue = {
  isLoggedIn: false,
  modalVisible: false,
  selectedRow: null,
  isLoading: false,
  patientKey: [],
  refresh: 0
}

const globalStore = proxy({ ...initialValue })

export const checkAuthorization = () => {
  if (sessionStorage.length > 0) {
    globalStore.isLoggedIn = true
  } else {
    globalStore.isLoggedIn = false
  }
}

export default globalStore
