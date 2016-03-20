node-red-contrib-sofia2
=====================

**PLEASE NOTE: This node is currently experimental and not yet cleaned up. USE IT AT YOUR OWN RISK**.

This is a node designed to interact with Sofia2 ontologies.

##Pre-requisite
The node has the following dependencies (currently not declared in `package.json`:

 1. mqtt@0.3.11: this is required by Sofia2 Node.js APIs. The node doesn't work with 1.6.x version right now.
 2. q, any version. 1.4.1 is fine.


##Install
Run the following command in the root directory of your Node-RED install.

    (sudo) npm install -g q
    (sudo) npm install -g --save mqtt@0.3.11
    (sudo) npm install -g node-red-contrib-sofia2

...and hope for the better.

##Usage
***[TBC]...***
	

##TO-DO 
* GENERAL
	* Add support for Native statements (currently only SQLLIKE supported)
* QUERY (and other)
	* Create structures and nodes to easily manage JSON and ontologies
* INSERT
	* Receive ontology from payload and override config statement
* SUBSCRIBE
	* create two outputs, one for subscribe outcome and another for notification data
