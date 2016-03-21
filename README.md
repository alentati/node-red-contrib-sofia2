node-red-contrib-sofia2
=====================

**PLEASE NOTE: This node is currently experimental and not yet finalized**.

This is a node designed to interact with Sofia2 ontologies. It allows to perform query, insert and subscribe commands.
It has been developed starting from Sofia2 Node.js APIs available here: http://sofia2.org/apis/SOFIA2_API_NODEJS/SOFIA2_API_NODEJS.zip
Due to this, it currently works over MQTT and makes use of mqtt 0.3.11.

##Pre-requisite
The node has the following dependencies (currently not declared in `package.json`:

 1. mqtt@0.3.11: this is required by Sofia2 Node.js APIs. The node doesn't work with 1.6.x version right now.
 2. q, any version. 1.4.1 is fine.


##Install
**PLEASE NOTE: Installation process at the moment is quite troublesome, particularly with MQTT dependencies. Right now yoy have to manually fix the dependencies, sorry for that -hope to fix it soon.**.

Run the following command in the root directory of your Node-RED install.
 
    (sudo) npm install -g q
    (sudo) npm install -g --save mqtt@0.3.11
    (sudo) npm install -g node-red-contrib-sofia2

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
