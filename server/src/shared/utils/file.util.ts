import { ReadStream } from "fs"

export function validateFileFormat(filename:string, allowedFileFormats: string[]){
    const fileParts = filename.split('.')
    const extension = fileParts[fileParts.length - 1]

    return allowedFileFormats.includes(extension)
}

export async function validateFileSize(fileStream: ReadStream, allowedFileSizeInBytes: number)
{
    return new Promise((res,rej) => {
        let fileSizeInBytes = 0

        fileStream
        .on('data',(data: Buffer) => {
            fileSizeInBytes = data.byteLength
        })
        .on('end', () => {
            res(fileSizeInBytes <= allowedFileSizeInBytes)
        })
        .on('error', err => rej(err))
    })
}