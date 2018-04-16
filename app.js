//main
var c = document.getElementById("canvas")
var ctx = c.getContext("2d")
var mix = 0.50000
var nx = 800
var ny = 400
var passes = 5
var id = ctx.createImageData(nx,ny)

var frames = document.getElementById("progress")
var loops = 1

var rendertime = document.getElementById('time')

function main () {
  var cam = new camera()
  var objects = []
  objects[0] = new sphere(new vec3([0,-100.5,-1]), 100, new lambertian(new vec3([0.8, 0.8, 0.0])))
  objects[2] = new sphere(new vec3([-1,0,-1]), 0.5, new metalMaterial(new vec3([0.8, 0.8, 0.8]), 0.0))
  objects[1] = new sphere(new vec3([1,0,-1]), 0.5, new metalMaterial(new vec3([1.0, 0.6, 0.2]), 0.2))
  objects[3] = new sphere(new vec3([0,0,-1]), 0.5, new lambertian(new vec3([0.8, 0.3, 0.3])))
  render(nx, ny, objects, cam)
}

function render(nx, ny, scene, cam, old){
  var time = Date.now()
  var image = []
  for (var j = 0; j < ny; j++) {
    for (var i = 0; i < nx; i++) {
      var col = new vec3([0,0,0])
      for (var s = 0; s < passes; s++){
        var u = (i + Math.random())/nx
        var v = (j + Math.random())/ny
        var r = cam.getRay(u,v)
        var tmp = col
        var col = addVec3(color(r, scene, 0), tmp)
      }
      col = divConst(col, passes)

      var ir = Math.floor(255.99 * Math.sqrt(col.x))
      var ib = Math.floor(255.99 * Math.sqrt(col.y))
      var ig = Math.floor(255.99 * Math.sqrt(col.z))

      var tmpArr = []

      if (loops != 1){
        tmpArr[0] = ir*mix + old[j*nx + i][0]*(1-mix)
        tmpArr[1] = ib*mix + old[j*nx + i][1]*(1-mix)
        tmpArr[2] = ig*mix + old[j*nx + i][2]*(1-mix)
        tmpArr[3] = 255
        image.push(tmpArr)
      }

      else {
        tmpArr[0] = ir
        tmpArr[1] = ib
        tmpArr[2] = ig
        tmpArr[3] = 255
        image.push(tmpArr)
      }
    }
  }
  for(var k = 0; k<id.data.length; k+=4){
    var l = k/4
    id.data[k+0] = image[image.length - l - 1][0]
    id.data[k+1] = image[image.length - l - 1][1]
    id.data[k+2] = image[image.length - l - 1][2]
    id.data[k+3] = image[image.length - l - 1][3]
  }

  ctx.putImageData(id, 0, 0)
  frames.innerHTML = "Frames: " + loops
  rendertime.innerHTML = "Last frame: " + (Date.now() - time)/1000 + "s"

  loops+=1
  mix = 1/(loops+1)

  window.requestAnimationFrame(() => render(nx, ny, scene, cam, image))
}

//vector constructor
function vec3 (v) {
  this.x = v[0]
  this.y = v[1]
  this.z = v[2]
}

//materials
function lambertian(albedo){
  this.attenuation = albedo || new vec3([1.0, 1.0, 1.0])
  this.scatter = function(r){
    var target = addVec3(addVec3(record.p, record.normal),randomInUnitSphere())
    var tmp = subVec3(target, record.p)
    return new ray(record.p, tmp)
  }
}

function metalMaterial(albedo, fuzz){
  this.attenuation = albedo || new vec3([1.0, 1.0, 1.0])
  this.fuzz = fuzz || 0

  this.scatter = function(r){
    var reflected = reflect(unitVector(r.direction), record.normal)
    var a = multConst(randomInUnitSphere(), fuzz)
    var tmp = addVec3(reflected, a)
    return new ray(record.p, tmp)
  }
}

function reflect(vec3a, vec3b){
  return subVec3(vec3a, multConst(vec3b, 2 * dot(vec3a, vec3b)))
}

