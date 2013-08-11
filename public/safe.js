var width = 400,
    height = 400,
    lineColor = "#27343D",
    strokeWidth = 4,
    pad = 75;

var paper = Raphael("safe-container", width, height);


var safeBorder = paper.rect(pad,pad,width-pad*2,height-pad*2,5);
safeBorder.attr("stroke", lineColor);
safeBorder.attr("stroke-width", strokeWidth);

var safeKnob = paper.circle(width/2, height/2, 60);
safeKnob.attr("stroke", lineColor);
safeKnob.attr("stroke-width", strokeWidth);

paper.circle(width/2, height/2, 16)
     .attr("stroke", lineColor);
     //.attr("stroke-width", strokeWidth/2);

var smallInR = 51;
var outR = 60;
var bigInR = 44;

var lineStr = "";
var centerX = width/2;
var centerY = height/2;
var lineCount = 60;

for(var i = 0; i < lineCount; i++) {
  var angle = i/lineCount*2*Math.PI;
  var ca = Math.cos(angle);
  var sa = Math.sin(angle);
  if(i % 5 != 0) {
    lineStr += "M"+(ca*smallInR + centerX)+","+(sa*smallInR + centerY);
  } else {
    lineStr += "M"+(ca*bigInR + centerX)+","+(sa*bigInR + centerY);
  }
  lineStr += "L"+(ca*outR + centerX)+","+(sa*outR + centerY);
}

var line = paper.path(lineStr);
line.attr("stroke", lineColor);
