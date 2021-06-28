import {
    Readable
} from "stream";
import {
    LoadListCreater
} from "../services/loadListCreater";
import {
    cheackDiferent
} from "../services/bootCapabilityCheck";
import config from '../../../data/config'
import externalConfigController from '../services/configController'
import {
    loger
} from '../services/logerModule';
import fs from 'fs';
import {
    FSService
} from "./../../ts/services/fsService";

let arrTryLoad: any
arrTryLoad = [];
let fileMusteToDeleted: any;
fileMusteToDeleted = [];
let deliteFilesSuces: any;
deliteFilesSuces = [];
let notLoadetNoChanges: any;
notLoadetNoChanges = [];
let countElementSucessDownload: any;
countElementSucessDownload = [];
let totalNumberOfFilesMustBeUploaded: any;
totalNumberOfFilesMustBeUploaded = 0;
let totalNumberOfFilesNotLoadet: any;
totalNumberOfFilesNotLoadet = 0;
let totalNumberOfFilesLoadetSuces: any;
totalNumberOfFilesLoadetSuces = 0;
let totalNumberOfMustBeDeleted: any;
totalNumberOfMustBeDeleted = 0;
let totalNumberOfDeletedSucess: any;
totalNumberOfDeletedSucess = 0;

export interface IRemote {
    [x: string]: any;
    getAudio(name: string): Promise < Readable > ;
}

export interface ILocale {
    saveRemmotLog(data: Readable, arg1: string);
    remmotFileInfo(remmotFileInfo: any, fileName: any);
    saveAudio(stream: Readable, name: string, size: number): any;
}

interface ISources {
    remote: IRemote;
    locale: ILocale;
}

export class Dispather {
    private _remote: IRemote;
    private _locale: ILocale;
    loadList: any;

    constructor(sources: ISources) {
        this._remote = sources.remote;
        this._locale = sources.locale;
        this.loadRemmotLog().then(
            (data) => {
                this.loadList = new LoadListCreater().scanDir().then(
                    (data) => {
                        this.synchronize(data)
                    }
                )
            }
        )

    }

    public loadRemmotLog(): Promise < boolean > {
        return new Promise((resolve): void => {
            this._remote.getAudio(`${config["getLoadListFromRemmotSource"]}log.json`).then(async (data) => {
                if (data["statusCode"] != 200) {
                    this._remote.getAudio(`${config["getLoadListFromRemmotSource"]}log.json`).then(async (data) => {
                        if (data["statusCode"] != 200) {
                            return;
                        }
                        let test = await this._locale.saveRemmotLog(data, "log.json").then(() => resolve(true))
                    })
                    return;
                }
                let test = await this._locale.saveRemmotLog(data, "log.json").then(() => resolve(true))

            })
        })
    }

