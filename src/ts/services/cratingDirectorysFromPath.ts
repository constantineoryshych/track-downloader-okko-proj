import { fs } from 'fs';

export function directoryCreater(path): void{
    let root = "C:/radio/";
    let pathToDir = root +  path + "/";
        if (!fs.existsSync(pathToDir)){
            fs.mkdir(pathToDir, {recursive: true}, err => {});
        }
}