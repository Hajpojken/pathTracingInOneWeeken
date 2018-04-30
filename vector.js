function vec3 (v) {
  this.x = v[0]
  this.y = v[1]
  this.z = v[2]
}

unitVector = function(vec) {
  var k = 1/Math.sqrt(vec.x * vec.x + vec.y * vec.y + vec.z * vec.z)
  return new vec3([vec.x * k, vec.y * k, vec.z * k])
}

addVec3 = function(vec3a, vec3b){
  return new vec3([vec3a.x + vec3b.x, vec3a.y + vec3b.y, vec3a.z + vec3b.z])
}

subVec3 = function(vec3a, vec3b){
  return new vec3([vec3a.x - vec3b.x, vec3a.y - vec3b.y, vec3a.z - vec3b.z])
}

multVec3 = function(vec3a, vec3b){
  return new vec3([vec3a.x * vec3b.x, vec3a.y * vec3b.y, vec3a.z * vec3b.z])
}

divVec3 = function(vec3a, vec3b){
  return new vec3([vec3a.x / vec3b.x, vec3a.y / vec3b.y, vec3a.z / vec3b.z])
}

multConst = function(vec, t){
  return new vec3([vec.x * t, vec.y * t, vec.z * t])
}

divConst = function(vec, t){
  return new vec3([vec.x / t, vec.y / t, vec.z / t])
}

length = function(vec) {
  return Math.sqrt(Math.pow(vec.x,2) + Math.pow(vec.y,2) + Math.pow(vec.z,2));
}

squared = function(vec) {
  return Math.pow(vec.x, 2) + Math.pow(vec.y, 2) + Math.pow(vec.z, 2)
}

makeUnitVector = function(vec) {
  return divConst(vec, length(vec))
}

dot = function(vec3a, vec3b){
  return vec3a.x * vec3b.x + vec3a.y * vec3b.y + vec3a.z * vec3b.z
}

cross = function(vec3a, vec3b){
  var x = vec3a.y * vec3b.z - vec3a.z*vec3b.y
  var y = -(vec3a.x * vec3b.z - vec3a.z * vec3b.x)
  var z = vec3a.x * vec3b.y - vec3a.y * vec3b.x

  return new vec3([x,y,z])
}
