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
  if(fuzz < 1){
    this.fuzz = fuzz
  }
  else{
    this.fuzz = 0
  }

  this.scatter = function(r){
    var reflected = reflect(unitVector(r.direction), record.normal)
    var a = multConst(randomInUnitSphere(), fuzz)
    var tmp = addVec3(reflected, a)
    var scattered = new ray(record.p, tmp)
    if(dot(scattered.direction, record.normal) > 0){
      return scattered
    }
  }
}

function dieletric(ri){
  this.snell = ri
  this.attenuation = new vec3([1.0, 1.0, 1.0])
  this.scatter = function(r){
    if(dot(r.direction, record.normal) > 0){
      var outwardNormal = new vec3([-record.normal.x, -record.normal.y, -record.normal.z])
      var niOverNt = ri
      var cosine = ri * dot(r.direction, record.normal) / length(r.direction)
    }
    else{
      var outwardNormal = record.normal
      var niOverNt = 1.0/ri
      var cosine = (-dot(r.direction, record.normal)) / length(r.direction)
    }

    var refracted = refract(r.direction, outwardNormal, niOverNt)

    if(refracted){
      var reflect_prob = schlick(cosine, ri)
    }
    else{
      var reflect_prob = 1.0
    }

    if(Math.random() < reflect_prob){
      var reflected = reflect(r.direction, record.normal)
      scattered = new ray(record.p, reflected)
    }
    else {
      scattered = new ray(record.p, refracted)
    }
    return scattered
  }
}

function refract(v, n, niOverNt){
  var uv = unitVector(v)
  var dt = dot(uv, n)
  var discriminant = 1.0 - niOverNt * niOverNt * (1-dt*dt)
  if (discriminant > 0){
    var z = multConst(n, dt)
    var a = subVec3(uv, z)
    var b = multConst(a, niOverNt)
    var c = multConst(n, Math.sqrt(discriminant))
    var refracted = subVec3(b, c)
    return refracted
  }
}

function reflect(v, n){
  var a = dot(v, n)
  var tmp = 2*a
  var b = multConst(n, tmp)
  return subVec3(v, b)
}

function schlick(cosine, ref_idx){
  var r0 = (1 - ref_idx) / (1 + ref_idx)
  r0 = r0 * r0
  return r0 + (1 - r0) * Math.pow((1-cosine), 5)
}
