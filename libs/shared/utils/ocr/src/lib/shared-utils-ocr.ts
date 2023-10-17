export type ERegulaDetectFaceQualityDetailName = 
  "Yaw" |
  "Pitch" |
  "Roll" |
  "BlurLevel" |
  "NoiseLevel" |
  "EyeRightClosed" |
  "EyeLeftClosed" |
  "EyeRightCoveredWithHair" |
  "EyeLeftCoveredWithHair" |
  "TooDark" |
  "TooLight" |
  "FaceGlare" |
  "ShadowsOnFace" |
  "BackgroundUniformity" |
  "ShadowsOnBackground" |
  "OtherFaces" |
  "UnnaturalSkinTone";


export const REGULA_FACE_QUALITY_ERROR_MESSAGES: { [key in ERegulaDetectFaceQualityDetailName]: string} = {
  Yaw: "Do not tilt the head as it must be centered", 
  Pitch: "Do not turn the head as it must be centered", 
  Roll: "Do not roll the head as it must be straight to show the full face", 
  BlurLevel: "The photo is blurred", 
  NoiseLevel: "The photo background is not clear", 
  EyeRightClosed: "The right eye is closed", 
  EyeLeftClosed: "The left eye is closed", 
  EyeRightCoveredWithHair: "The hairstyle is covering the right eye", 
  EyeLeftCoveredWithHair: "The hairstyle is covering the left eye", 
  TooDark: "The photo is too dark", 
  TooLight: "The photo is too light", 
  FaceGlare: "The face is not clear due to over lighting", 
  ShadowsOnFace: "The photo is not clear due to shadow on the face", 
  BackgroundUniformity: "The background should be plain & uniform", 
  ShadowsOnBackground: "The background should not have shadows or glare", 
  OtherFaces: "More than one face detected on the photo", 
  UnnaturalSkinTone: "The photo has an unnaturally colored lighting", 
}

export interface IRequlaFaceQualityDetail {
  name: ERegulaDetectFaceQualityDetailName;
  status: 1 | 0;
}

export function getRegulaDetectFaceQualityErrorMessages(qualityDetails: IRequlaFaceQualityDetail[]) {
  if (!qualityDetails) return [];
  return qualityDetails
    .filter(({ status, name }) => status === 0 && name in REGULA_FACE_QUALITY_ERROR_MESSAGES)
    .map(({ name }) => REGULA_FACE_QUALITY_ERROR_MESSAGES[name]);
}