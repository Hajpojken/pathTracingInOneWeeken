//create sphere object in scene

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
        tempHitRecord.setT(temp)
        tempHitRecord.setP(r.pointAtParameter(tempHitRecord.t))
        var tempNormal = divConst(subVec3(tempHitRecord.p, center),radius)
        tempHitRecord.setNormal(tempNormal)
        tempHitRecord.setMat(material)
        return true
      }

      temp = (((-b) + Math.sqrt(discriminant)) / a)
      if (temp < t_max && temp > t_min) {
        tempHitRecord.setT(temp)
        tempHitRecord.setP(r.pointAtParameter(tempHitRecord.t))
        var tempNormal = divConst(subVec3(tempHitRecord.p, center),radius)
        tempHitRecord.setNormal(tempNormal)
        tempHitRecord.setMat(material)
        return true
      }
    }
    return false
  }
}
