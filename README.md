node-red-contrib-sofia2
=======================
A node designed to interact with Sofia2 ontologies. It allows to perform QUERY, INSERT and SUBSCRIBE commands.
It was developed starting from Sofia2 Node.js APIs available [here](http://sofia2.org/apis/SOFIA2_API_NODEJS/SOFIA2_API_NODEJS.zip).

##Pre-requisites
The node relies on Q promises and on MQTT for communications.
Run the following commands in the root directory of your Node-RED install:

>     (sudo) npm install -g q
>     (sudo) npm install -g --save mqtt

    
##Install
Run the following commands in the root directory of your Node-RED install; 
    

> (sudo) npm install -g node-red-contrib-sofia2

	
##Usage

 1. Set up a CONFIG node with connection data (SOFIA2 instance address, port, KP, KP instance, auth token)
 2. Assign a CONFIG node to a SERVER node and fill in parameters based on the selected operation.

**NOTE**: QUERY and INSERT nodes only have one optput; however, SUBSCRIBE node has two -the first one being the output from "subscribe" operation, the other one dedicated to indications getting notified from Sofia2.

##TO-DO 
 - Add support for NATIVE statements (currently only SQLLIKE is supported)
 - Extend usability, create a complete testing suite
 - Create structures and nodes to easily manage JSON and ontologies
 - Documentation etc
 - ...and so much more...
