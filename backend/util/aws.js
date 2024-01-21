import { nanoid } from 'nanoid';
import {PutObjectCommand, S3Client} from "@aws-sdk/client-s3";
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Clinet = new S3Client({
    region:'ap-south-1',
    credentials:{
        accessKeyId:"AKIAQXA7HWAY3V6Z2GEC",
        secretAccessKey:"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"
    }
});


async function putObject(fileName,contentType){
    //filename can be anything
    const command = new PutObjectCommand({
        Bucket:'apkapashustorage',
        Key:`uploads/${fileName}`,//where to store
        ContentType:contentType
    });

    const url = await getSignedUrl(s3Clinet,command,{expiresIn:60});

    return url;
}

 const getS3URL = async (imageName) => {
    return await putObject(imageName,'image/jpeg')
}

export default getS3URL;
