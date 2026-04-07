import frameGolden from './frame-golden.json'
import frameCyber from './frame-cyber.json'
import frameNature from './frame-nature.json'
import frameHexagon from './frame-hexagon.json'
import frameDiamond from './frame-diamond.json'
import frameStar from './frame-star.json'
import frameRipple from './frame-ripple.json'

export const getLottieAnimation = (frameId) => {
  const map = {
    'lottie-golden': frameGolden,
    'lottie-cyber': frameCyber,
    'lottie-nature': frameNature,
    'lottie-hexagon': frameHexagon,
    'lottie-diamond': frameDiamond,
    'lottie-star': frameStar,
    'lottie-ripple': frameRipple
  }
  return map[frameId] || null
}
