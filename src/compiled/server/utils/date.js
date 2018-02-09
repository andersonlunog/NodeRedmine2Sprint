(function() {
  module.exports = {
    addDay: function(date, value) {
      var dayInMSec, time;
      time = date.getTime();
      dayInMSec = 1000 * 60 * 60 * 24;
      return new Date(time + dayInMSec * value);
    },
    strToDate: function(str) {
      var dt, dtArr, e;
      try {
        dtArr = str.split("/");
        dt = new Date(`${dtArr[2]}-${dtArr[1]}-${dtArr[0]}`);
        return new Date(dt.getTime() + dt.getTimezoneOffset() * 60 * 1000);
      } catch (error) {
        e = error;
        return console.log(`Não foi possível converter "${str}" em data.`);
      }
    },
    getDateToFilter: function(str) {
      var dt, e;
      try {
        dt = this.addDay(this.strToDate(str), -1);
        return dt.toISOString().slice(0, 10);
      } catch (error) {
        e = error;
        return console.log(e);
      }
    }
  };

}).call(this);
