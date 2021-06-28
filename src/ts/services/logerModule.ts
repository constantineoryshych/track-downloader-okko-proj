import fs from "fs";
import {
    SSL_OP_ALL
} from "constants";
import {
    createTracing
} from "trace_events";
const root = "C:/radio/script/data/apliicationLogs";

const logDirectories = [{
        loading_successful: "/loading_successful/"
    },
    {
        loading_error: "/loading_error/"
    },
    {
        file_deleted: "/file_deleted/"
    },
    {
        list_must_load_files: "/list_must_load_files/"
    },
    {
        notLoadetNotChanges: "/notLoadetNotChanges/"
    },
    {
        elseError: "/elseError/"
    },
    {
        proces: "/proces/"
    },
]

let arrayHystory: any;
arrayHystory = [];

export async function directoryCreater(): Promise < any > {
    logDirectories.forEach(function(item, i, arr) {
        return new Promise((resolve) => {
            let pathToDir = root + item[Object.keys(item)[0]];
            if (!fs.existsSync(pathToDir)) {
                fs.mkdir(pathToDir, {
                    recursive: true
                }, err => {});
                if ((arr.length - 1) === i) resolve(true)
            }
        });
    })
}

export async function loger(log: any, type: string): Promise < void > {

    if (type === "proces") {
        arrayHystory.push({
            log,
            type
        });
    }

    switch (type) {
        case "loading_successful":
            crateLog(logDirectories[0]["loading_successful"], log + "файл загружен успешно", "loading_successful");
            break;
        case "loading_error":
            crateLog(logDirectories[1]["loading_error"], log + "ошибка загрузки файла", "loading_error");
            break;
        case "file_deleted":
            crateLog(logDirectories[2]["file_deleted"], JSON.stringify(log) + "файл удален", "file_deleted");
            break;
        case "list_must_load_files":
            crateLog(logDirectories[3]["list_must_load_files"], JSON.stringify(log) + "файл который должен быть загружен", "list_must_load_files");
            break;
        case "notLoadetNotChanges":
            crateLog(logDirectories[4]["notLoadetNotChanges"], log + "файл небудет загружен так как небыл изменен", "notLoadetNotChanges");
            break;
        case "proces":
            crateLog(logDirectories[6]["proces"], log, "proces");
            break;
        default:
            crateLog(logDirectories[5]["elseError"], log + "else error", "elseError");
    }

}

function nameLogController(): string {
    const date = new Date();
    const yyy = date.getFullYear();
    const mm = date.getMonth() + 1;
    const dd = new Date().getDate();
    const HH = new Date().getHours();
    const MM = new Date().getMinutes();
    const SS = new Date().getSeconds();
    const time = HH + ":" + MM + ":" + SS;
    const name = yyy + "_" + mm + "_" + dd;
    return name;
}

function crateLog(path, log, logName) {
    fs.appendFile(root + path + nameLogController() + "_" + logName + ".txt", `\n${new Date() + "  -  " + log} \r\n`, function(error) {});
}