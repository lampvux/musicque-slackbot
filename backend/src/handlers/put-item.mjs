// Create clients and set shared const values outside of the handler.
// Core Nodejs
import fs from 'fs';
// Create a DocumentClient that represents the query to add an item
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
// S3
import { S3 } from '@aws-sdk/client-s3';
// Youtube DL
import ytdl from 'ytdl-core';
// uuid
import { v4 as uuidv4 } from 'uuid';
// Slack Bolt
const { App, AwsLambdaReceiver  } = require('@slack/bolt');

//DynamoDB Endpoint
const ENDPOINT_OVERRIDE = process.env.ENDPOINT_OVERRIDE;
let ddbClient = undefined;

if(ENDPOINT_OVERRIDE){
  ddbClient = new DynamoDBClient({ endpoint: ENDPOINT_OVERRIDE });    
}
else{  
  ddbClient = new DynamoDBClient({});    // Use default values for DynamoDB endpoint
  console.warn("No value for ENDPOINT_OVERRIDE provided for DynamoDB, using default");
}
// s3 init
const s3 = new S3();
const s3BucketName = process.env.S3_BUCKET_NAME;
const s3Key = process.env.S3_KEY;
// DynamoDB init client
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

// Get the DynamoDB table name from environment variables
const tableName = process.env.MUSICQUE_TABLE;

// Initialize your custom receiver
const awsLambdaReceiver  = new AwsLambdaReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET,  
});

// Initializes your app with your bot token and signing secret
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  receiver: awsLambdaReceiver 
});

// get youtube url from slack message
const getYoutubeUrlFromMessage = (message) => {
  const youtubeUrlRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(.+)/g;
  const youtubeUrl = youtubeUrlRegex.exec(message);
  return youtubeUrl[0];
} 

// get youtube data from url
const getYoutubeData = async (url) => {
  const response = await fetch(`https://www.youtube.com/oembed?url=${url}&format=json`);
  const data = await response.json();
  return data;
}

// transform youtube data to dynamodb column data
const transformYoutubeDataToMusicQueData = (youtubeData) => {
  const id = uuidv4();
  const url = youtubeData.url;
  const title = youtubeData.title;
  const thumbnailUrl = youtubeData.thumbnail_url;
  const s3PublicUrl = youtubeData.s3PublicUrl;
  const s3Key = youtubeData.s3Key;

  return { id, url, title, thumbnailUrl, s3PublicUrl, s3Key };
};

// download and upload video to s3 bucket
const downloadAndUploadToS3 = async (youtubeUrl, videoTitle, s3BucketName, s3Key) => {
  const videoReadableStream = ytdl(youtubeUrl, { filter: 'audioonly' });
  const videoWriteableStream = fs.createWriteStream(`/tmp/${videoTitle}.mp4`);

  videoReadableStream.pipe(videoWriteableStream);

  await new Promise((resolve, reject) => {
    videoWriteableStream.on('finish', resolve);
    videoWriteableStream.on('error', reject);
  });

  const videoBuffer = fs.readFileSync(`/tmp/${videoTitle}.mp4`);

  const {Key} =  await s3.putObject({
    Bucket: s3BucketName,
    Key: s3Key,
    Body: videoBuffer,
  }).promise();

  console.log(`Video ${videoTitle} uploaded to S3 bucket ${s3BucketName} with key ${s3Key}`);

  const s3PublicUrl = `https://${s3BucketName}.s3.amazonaws.com/${s3Key}`;

  return { Key, s3PublicUrl};
};

// PUT Item to DynamoDB
const putDataToDynamoDB = async (data) => {  
  // Creates a new item, or replaces an old item with a new item
  // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#put-property
  const params = {
      TableName : tableName,
      Item: data
  };

  try {
      const data = await ddbDocClient.send(new PutCommand(params));
      console.log("Success - item added or updated", data);
      return data;
    } catch (err) {
      console.error("Error adding or updating item:", err.message);
      console.error("Error code:", err.code);
      console.error("Error name:", err.name);
      console.error("Error stack:", err.stack);

      throw err;
    }
}


const start = async ({ message, say }) => {
  try {

    message = message.text;

    const youtubeUrl = getYoutubeUrlFromMessage(message);
    const youtubeData = await getYoutubeData(youtubeUrl);    
    const {Key, s3PublicUrl} = await downloadAndUploadToS3(youtubeUrl, youtubeData.title, s3BucketName, s3Key );
    // set more data to be saved to dynamodb
    youtubeData.url = youtubeUrl;
    youtubeData.s3PublicUrl = s3PublicUrl;
    youtubeData.s3Key = Key;

    const musicQueData = transformYoutubeDataToMusicQueData(youtubeData);

    const data = await putDataToDynamoDB(musicQueData);
    if (data) {
      await say(`Well done, <@${message.user}> :wave: Your song has been added to the music què! `);
    }
  } catch (error) {
    console.log("Error in process message", error)
    await say(`Ơ :sad:, <@${message.user}> Some error occur, blame the BOT maintenancer, not me :( ! `);
  }
}


// Listens for messages that contain youtube url
app.message(new RegExp("youtu", "i"), start);


/**
 * A simple example includes a HTTP post method to add one item to a DynamoDB table.
 */
export const putItemHandler = async (event,  context, callback) => {
    if (event.httpMethod !== 'POST') {
        throw new Error(`postMethod only accepts POST method, you tried: ${event.httpMethod} method.`);
    }
    // All log statements are written to CloudWatch
    console.info('received:', event);
    const handler = await awsLambdaReceiver.start();
   
    return handler(event, context, callback);
   
};