    public async synchronize(list: any): Promise < void > {
        function deleted(remmoteList: any) {
            return new Promise((resolve): any => {
                let fs = new FSService(config["checkToDeleatLeast"]);
                fs.readRoot().then((listLockalFiles) => {
                    let lockalFiles = listLockalFiles.filter(e => !~remmoteList.indexOf(e));
                    lockalFiles.forEach(async function(item, i, arr) {
                        fileMusteToDeleted.push(item);
                        fs.delete(item);
                        deliteFilesSuces.push(item);
                        if ((arr.length - 1) === i) {
                            resolve(true)
                        }
                        if (arr.length - 1) {
                            const externallConfig = await externalConfigController();
                            lockalFiles.forEach(async function(itemLocal) {
                                externallConfig["directoriesWhichDownloadDisabled"].forEach(function(elem) {
                                    if (itemLocal.indexOf(elem) + 1) {
                                        fs.delete(itemLocal);
                                    }
                                })
                            })

                        }
                    })

                })
            })
        }

        let index = 0;
        let listToDelete: any
        listToDelete = [];
        let listToLoad: any
        listToLoad = [];


        for (const name of list) {
            let mustToLoad = false;
            let fileName = Object.keys(name)[0];
            listToDelete.push((config["downloadDirectory"] + fileName))
            mustToLoad = await cheackDiferent(name);
            if (mustToLoad) {
                listToLoad.push(name);
            } else {
                loger(`${fileName}`, "notLoadetNotChanges");
                notLoadetNoChanges.push(fileName);
            }
            if ((list.length - 1) === index) {
                totalNumberOfFilesMustBeUploaded = listToLoad.length;
                await deleted(listToDelete)
                loger(listToLoad, "list_must_load_files");
                loger(`sync start / num must too Load : ${listToLoad.length} / list must to delete : ${fileMusteToDeleted.length} / notLoadetNotChanges: ${notLoadetNoChanges.length}`, "proces");
                if (!listToLoad[0]) loger(` no files to upload / first sync done `, "proces");
                totalNumberOfMustBeDeleted = fileMusteToDeleted.length;
                totalNumberOfDeletedSucess = deliteFilesSuces.length;
                if (!listToLoad[0]) {
                    loger(`sync finish / list must to Load : 0 / list too loaded suces : 0 / list files must to delete : ${totalNumberOfMustBeDeleted}  / list deletet suces : ${totalNumberOfDeletedSucess} / notLoadetNotChanges: ${notLoadetNoChanges.length}`, "proces");
                    totalNumberOfFilesMustBeUploaded = 0;
                    totalNumberOfMustBeDeleted = 0;
                    totalNumberOfDeletedSucess = 0;
                    totalNumberOfFilesLoadetSuces = 0;
                }
                let loadAgentstatus = await this.loadeAgent(listToLoad);
                totalNumberOfFilesLoadetSuces = totalNumberOfFilesLoadetSuces + countElementSucessDownload.length
                loger(`first sync done / file load suces : ${countElementSucessDownload.length} / files delete sucess ${deliteFilesSuces.length} / file not load ${arrTryLoad.length}  `, "proces");
                if (loadAgentstatus) {
                    loger(`sync finish / list must to Load : ${totalNumberOfFilesMustBeUploaded} / list too loaded suces : ${totalNumberOfFilesLoadetSuces} / list files must to delete : ${totalNumberOfMustBeDeleted}  / list deletet suces : ${totalNumberOfDeletedSucess} / notLoadetNotChanges: ${notLoadetNoChanges.length}`, "proces");
                    totalNumberOfFilesMustBeUploaded = 0;
                    totalNumberOfMustBeDeleted = 0;
                    totalNumberOfDeletedSucess = 0;
                    totalNumberOfFilesLoadetSuces = 0;
                }
                deliteFilesSuces = [];
                fileMusteToDeleted = [];
                if (!loadAgentstatus) {
                    loger(`sync start try 2 / num must too Load : ${arrTryLoad.length} / list must to delete : ${fileMusteToDeleted.length} / notLoadetNotChanges: ${notLoadetNoChanges.length}`, "proces");
                    loadAgentstatus = await this.loadeAgent(arrTryLoad)
                    loger(`sync  done 2 / file load suces : ${countElementSucessDownload.length} / files delete sucess ${deliteFilesSuces.length} / file not load ${arrTryLoad.length}  `, "proces");
                    totalNumberOfFilesLoadetSuces = totalNumberOfFilesLoadetSuces + countElementSucessDownload.length;
                    if (loadAgentstatus) {
                        loger(`sync finish / list must to Load : ${totalNumberOfFilesMustBeUploaded} / list too loaded suces : ${totalNumberOfFilesLoadetSuces} / list files must to delete : ${totalNumberOfMustBeDeleted}  / list deletet suces : ${totalNumberOfDeletedSucess} / notLoadetNotChanges: ${notLoadetNoChanges.length}`, "proces");
                        totalNumberOfFilesMustBeUploaded = 0;
                        totalNumberOfMustBeDeleted = 0;
                        totalNumberOfDeletedSucess = 0;
                        totalNumberOfFilesLoadetSuces = 0;
                    }
                };

                if (!loadAgentstatus) {
                    loger(`sync start try 3 / num must too Load : ${arrTryLoad.length} / list must to delete : ${fileMusteToDeleted.length} / notLoadetNotChanges: ${notLoadetNoChanges.length}`, "proces");
                    loadAgentstatus = await this.loadeAgent(arrTryLoad);
                    loger(`sync  done 3 / file load suces : ${countElementSucessDownload.length} / files delete sucess ${deliteFilesSuces.length} / file not load ${arrTryLoad.length}  `, "proces");
                    totalNumberOfFilesLoadetSuces = totalNumberOfFilesLoadetSuces + countElementSucessDownload.length;
                    if (loadAgentstatus) {
                        loger(`sync finish / list must to Load : ${totalNumberOfFilesMustBeUploaded} / list too loaded suces : ${totalNumberOfFilesLoadetSuces} / list files must to delete : ${totalNumberOfMustBeDeleted}  / list deletet suces : ${totalNumberOfDeletedSucess} / notLoadetNotChanges: ${notLoadetNoChanges.length}`, "proces");
                        totalNumberOfFilesMustBeUploaded = 0;
                        totalNumberOfMustBeDeleted = 0;
                        totalNumberOfDeletedSucess = 0;
                        totalNumberOfFilesLoadetSuces = 0;
                    }
                }
                if (!loadAgentstatus) {
                    loger(`sync start try 4 / num must too Load : ${arrTryLoad.length} / list must to delete : ${fileMusteToDeleted.length} / notLoadetNotChanges: ${notLoadetNoChanges.length}`, "proces");
                    loadAgentstatus = await this.loadeAgent(arrTryLoad);
                    loger(`sync  done  4 / file load suces : ${countElementSucessDownload.length} / files delete sucess ${deliteFilesSuces.length} / file not load ${arrTryLoad.length}  `, "proces");
                    totalNumberOfFilesLoadetSuces = totalNumberOfFilesLoadetSuces + countElementSucessDownload.length;
                    if (loadAgentstatus) {
                        loger(`sync finish / list must to Load : ${totalNumberOfFilesMustBeUploaded} / list too loaded suces : ${totalNumberOfFilesLoadetSuces} / list files must to delete : ${totalNumberOfMustBeDeleted}  / list deletet suces : ${totalNumberOfDeletedSucess} / notLoadetNotChanges: ${notLoadetNoChanges.length}`, "proces");
                        totalNumberOfFilesMustBeUploaded = 0;
                        totalNumberOfMustBeDeleted = 0;
                        totalNumberOfDeletedSucess = 0;
                        totalNumberOfFilesLoadetSuces = 0;
                    }
                }
                if (!loadAgentstatus) {
                    loger(`sync start try 5 / num must too Load : ${arrTryLoad.length} / list must to delete : ${fileMusteToDeleted.length} / notLoadetNotChanges: ${notLoadetNoChanges.length}`, "proces");
                    loadAgentstatus = await this.loadeAgent(arrTryLoad);
                    loger(`sync  done  5 / file load suces : ${countElementSucessDownload.length} / files delete sucess ${deliteFilesSuces.length} / file not load ${arrTryLoad.length}  `, "proces");
                    totalNumberOfFilesLoadetSuces = totalNumberOfFilesLoadetSuces + countElementSucessDownload.length;
                    if (loadAgentstatus) {
                        loger(`sync finish / list must to Load : ${totalNumberOfFilesMustBeUploaded} / list too loaded suces : ${totalNumberOfFilesLoadetSuces} / list files must to delete : ${totalNumberOfMustBeDeleted}  / list deletet suces : ${totalNumberOfDeletedSucess} / notLoadetNotChanges: ${notLoadetNoChanges.length}`, "proces");
                        totalNumberOfFilesMustBeUploaded = 0;
                        totalNumberOfMustBeDeleted = 0;
                        totalNumberOfDeletedSucess = 0;
                        totalNumberOfFilesLoadetSuces = 0;
                    }
                    if (!loadAgentstatus) {
                        loger(`sync finish / list must to Load : ${totalNumberOfFilesMustBeUploaded} / list too loaded suces : ${totalNumberOfFilesLoadetSuces} / list files must to delete : ${totalNumberOfMustBeDeleted}  / list deletet suces : ${totalNumberOfDeletedSucess} / notLoadetNotChanges: ${notLoadetNoChanges.length}`, "proces");
                    }
                    totalNumberOfFilesMustBeUploaded = 0;
                    totalNumberOfMustBeDeleted = 0;
                    totalNumberOfDeletedSucess = 0;
                    totalNumberOfFilesLoadetSuces = 0;
                }
            } else {}
            index++

        };
    }

