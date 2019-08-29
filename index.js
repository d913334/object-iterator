const data = require('./source.json');



function update(obj, currentObj, sourcePaths, filters, value, trailPaths) {
  const finishPaths = [].concat(trailPaths || [])
  // console.log("paths", paths);
  const paths = [...sourcePaths];
  const propertyName = paths.splice(0, 1)[0];
  // check if current matching with filter, then going to next level
  finishPaths.push(propertyName);

  console.log("property", propertyName, paths);

  const objectValue = currentObj[propertyName];
  console.log("finishPaths", finishPaths, objectValue);
  if (objectValue == null) {
    console.log("exit")
    return;
  }
  if (paths.length == 0 && !Array.isArray(currentObj)) {
    console.log("UPDATE PROPERTY", currentObj)
    const filterProp = finishPaths.join('.');
    const keys = Object.keys(currentObj).filter(key => {
      const nextKey = filterProp + '.' + key;
      return filters[nextKey] != null;
    });
    console.log("last item - Filter to this level is", filterProp, "matching key", keys)
    if (keys.length > 0) {
      const value = filters[filterProp + '.' + keys[0]];
      console.log("item[keys[0]]", item[keys[0]])
      if (objectValue[keys[0]] !== value) {
        console.log("Skipping xxxxx", objectValue[keys[0]])
        return;
      }
      //veriy if value match
    }
    console.log("set prop", propertyName, value)
    objectValue[propertyName] = value;
    return;
  }
  if (Array.isArray(objectValue)) {
    // loop inside the array
    objectValue.forEach((item) => {
      const filterProp = finishPaths.join('.');
      const keys = Object.keys(item).filter(key => {
        const nextKey = filterProp + '.' + key;
        return filters[nextKey] != null;
      });
      console.log("loop - Filter to this level is", filterProp, "matching key", keys)
      if (keys.length > 0) {
        const value = filters[filterProp + '.' + keys[0]];
        console.log("item[keys[0]]", item[keys[0]])
        if (item[keys[0]] !== value) {
          console.log("EXISTING xxxxx", item[keys[0]])
          return;
        }
        //veriy if value match
      }
      update(obj, item, paths, filters, value, finishPaths);
    })
  } else
  if (paths.length > 0) {
    console.log("NO array, keep  going inside")
    const filterProp = finishPaths.join('.');

    console.log("Filter to this level is", filterProp)


    update(source, objectValue, paths, filters, value, finishPaths);
  }
}
const patch = data.patch[0];
const arr = patch.path.split('?');
const paths = arr[0].split('/').filter(x => x != '');

const filters = arr[1].split('&').reduce((a, b) => {
  var splitArr = b.split('=');
  a[splitArr[0]] = splitArr[1];
  return a;
}, {});

console.log("filterObject", filters);
const source = data.source;

update(source, source, paths, filters, patch.value);

console.log(source);