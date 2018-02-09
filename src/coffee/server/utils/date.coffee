module.exports = 
  addDay: (date, value)->
    time = date.getTime()
    dayInMSec = 1000 * 60 * 60 * 24
    new Date time + dayInMSec * value

  strToDate: (str)->
    try
      dtArr = str.split "/"
      dt = new Date "#{dtArr[2]}-#{dtArr[1]}-#{dtArr[0]}"
      return new Date dt.getTime() + dt.getTimezoneOffset() * 60 * 1000
    catch e
      console.log "Não foi possível converter \"#{str}\" em data."

  getDateToFilter: (str)->
    try
      dt = this.addDay this.strToDate(str), -1
      return dt.toISOString().slice(0,10)
    catch e
      console.log e
    
    