    async loadeAgent(list: any): Promise < any > {
        countElementSucessDownload = [];
        arrTryLoad = [];
        let FILES_DONT_LOADET: any;
        FILES_DONT_LOADET = [];
        let index = 0;
        let counterLoadFiveList = 0;
        let repeatedSearch: any;
        repeatedSearch = [];

        return new Promise(async (resolve): Promise < any > => {
            function loader() {
                return new Promise((resolve): any => {
                    counterLoadFiveList++;
                    if (counterLoadFiveList != 5) {
                        resolve(true)
                    }
                    if (counterLoadFiveList === 5) {
                        setTimeout(function() {
                            counterLoadFiveList = 0;
                            resolve(true)
                        }, 10000);
                    } else {

                    }

                })
            }
            for (const name of list) {
                let fileName = Object.keys(name)[0];
                let remoteAudio = await this._remote.getAudio("radio/" + fileName);
                if (remoteAudio !== undefined && remoteAudio["statusCode"] !== 404) {

                    let size = Object.keys(list[index])[0];
                    size = list[index][size]["size"];

                    let sizeNum = parseInt(size);

                    let save = await this._locale.saveAudio(remoteAudio, fileName, sizeNum);
                    await loader();

                    if (save) {
                        countElementSucessDownload.push(fileName)
                    }

                    if (!save) {
                        loger(`Dispatcher.ts method get errCode / ошибка загрузки / нет ответа на запрос : "LO49897" ${fileName}`, "loading_error");
                        arrTryLoad.push(name)
                        FILES_DONT_LOADET.push(name)
                    }


                } else if (remoteAudio === undefined) {
                    loger(`Dispatcher.ts method get errCode / ошибка загрузки / нет ответа на запрос : "LO49897" ${fileName}`, "loading_error");
                    arrTryLoad.push(name)
                    FILES_DONT_LOADET.push(name)
                } else if (remoteAudio["statusCode"] !== 200) {
                    loger(`Dispatcher.ts method get errCode / статус не 200 / : "LO49897" ${fileName}`, "loading_error");
                    arrTryLoad.push(name)
                    FILES_DONT_LOADET.push(name)
                }
                if ((list.length - 1) === index) {
                    if (FILES_DONT_LOADET.length > 0) {
                        loger(FILES_DONT_LOADET, "list_must_load_files");
                        setTimeout(function() {
                            resolve(false);
                        }, 100000)
                    } else {
                        resolve(true);
                    }
                }
                index++;
            }

        })

    }

}