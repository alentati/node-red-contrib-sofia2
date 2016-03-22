node-red-contrib-sofia2
=====================

**PLEASE NOTE: This node is currently experimental and not yet finalized**.

This is a node designed to interact with Sofia2 ontologies. It allows to perform query, insert and subscribe commands.
It has been developed starting from Sofia2 Node.js APIs available here: http://sofia2.org/apis/SOFIA2_API_NODEJS/SOFIA2_API_NODEJS.zip

##Pre-requisite
The node has the following dependencies (currently not declared in `package.json`, so they must be installed manually):

 1. mqtt
 2. q


##Install

Run the following commands in the root directory of your Node-RED install;
 
    (sudo) npm install -g q
    (sudo) npm install -g --save mqtt
    (sudo) npm install -g node-red-contrib-sofia2

(Sooner or later I'll add mqtt and q dependencies into package.json for a quicker installation)
	
##Usage

 1. Set up a CONFIG node with connection data (SOFIA2 instance address, port, KP, KP instance, auth token)
 2. Assign a CONFIG node to a SERVER node and fill in parameters based on the selected operation (TBC)

**NOTE**: QUERY and INSERT nodes only have one optput; however, SUBSCRIBE node has two -the first one being the output from "subscribe" operation, the other one dedicated to indications getting notified from Sofia2.


##TO-DO 

 - Fix node crash if connection fails
 - Manage connection timeout (currently the node sinply stops to output data)
 - Add support for NATIVE statements (currently only SQLLIKE is supported)
 - Create structures and nodes to easily manage JSON and ontologies
 - ...and so much more...
