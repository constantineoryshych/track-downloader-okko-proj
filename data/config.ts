export interface IConfig {
    pathCarentPlayList:           string,
    checkToDeleatLeast:           string,
    serverSharingDir:             string,
    downloadDirectory:            string,
    getLoadListFromRemmotSource : string,
    saveLoadListLockalPath     :  string,
    createDataBasePath         :  string,   
    directoryCheackedDir :        string,
    readLocalLoadListDir       :  string,
    remmoteSourseServer: object,
    directoriesWhichDownloadDisabled: Array<string>  
}

export default {
    pathCarentPlayList          : "",
    checkToDeleatLeast          : "",
    serverSharingDir            : "",
    downloadDirectory           : "",
    getLoadListFromRemmotSource : "",
    saveLoadListLockalPath      : "",
    createDataBasePath          : "",   
    directoryCheackedDir        : "",
    readLocalLoadListDir        : "",
    remmoteRootContentDirr      : "",
    directoriesWhichDownloadDisabled : [
    ],
    remmoteSourseServer: {
        host:   "localhost",
        port:   8080,
    },  
} as IConfig;