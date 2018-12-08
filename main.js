const {Rectangle, Color} = require("scenegraph");

function minifyImagesCommand(selection) {
    console.log("minifyImagesCommand is running!");

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
