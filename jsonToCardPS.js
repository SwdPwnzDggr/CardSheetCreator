#include json2.js

var obj = loadJson('testCards.json');

var script = new File($.fileName);
var sheetPath = new File(script.path + '/' + "CardPrototypeSheet.psd");
var doc = app.open(new File(sheetPath));

placeExternalPSD(new File(script.path + '/' + "CardTemplate.psd"));

var sheetIndex = 1;
for(var currentCard = 0; currentCard < obj.cards.length; currentCard++)
{
  var cardIndex = 1 + currentCard%9;
  var str = "card"+ cardIndex;
  var layerSet = doc.layerSets.getByName(str);

  for(var currentLayer = 1; currentLayer <= doc.layerSets.getByName("template").layers.length -1; currentLayer++)
  {

    var titleLayer = doc.layerSets.getByName("template").artLayers[4-currentLayer];

    if(titleLayer.kind == LayerKind.TEXT)
    {
      titleLayer.textItem.contents = eval("obj.cards[currentCard]." + titleLayer.name);
    }
    else
    {
      if(titleLayer.name != "ref")
      {
        placeEmbeddedFile(new File(script.path + '/backgrounds/' + eval("obj.cards[currentCard]." + titleLayer.name) +".psd"));
        var layerToDelete = titleLayer;
        var oldLayer = doc.layerSets.getByName("template").artLayers.getByName("image");
        var refLayer = doc.layerSets.getByName("template").artLayers.getByName("ref");
        titleLayer = app.activeDocument.layers.getByName(eval("obj.cards[currentCard]." + titleLayer.name));
        layerToDelete.remove();
        app.activeDocument.activeLayer.name = 'image';
        titleLayer.move(doc.layerSets.getByName("template"), ElementPlacement.PLACEATEND);
        refLayer.move(doc.layerSets.getByName("template"),ElementPlacement.PLACEATEND);
        moveLayerAbsolute(titleLayer,refLayer);
      }
    }
    app.activeDocument.activeLayer = doc.layerSets.getByName("template");
    var dupe = app.activeDocument.activeLayer.duplicate();
    moveLayerRelative(dupe.artLayers[4-currentLayer], dupe.layers.getByName("ref copy"),layerSet.layers.getByName("ref"));
    dupe.artLayers[4-currentLayer].move(layerSet, ElementPlacement.INSIDE);
    dupe.remove();
  }
  if(cardIndex == 9)
  {
    doc.layerSets.getByName("template").visible = false;
    saveJpeg("sheet_" + sheetIndex++);
    doc.layerSets.getByName("template").visible = true;
  }
}
doc.close(SaveOptions.DONOTSAVECHANGES);
function moveLayerRelative(layer, oldRef, newRef)
{
  var pos = layer.bounds;
  var oldRefPos = oldRef.bounds;
  var newPos = layer.bounds;
  var newRefPos = newRef.bounds;
  newPos[0] = (newRefPos[0].as("Px") + (pos[0].as("Px") - oldRefPos[0].as("Px"))) - pos[0].as("Px");
  newPos[1] = (newRefPos[1].as("Px") + (pos[1].as("Px") - oldRefPos[1].as("Px"))) - pos[1].as("Px");
  layer.translate(newPos[0], newPos[1]);
}

function moveLayerAbsolute(layer, refPos)
{
  var pos = layer.bounds;
  var newPos = layer.bounds;
  newPos[0] = refPos.bounds[0].as("Px") - pos[0].as("Px");
  newPos[1] = refPos.bounds[1].as("Px") - pos[1].as("Px");
  layer.translate(newPos[0], newPos[1]);
}

function loadJson(relativePath)
{
  var script = new File($.fileName);
  var jsonFile = new File(script.path + '/' + relativePath);

  jsonFile.open('r');
  var str = jsonFile.read();
  jsonFile.close();

  return JSON.parse(str);
}

function saveJpeg(name)
{
  var doc = app.activeDocument;
  var file = new File(doc.path + '/' + name + '.jpg')

  var opts = new JPEGSaveOptions();
  opts.quality = 10;

  doc.saveAs(file, opts, true);
}


function placeExternalPSD(filePath)
{
  var doc = app.open(new File(filePath));
  doc.layerSets.getByName("template").duplicate (app.documents.getByName('CardPrototypeSheet.psd'));
  doc.close(SaveOptions.DONOTSAVECHANGES);
  app.activeDocument.activeLayer.name = 'template';
}

function placeEmbeddedFile(filePath)
{
  var idPlc = charIDToTypeID( "Plc " );
  var desc11 = new ActionDescriptor();
  var idnull = charIDToTypeID( "null" );

  desc11.putPath( idnull, new File(filePath) );
  var idFTcs = charIDToTypeID( "FTcs" );
  var idQCSt = charIDToTypeID( "QCSt" );
  var idQcsa = charIDToTypeID( "Qcsa" );
  desc11.putEnumerated( idFTcs, idQCSt, idQcsa );
  var idOfst = charIDToTypeID( "Ofst" );
  var desc12 = new ActionDescriptor();
  var idHrzn = charIDToTypeID( "Hrzn" );
  var idPxl = charIDToTypeID( "#Pxl" );
  desc12.putUnitDouble( idHrzn, idPxl, 0.000000 );
  var idVrtc = charIDToTypeID( "Vrtc" );
  var idPxl = charIDToTypeID( "#Pxl" );
  desc12.putUnitDouble( idVrtc, idPxl, 0.000000 );
  var idOfst = charIDToTypeID( "Ofst" );
  desc11.putObject( idOfst, idOfst, desc12 );
  executeAction( idPlc, desc11, DialogModes.NO );
}
