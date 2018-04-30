function camera(lookfrom, lookat, vup, vfov, aspect, aperture, focus_dist){
  var lens_radius = aperture / 2
  var theta = vfov * Math.PI/180
  var half_height = Math.tan(theta/2)
  var half_width = aspect * half_height
  var origin = lookfrom

  var w = unitVector(subVec3(lookfrom, lookat))
  var u = unitVector(cross(vup, w))
  var v = cross(w, u)

  var a = multConst(u, half_width) //2
  var b = multConst(v, half_height) //3
  var c = subVec3(origin, a)
  var d = subVec3(c, b)

  var lowerLeftCorner = subVec3(d, w)
  var horizontal = multConst(u, 2*half_width)
  var vertical = multConst(v, 2*half_height)

  this.getRay = function(s, t){
    debugger
    var rd = lens_radius * randomInUnitDisk()

    var a = multConst(u, rd.x)
    var b = multConst(v, rd.y)
    var offset = addVec3(a,b)

    var a = multConst(horizontal, s)
    var b = addVec3(lowerLeftCorner, a)
    var c = multConst(vertical, t)
    var d = addVec3(b, c)
    var e = subVec3(d, origin)
    var f = subVec3(e, offset)

    var z = addVec3(origin, offset)

    return new ray(origin, e)
  }
}

function randomInUnitDisk() {
  do {
    var a = new vec3([Math.random(), Math.random(), 0])
    var b = multConst(a, 2)
    var p = subVec3(b, new vec3([1,1,0]))
  } while (dot(p,p) >= 1.0)
  return p
}
