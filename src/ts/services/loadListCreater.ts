import {
    directoryCreater
} from "../services/cratingDirectorysFromPath";
import externalConfigController from "../services/configController";
import config from '../../../data/config';
import fs from "fs";
import {
    loger
} from '../services/logerModule';

export class LoadListCreater {

    public async scanDir() {
        return new Promise(async (resolve, reject) => {
            this.loadListCeater().then(
                (data: any) => {
                    resolve(
                        data
                    )
                }
            )
        })
    }

    public async loadListCeater() {
        let colectElements: any
        colectElements = []
        return new Promise(async (resolve, reject) => {
            async function grupedElem(): Promise < object > {
                return new Promise((resolve, reject) => {
                    fs.readFile(`${config["readLocalLoadListDir"]}log.json`, 'utf8', function(err, contents) {
                        if (err) {
                            loger(`Error cannot open file C:/radio/script/log.txt/ str 36: ${err}. str 24 loadlistCreater`, "elseError");
                            return
                        }
                        let allData = JSON.parse(contents);
                        resolve(allData)
                    });
                })
            }

            async function parseElem(data): Promise < object > {

                let elemObj = {}

                function ifThisDirectory(path): string {
                    path = path.split(".")
                    let file = path[path.length - 1];
                    if (file == "mp3" || file == "txt") {
                        if (path.length > 1) {
                            path = path.slice(0, path.length - 1)
                            path = path[0].split("/")
                            path = path.slice(0, path.length - 1)
                            path = path + "";
                            path = path.replace(/,/g, "/");
                        }
                    }
                    return path;
                }

                async function checkBlockedFoulder(fileName): Promise < boolean > {
                    const externallConfig = await externalConfigController();
                    let downloadPermission: boolean;
                    downloadPermission = false;
                    return new Promise((resolve, reject): void => {
                        if (externallConfig["directoriesWhichDownloadDisabled"].length === 0) resolve(true)
                        externallConfig["directoriesWhichDownloadDisabled"].forEach(function(item, i, arr) {
                            if ((fileName.indexOf(item) + 1)) {
                                downloadPermission = false;
                                resolve(false)
                            } else {
                                downloadPermission = true;
                            }
                            if ((arr.length - 1) == i) {
                                if (downloadPermission === true) resolve(downloadPermission)
                                resolve(true)
                            }
                        })
                    })
                }


                return new Promise((resolve, reject) => {

                    data.forEach(async function(item, i, arr) {
                        let elemName = Object.keys(item)[0];
                        let hashEl = item[elemName]
                        elemName = elemName.split(config["remmoteRootContentDirr"])[1];
                        let blocDirectory = await checkBlockedFoulder(elemName);
                        if (blocDirectory) {
                            let path = ifThisDirectory(elemName);
                            directoryCreater(path);
                            try {
                                elemObj = {
                                    [elemName]: {
                                        name: elemName,
                                        hash: hashEl,
                                        size: item["size"]
                                    }
                                }

                            } catch (e) {
                                loger(`Error creating object LoadListCreater.ts: ${e}. str 137 loadlistCreater`, "elseError");
                            }
                            colectElements.push(elemObj);
                        }
                        if ((arr.length - 1) === i) {
                            resolve(colectElements);
                        }
                    });
                })
            }

            grupedElem().then((data) => {
                parseElem(data).then((data) => {
                    resolve(data)
                })
            })
        })
    }
}