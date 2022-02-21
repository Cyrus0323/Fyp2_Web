export const getTodayDateInString = () => {
  const date = new Date().toDateString()
  const datePart = date.split(' ')
  console.log(datePart)

  return `${datePart[3]}-${getMonthValue(datePart[1])}-${datePart[2]}`
}

const getMonthValue = (month) => {
  switch (month) {
    case 'Jan':
      return '01'
    case 'Feb':
      return '02'
    case 'Mar':
      return '03'
    case 'Apr':
      return '04'
    case 'May':
      return '05'
    case 'Jun':
      return '06'
    case 'Jul':
      return '07'
    case 'Aug':
      return '08'
    case 'Sep':
      return '09'
    case 'Oct':
      return '10'
    case 'Nov':
      return '11'
    case 'Dec':
      return '12'
    default:
      return null
  }
}
