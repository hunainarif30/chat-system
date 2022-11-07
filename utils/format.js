const moment = require("moment/moment");

function format(user, message) {
  return {
    user,
    message,
    time: moment().format("h:mm a"),
  };
}
module.exports = format;
