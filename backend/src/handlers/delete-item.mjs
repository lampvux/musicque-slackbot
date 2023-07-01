// Create clients and set shared const values outside of the handler.

// Create a DocumentClient that represents the query to add an item
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, DeleteCommand } from '@aws-sdk/lib-dynamodb';

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

const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

// Get the DynamoDB table name from environment variables
const tableName = process.env.MUSICQUE_TABLE;


/**
 * A simple example includes a HTTP get method to get one item by id from a DynamoDB table.
 */
export const deleteByIdHandler = async (event) => {
    if (event.httpMethod !== 'DELETE') {
      throw new Error(`getMethod only accept DELETE method, you tried: ${event.httpMethod}`);
    }
    // All log statements are written to CloudWatch
    console.info('delete item:', event);
   
    // Get id from pathParameters from APIGateway because of `/{id}` at template.yaml
    const id = event.pathParameters.id;
   
    // Get the item from the table
    // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#get-property
    var params = {
      TableName : tableName,
      Key: { id: id },
    };
  
    try {
      await ddbDocClient.send(new DeleteCommand(params));
      console.log(`Item with ID ${id} deleted from table ${tableName}`);
    } catch (err) {
        console.error(`Error deleting item with ID ${id} from table ${tableName}: ${err}`);
        throw err;
    }
   
    const response = {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Headers" : "Content-Type",
        "Access-Control-Allow-Origin": "*", //DO NOT USE THIS VALUE IN PRODUCTION - https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-cors.html
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET,DELETE"
    },
      body: JSON.stringify(item)
    };
   
    // All log statements are written to CloudWatch
    console.info(`response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`);
    return response;
  }
  