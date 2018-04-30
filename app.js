var c = document.getElementById("canvas")
var ctx = c.getContext("2d")
var mix = 0.50000
var nx = 2000
var ny = 1000
var passes = 10
var id = ctx.createImageData(nx,ny)

var frames = document.getElementById("progress")
var loops = 1

var rendertime = document.getElementById('time')

function main () {
  //camera(lookfrom, lookat, vup, vfov, aspect)
  var lookfrom = new vec3([-3,3,2])
  var lookat =  new vec3([0,0,-1])
  var dist_to_focus = length(subVec3(lookfrom, lookat))
  var aperture = 2.0
  var cam = new camera(lookfrom, lookat, new vec3([0,1,0]), 20, nx/ny, aperture, dist_to_focus)
  var objects = []

  objects.push(new sphere(new vec3([0,-1000.5,-1]), 1000, new lambertian(new vec3([0.8, 0.8, 0.0]))))
  objects.push(new sphere(new vec3([-1.05,0,-1]), 0.5, new dieletric(1.5)))
  objects.push(new sphere(new vec3([-1.05,0,-1]), -0.45, new dieletric(1.5)))
  objects.push(new sphere(new vec3([1.05,0,-1]), 0.5, new metalMaterial(new vec3([0.8, 0.2, 0]),0.1)))
  objects.push(new sphere(new vec3([0,0,-1]), 0.5, new lambertian(new vec3([0.1, 0.2, 0.5]))))
  render(nx, ny, objects, cam)
}

function render(nx, ny, scene, cam, old){
  var time = Date.now()
  var image = []
  for (var j = ny; j > 0; j--) {
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
        var tmp = old.length-nx*j+i
        tmpArr[0] = ir*mix + old[tmp][0]*(1-mix)
        tmpArr[1] = ib*mix + old[tmp][1]*(1-mix)
        tmpArr[2] = ig*mix + old[tmp][2]*(1-mix)
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
    id.data[k+0] = image[l][0]
    id.data[k+1] = image[l][1]
    id.data[k+2] = image[l][2]
    id.data[k+3] = image[l][3]
  }

  ctx.putImageData(id, 0, 0)
  frames.innerHTML = "Frames: " + loops
  rendertime.innerHTML = "Last frame: " + (Date.now() - time)/1000 + "s"
  loops+=1
  mix = 1/(loops+1)
  window.requestAnimationFrame(() => render(nx, ny, scene, cam, image))
}

function color(r, scene, depth){
  var hitSomething = hit(scene, r, 0.001, Number.MAX_VALUE)
  if (hitSomething) {
    var scattered = record.mat.scatter(r)
    if (depth < 50 && scattered){
      var tmp = multVec3(record.mat.attenuation, color(scattered, scene, depth+1))
      return tmp
    }
    else {
      return new vec3([0,0,0])
    }
  }
  else {
    var unitDirection = unitVector(r.direction)
    var t = 0.5 * (unitDirection.y + 1.0)
    var a = multConst(new vec3([1.0, 1.0, 1.0]), (1.0-t))
    var b = multConst(new vec3([0.5, 0.7, 1.0]), t)
    return addVec3(a, b)
  }
}

function ray(vec3o, vec3dir) {
  this.origin = vec3o
  this.direction = unitVector(vec3dir)
  this.pointAtParameter = function(t) {
    return addVec3(this.origin, multConst(this.direction, t))
  }
}

//Hit
function hit(scene, r, t_min, t_max) {
  var closestT = t_max;
  var hitAnything = false

  for (var i=0; i < scene.length; i++) {
    if(scene[i].hit(r, t_min, t_max)) {
      if(tempHitRecord.t < closestT) {
        closestT = tempHitRecord.t
        record.setT(tempHitRecord.t)
        record.setP(tempHitRecord.p)
        record.setNormal(tempHitRecord.normal)
        record.setMat(tempHitRecord.mat)
        hitAnything = true
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

  this.setT = function(val){
    this.t = val
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

randomInUnitSphere = function(){
  var tmp = new vec3([-1,-1,-1])
  do {
    var p = subVec3(multConst(new vec3([Math.random(), Math.random(), Math.random()]), 2.0), tmp)
  } while(length(squared(p)) >= 1.0)
  return p
}

main()