//camera
function camera(){
  var lowerLeftCorner = new vec3([(-2.0),(-1.0),(-1.0)])
  var horizontal = new vec3([4.0, 0.0, 0.0])
  var vertical = new vec3([0.0, 2.0, 0.0])
  var origin = new vec3([0.0, 0.0, 0.0])

  this.getRay = function(u,v){
    return new ray(origin, addVec3(addVec3(lowerLeftCorner, multConst(horizontal, u)), multConst(vertical, v)))
  }
}
//
function color(r, scene, depth){
  var hitSomething = hit(scene, r, 0.001, Number.MAX_VALUE)
  if (hitSomething) {
    if (depth < 50) {
      var scattered = record.mat.scatter(r)
      return multVec3(record.mat.attenuation, color(record.mat.scatter(r), scene, depth + 1))
    }
    else {
      return new vec3(0,0,0)
    }
  }
  else {
    var unitDirection = unitVector(r.direction)
    var t = 0.5 * (unitDirection.y + 1.0)
    return addVec3(multConst(new vec3([1.0, 1.0, 1.0]), (1.0-t)), multConst(new vec3([0.5, 0.7, 1.0]), t))
  }
}

function ray(vec3o, vec3dir) {
  this.origin = vec3o
  this.direction = vec3dir
  this.pointAtParameter = function(t) {
    return addVec3(this.origin, multConst(this.direction, t))
  }
}

//Hit
function hit(scene, r, t_min, t_max) {
  var closestT = t_max;
  var hitAnything = false

  for (var i=0; i < scene.length; i++) {
    if(scene[i].hit(r, t_min, t_max) > 0.0) {
      if(tempHitRecord.t < closestT) {
        hitAnything = true
        tempHitRecord.setT(record.t)
        record.setT(closestT)
      }
    }
  }
  return hitAnything
}

function createHitRecord(t,p, normal, mat){
  this.t = t || 0
  this.p = p || new vec3([0,0,0])
  this.normal = normal || new vec3([0,0,0])
  this.mat = mat || new lambertian(new vec3([0,0,0]))

  this.setT = function(vec){
    this.t = vec
  }
  this.setP = function(vec){
    this.p = vec
  }
  this.setNormal = function(vec){
    this.normal = vec
  }
  this.setMat = function(vec){
    this.mat = vec
  }
}

var tempHitRecord = new createHitRecord()
var record = new createHitRecord()

//Sphere
function sphere(center, radius, material){
  this.center = center
  this.radius = radius
  this.material = material

  this.hit = function(r, t_min, t_max) {
    var oc = subVec3(r.origin, center)
    var a = dot(r.direction, r.direction)
    var b = dot(oc, r.direction)
    var c = dot(oc, oc) - radius * radius
    var discriminant = (b * b) - (a * c)
    if (discriminant > 0) {
      var temp = (((-b) - Math.sqrt(discriminant)) / a)
      if (temp < t_max && temp > t_min) {
        record.setT(temp)
        record.setP(r.pointAtParameter(record.t))
        var tempNormal = divConst(subVec3(record.p, center),radius)
        record.setNormal(tempNormal)
        record.setMat(material)
        return true
      }
      temp = (((-b) + Math.sqrt(discriminant)) / a)
      if (temp < t_max && temp > t_min) {
        record.setT(temp)
        record.setP(r.pointAtParameter(record.t))
        var tempNormal = divConst(subVec3(record.p, center),radius)
        record.setNormal(tempNormal)
        record.setMat(material)
        return true
      }
    }
    return false
  }
}

randomInUnitSphere = function(){
  var tmp = new vec3([-1,-1,-1])
  do {
    var p = subVec3(multConst(new vec3([Math.random(), Math.random(), Math.random()]), 2.0), tmp)
  } while(length(squared(p)) >= 1.0)

  return p
}

//----------------------------------------------------------------------------
//Vector Operations

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
  return new vec3(
    vec3a.y * vec3b.z - vec3a.z*vec3b.y,
    -(vec3a.x * vec3b.z - vec3a.z * vec3b.x),
    vec3a.x * vec3b.y - vec3a.y * vec3b.x
  )
}

main()
