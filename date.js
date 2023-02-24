var today = new Date();
exports.getDate = function(){
    var option = {
        weekday: "long",
        day: "numeric",
        month: "long"
    }
    return today.toLocaleDateString("en-US", option);
}
exports.getDay = function(){
    var option = {
        weekday: 'long'
    }
    return today.toLocaleDateString("en-US", option)
}