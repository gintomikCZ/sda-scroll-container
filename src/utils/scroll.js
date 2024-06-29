export const requestAnimationFrameFallback = function () {
  let lastTime = 0
  // checking website vendors that has their own requestAnimationFrame
  const vendors = ['ms', 'moz', 'webkit', 'o']
  for (let x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame']
    window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] ||
      window[vendors[x] + 'CancelRequestAnimationFrame']
  }
  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function (callback, element) {
      const currTime = new Date().getTime()
      const timeToCall = Math.max(0, 16 - (currTime - lastTime))
      const id = window.setTimeout(function () {
        callback(currTime + timeToCall)
      },
      timeToCall)
      lastTime = currTime + timeToCall
      return id
    }
  }
  if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = function (id) {
      clearTimeout(id)
    }
  }
}

export const scrollIt = function (element, distance, duration, easing = 'linear', callback) {
  const easings = {
    linear (t) { return t },
    easeInQuad (t) { return t * t },
    easeOutQuad (t) { return t * (2 - t) },
    easeInOutQuad (t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t },
    easeInCubic (t) { return t * t * t },
    easeOutCubic (t) { return (--t) * t * t + 1 },
    easeInOutCubic (t) { return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1 },
    easeInQuart (t) { return t * t * t * t },
    easeOutQuart (t) { return 1 - (--t) * t * t * t },
    easeInOutQuart (t) { return t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t },
    easeInQuint (t) { return t * t * t * t * t },
    easeOutQuint (t) { return 1 + (--t) * t * t * t * t },
    easeInOutQuint (t) { return t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t }
  }
  const start = element.scrollTop
  const startTime = 'now' in window.performance ? performance.now() : new Date().getTime()
  const scrollSpace = element.scrollHeight - element.clientHeight

  let finalPosition = start + distance
  if (finalPosition > scrollSpace) finalPosition = scrollSpace
  if (finalPosition < 0) finalPosition = 0

  function scroll () {
    const now = 'now' in window.performance ? performance.now() : new Date().getTime()
    const time = Math.min(1, ((now - startTime) / duration))
    const timeFunction = easings[easing](time)
    const result = Math.ceil((timeFunction * (finalPosition - start)) + start)
    element.scrollTop = result
    if (element.scrollTop === finalPosition) {
      if (callback) {
        callback()
      }
      return
    }
    requestAnimationFrame(scroll)
  }
  scroll()
}

// ---------------------------

const getPosition = function (stTime, dur, dir, dist, startPos, finalPos) {
  const now = new Date().getTime()
  const time = (now - stTime) / dur
  const step = Math.ceil(time * Math.abs(dist))
  let value
  if (dir === 'down') {
    value = startPos + step
    return (value > finalPos) ? finalPos : value
  }
  value = startPos - step
  return (value < finalPos) ? finalPos : value
}

export const animateScroll = function (element, distance, duration) {
  const startPosition = element.scrollTop
  const startTime = new Date().getTime()
  const direction = distance < 0 ? 'up' : 'down'
  let finalPosition = startPosition + distance
  distance = Math.abs(distance)
  const scrollSpace = element.scrollHeight - element.clientHeight
  if (finalPosition > scrollSpace) finalPosition = scrollSpace
  if (finalPosition < 0) finalPosition = 0
  const scroll = () => {
    const pos = getPosition(startTime, duration, direction, distance, startPosition, finalPosition)
    element.scrollTop = pos
    if (pos === finalPosition) return
    requestAnimationFrame(scroll)
  }
  scroll()
}
export const animateScrollPromise = function (element, distance, duration) {
  const startTime = new Date().getTime()
  return new Promise(resolve => {
    const startPosition = element.scrollTop
    const direction = distance < 0 ? 'up' : 'down'
    let finalPosition = startPosition + distance
    distance = Math.abs(distance)
    const scrollSpace = element.scrollHeight - element.clientHeight
    if (finalPosition > scrollSpace) finalPosition = scrollSpace
    if (finalPosition < 0) finalPosition = 0
    const scroll = () => {
      const pos = getPosition(startTime, duration, direction, distance, startPosition, finalPosition)
      element.scrollTop = pos
      if (pos === finalPosition) {
        return resolve()
      }
      requestAnimationFrame(scroll)
    }
    scroll()
  })
}
const myPreventDefault = (e) => {
  e = e || window.event
  try {
    if (e.preventDefault) e.preventDefault()
    e.returnValue = false
  } catch (er) {
    return false
  }
}
const preventDefaultForScrollKeys = (e) => {
  const keys = { 37: 1, 38: 1, 39: 1, 40: 1, 33: 1, 34: 1, 35: 1, 36: 1 }
  if (keys[e.keyCode]) {
    myPreventDefault(e)
    return false
  }
}
export const stopWheel = () => {
  document.addEventListener('wheel', myPreventDefault, { passive: false })
  // window.onwheel = this.preventDefault;
  // window.onmousewheel = document.onmousewheel = this.preventDefault;
  window.ontouchmove = myPreventDefault
  document.onkeydown = preventDefaultForScrollKeys
}
export const setWheelBack = () => {
  document.removeEventListener('wheel', myPreventDefault, { passive: false })
  // window.onmousewheel = document.onmousewheel = null;
  // window.onwheel = null;
  window.ontouchmove = null
  document.onkeydown = null
}
