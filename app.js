//main
var c = document.getElementById("canvas")
var ctx = c.getContext("2d")
var id = ctx.createImageData(1,1)
var d  = id.data
d[3]   = 255
var mix = 0.500000000

var frames = document.getElementById("progress")
var loops = 1

var rendertime = document.getElementById('time')

function main () {
  var nx = 200
  var ny = 100

  var cam = new camera()

  var objects = []
  objects[0] = new sphere(new vec3([0,-100.5,-1]), 100, new lambertian(new vec3([0.8, 0.8, 0.0])))
  objects[2] = new sphere(new vec3([-1,0,-1]), 0.5, new metalMaterial(new vec3([0.8, 0.8, 0.8]), 0))
  objects[1] = new sphere(new vec3([1,0,-1]), 0.5, new metalMaterial(new vec3([0.8, 0.6, 0.2]), 0.1))
  objects[3] = new sphere(new vec3([0,0,-1]), 0.5, new lambertian(new vec3([0.8, 0.3, 0.3])))

  render(nx, ny, objects, cam)
}

function render(nx, ny, scene, cam){
  var time = Date.now()
  for (var j = ny-1; j >= 0; j--) {
    for (var i = 0; i < nx; i++) {
      var col = new vec3([0,0,0])
      var u = (i + Math.random())/nx
      var v = (j + Math.random())/ny
      var r = cam.getRay(u,v)
      var tmp = col
      var col = addVec3(color(r, scene, 0), tmp)

      var ir = Math.floor(255.99 * Math.sqrt(col.x))
      var ig = Math.floor(255.99 * Math.sqrt(col.y))
      var ib = Math.floor(255.99 * Math.sqrt(col.z))

      if (loops != 1){
        var p = ctx.getImageData(i, ny-j, 1, 1).data;
        var r = p[0]
        var g = p[1]
        var b = p[2]
        d[0] = ir*mix + r*(1-mix)
        d[1] = ig*mix + g*(1-mix)
        d[2] = ib*mix + b*(1-mix)
      }
      else {
        d[0] = ir
        d[1] = ig
        d[2] = ib
      }
      ctx.putImageData( id, i, ny-j );
    }
    //console.log(((ny-j)/ny)*100 + " %")
  }
  frames.innerHTML = "Frames: " + loops
  rendertime.innerHTML = "Last frame: " + (Date.now() - time)/1000 + "s"
  loops+=1
  mix = mix/1.05

  window.requestAnimationFrame(() => render(nx, ny, scene, cam))
}

//vector constructor
function vec3 (v) {
  this.x = v[0] || 0
  this.y = v[1] || 0
  this.z = v[2] || 0

  this.vec = [this.x,this.y,this.z]

  this.setX = function(t){
    this.x = t
  }
  this.setY = function(t){
    this.y = t
  }
  this.setZ = function(t){
    this.z = t
  }
}

//materials
function lambertian(albedo){
  this.attenuation = albedo || new vec3([1.0, 1.0, 1.0])

  this.scatter = function(r){
    var target = addVec3(addVec3(record.p, record.normal),randomInUnitSphere())
    var tmp = subVec3(target, record.p)
    var scattered = new ray(record.p, tmp)
    return scattered
  }
}

function metalMaterial(albedo, fuzz){
  this.attenuation = albedo || new vec3([1.0, 1.0, 1.0])
  this.fuzz = fuzz || 0

  this.scatter = function(r){
    var reflected = reflect(unitVector(r.direction), record.normal)
    var a = multConst(randomInUnitSphere(), fuzz)
    var tmp = addVec3(reflected, a)
    var scattered = new ray(record.p, tmp)
    return scattered
  }
}

function reflect(vec3a, vec3b){
  var a = 2 * dot(vec3a, vec3b)
  var b = multConst(vec3b,a)
  var c = subVec3(vec3a, b)
  return c
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
      var temp = multVec3(record.mat.attenuation, color(scattered, scene, depth + 1))
      return temp
    }
    else {
      return new vec3(0,0,0)
    }
  }
  else {
    var unitDirection = unitVector(r.direction)
    var t = 0.5 * (unitDirection.y + 1.0)
    var b = new vec3([1.0, 1.0, 1.0])
    var c = new vec3([0.5, 0.7, 1.0])
    return addVec3(multConst(b, (1.0-t)), multConst(c, t))
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
  var length = length(vec)
  return divConst(vec, length)
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
