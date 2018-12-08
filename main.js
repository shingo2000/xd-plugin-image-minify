const Artboard = require("scenegraph");
const ImageFill = require("scenegraph").ImageFill;
const fs = require("uxp").storage.localFileSystem;
const application = require("application");

const fileNameSuffix = '_minify';
const nodeNameSuffix = '_Image_minify';

let setting = {
  quality: 80,
  scale: 1,
  rerun:false
}

async function minifyImagesCommand(selection) {
  console.log('compressImageCommand: ',selection.items.length);

  for(let i = 0; i < selection.items.length; i++){
    let node = selection.items[i];
    if(node){
      await minifyImage(node);
    }
  }

}


async function minifyImage(node){

  return new Promise(async resolve => {

    console.log('---------');
    console.log('compressImage: ',node.parent.name, '/' , node.name);

    if(!node.fill || !(node.fill instanceof ImageFill)){
      if(node instanceof Artboard){
        console.log('Artboardオブジェクト');
        // Groupオブジェクトの場合は Plugin Error: Plugin made a change outside the current edit context になるため、子を辿らない
        for(let j = 0; j < node.children.length; j++){
          let child = node.children.at(j);
          if(child){
            await compressImage(child);
          }
        }
      }else{
        console.log('その他のオブジェクト');
      }

    }else{
      console.log('画像オブジェクト: ',node.name);

      try{

        // todo: mimeTypeの判定の見直し
        const isJpg = (node.fill.mimeType == 'image/jpeg');
        let fileName = node.guid + fileNameSuffix;

        if(setting.rerun || !checkIsCompressed(node)){

          if(isJpg){
            fileName += '.jpg';
          }else{
            fileName +='.png';
          }

          const folder = await fs.getTemporaryFolder();
          const file = await folder.createFile(fileName, {overwrite: true});


          let renditionSettings = [{
            node: node,
            outputFile: file,
            type: application.RenditionType.PNG,
            scale: setting.scale
          }];

          if(isJpg){
            renditionSettings[0].type = application.RenditionType.JPG;
            renditionSettings[0].quality = setting.quality;
          }

          const tempOpacity = node.opacity;
          node.opacity = 1;

          const results = await application.createRenditions(renditionSettings);
          if(results){
              console.log(`PNG rendition has been saved at ${results[0].outputFile.nativePath}`);
          }
          node.fill = new ImageFill(file);
          node.opacity = tempOpacity;
        }

      }catch(error){
        console.log(error);
      }
    }


    resolve('resolved');
  });
}

function checkIsCompressed(node){

  let nodeName = node.name;
  if(nodeName.slice(-nodeNameSuffix.length) == nodeNameSuffix){
    return true;
  }else{
    nodeName += nodeNameSuffix;
    node.name = nodeName;
    return false;
  }
}

function settingCommand(selection) {
    console.log("setting is running!");
}




module.exports = {
    commands: {
        minifyImages: minifyImagesCommand,
        setting: settingCommand
    }
};
