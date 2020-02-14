export default function flood(pixels, data) {
    //console.count(data);
    var pixel = pixels[0];
    if (pixel[3]) {
      var height = -10000 + ((pixel[0] * 256 * 256 + pixel[1] * 256 + pixel[2]) * 0.1);
      if (height <= data.level-(height*0.02)) {
          pixel[0] = 255; //R
          pixel[1] = 45; //G
          pixel[2] = 45; //B
          pixel[3] = 255; //A
      } 
      else if (height <= data.level-(height*0.01)) {
          pixel[0] = 246; //R
          pixel[1] = 110; //G
          pixel[2] = 110  ; //B
          pixel[3] = 255; //A
      } 
      else if(height <= data.level){
          pixel[0] = 236; //R
          pixel[1] = 185; //G
          pixel[2] = 186; //B
          pixel[3] = 225; //A
      }  else {
          pixel[3] = 0;
        }
    }
    return pixel;
  }