const data = require('./source.json');
const fs = require("fs");
const hash = {};
const patch = data.patch[0];
const arr = patch.path.split('?');
const ___patchable___ = "___patchable___";
const filters = arr[1].split('&').reduce((a, b) => {
  var splitArr = b.split('=');
  a[splitArr[0]] = splitArr[1];
  return a;
}, {});

console.clear();

function toHash(obj, hashKey) {
  hash[hashKey] = hash[hashKey] || []
  hash[hashKey].push(obj);

  if (Array.isArray(obj)) {
    obj.forEach((item) => {
      toHash(item, hashKey)
    })
  } else
  if (typeof obj == 'object') {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const element = obj[key];
        if (typeof element == "string") {
          hash[hashKey + '/' + element] = hash[hashKey + '/' + key] || []
          hash[hashKey + '/' + element].push(obj);
        }
        toHash(element, hashKey + '/' +
          key)

      }
    }
  }
}
toHash(data.source, '');
// console.log(hash);

function iterate(data, paths, parents, callback) {
  if (data == null) return;

  const currentPaths = [].concat(paths || ['/']);
  const parentsObject = [].concat(parents);
  const value = data;
  callback(data, value, paths, parentsObject);
  if (value && Array.isArray(value)) {
    value.forEach((item) => {
      iterate(item, currentPaths, parentsObject, callback);
    })
  }

  if (value && typeof value === "object" && !Array.isArray(value)) {
    parentsObject.push(value);
    Object.keys(value).forEach((item) => {
      iterate(value[item], currentPaths.concat([item]), parentsObject, callback)
    })
  }
}

//step 1 apply filter

iterate(data.source, [''], [data.source], (d, v, p, pp) => {
  const parent = pp[pp.length - 1];
  const filterPath = p.filter(x => x != '').join(".");
  const filterValue = filters[filterPath];
  let patchable = true;
  pp.forEach(item => {
    patchable = patchable && item[___patchable___] !== false;
  });
  if (filterValue && filterValue === v) {
    // console.log("trouble", pp)
    parent[___patchable___] = patchable;
  }
  if (filterValue && filterValue !== v) {
    parent[___patchable___] = false;
  }
})

// step 2 update data if matched
iterate(data.source, [''], [data.source], (d, v, p, pp) => {
  const lastItem = p[p.length - 1];
  const parent = pp[pp.length - 1];
  const filterPath = p.filter(x => x != '').join(".");

  const currentPath = p.join('/');
  if (currentPath == arr[0] && parent[___patchable___]) {
    console.log("Patching current path:", currentPath);
    parent[lastItem] = patch.value;
  }
  console.log(currentPath, filterPath);

})
//step 3 clean it up
iterate(data.source, [''], [data.source], (d, v, p, pp) => {

  if (typeof v == "object") {
    delete v["___patchable___"]
  }
})
//fs.writeFileSync("./output.json", JSON.stringify(data.source, null, 4));
console.log("result", data.source);