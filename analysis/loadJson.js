function loadJSON(path, callback) {
  const xObj = new XMLHttpRequest();
  xObj.overrideMimeType("application/json");
  xObj.open('GET', path, true); // Replace 'appDataServices' with the path to your file
  xObj.onreadystatechange = function () {
    if (xObj.readyState == 4 && xObj.status == "200") {
      // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
      callback(xObj.responseText);
    }
  };
  xObj.send(null);
}