import * as fs from 'fs';

export const validatePayload = (payload: any, schema: any) => {
    return schema.validate(payload);
};

export const writeFiles = (
    filePathOnServer: string,
    fileData: string | Buffer,
) => {
    fs.writeFile(filePathOnServer, fileData, (err) => {
        if (err) throw new Error(`File writing error`);
    });
};


export function capitalizeName(name) {
    var words = name.split(' ');
    for (var i = 0; i < words.length; i++) {
        words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1);
    }
    return words.join(' ');
}