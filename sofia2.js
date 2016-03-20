/**
 * Copyright 2015 Indra Italia S.p.A.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

module.exports = function(RED) {
    "use strict";

	var kp = require('./kpMQTT');
	var ssapMessageGenerator = require("./SSAPMessageGenerator");
	var i=0;

	/* *************************************
		Configuration node "sofia2-server"
		************************************ */
	function Sofia2ConfigNode(m) {
		RED.nodes.createNode(this,m);
		i++;
		this.log("Entered function Sofia2ConfigNode(m)");
		
        // Store local copies of the node configuration (as defined in the .html)
		this.s2instance		= m.s2instance;
		this.s2port			= m.s2port;
		this.s2token		= m.s2token;
		this.s2kpkpinst		= m.s2kpkpinst;
		this.sessionKey		= null;
		this.myKp			= null;
		
        // copy "this" object in case we need it in context of callbacks of other functions.
        var node = this;
		// **** Creo la connessione
		node.log('Instance: ' + i);		
		var myKp = new kp.KpMQTT();
				
		myKp.connect(node.s2instance, node.s2port)
		.then(function() {
			// JOIN Message generation
			var ssapMessageJOIN = ssapMessageGenerator.generateJoinByTokenMessage(node.s2token, node.s2kpkpinst );
			return myKp.send(ssapMessageJOIN);
		})
		.then(function(joinResponse) {
			var joinResponseBody = JSON.parse(joinResponse.body);
			if (joinResponseBody.ok) {
				node.sessionKey = joinResponse.sessionKey;
				node.connected = true;
				node.log('<<<' + i + '>>>' + 'Session created with SIB with sessionKey: ' + node.sessionKey);
			} else {
				// TODO - verify exception management etc.
				node.error('Error subscribing to SIB: ' + joinResponse.body);
				//throw new Error('<<<' + i + '>>>' + 'Error subscribing to SIB: ' + joinResponse.body);
			}			
		})
		.done(function() {
			node.log('<<<' + i + '>>>' + ' Connection established');
			node.myKp = myKp;
		});
		
		/* Cleanup on re-deploy */
		this.on("close", function() {
			var ssapMessageLEAVE = ssapMessageGenerator.generateLeaveMessage(node.sessionKey);
            myKp.send(ssapMessageLEAVE)
			.then(function(leaveResponse) {
                var leaveResponseBody = JSON.parse(leaveResponse.body);
				if (leaveResponseBody.ok) {
					node.log('<<<' + i + '>>>' + 'Session closed with SIB');
				} else {
					node.error('<<<' + i + '>>>' + 'Error closing session with SIB: ' + leaveResponse.body);
				}
			})
            
			myKp.disconnect();
            node.log('<<<' + i + '>>>' + ' Connection terminated');
		});
	}
	RED.nodes.registerType("sofia2-server",Sofia2ConfigNode);

	/* *************************************
		Command node "sofia2"
		************************************ */
    function Sofia2InNode(n) {
        RED.nodes.createNode(this,n);
		this.log("entered function Sofia2InNode(n)");
	
		var sessionKey;
		var myKp;
		
       // Store local copies of the node configuration (as defined in the .html)
        this.topic			= n.topic;		// TODO: define what to do with it and if it should be mandatory
		this.s2cmdtype		= n.s2cmdtype;	// Command type. Currently "QUERY"|"INSERT"|"SUBSCRIBE"
		this.s2cmd			= n.s2cmd;		// SQLLIKE (currently) statement. The query, insert or subscription command.
		this.s2ontology		= n.s2ontology;	// The ontology on which to perform the command.

		// Retrieve the connection from config node "sofia2-server"
        this.s2server = RED.nodes.getNode(n.s2server);
        if (this.s2server) {
			this.log(">>> Retrieving connection data from config node sofia2-server");
			this.s2instance		= this.s2server.s2instance
			this.s2port			= this.s2server.s2port;
			this.s2token		= this.s2server.s2token;
			this.s2kpkpinst		= this.s2server.s2kpkpinst;
			this.s2querytype	= "SQLLIKE";	// TODO: Manage NATIVE too *************
		} else {
			// No config node configured
			this.error("ERROR: NO CONFIGURATION NODE AVAILABLE!");
		}
 
        // copy "this" object in case we need it in context of callbacks of other functions.
        var node = this;
        var msg = {};
        msg.topic = this.topic;

        // respond to inputs
        this.on('input', function (msg) {
			try{
				i++;
				sessionKey = this.s2server.sessionKey;
				myKp	= this.s2server.myKp;

				node.log('-------------------------------------------------------');
				node.log('-   ON INPUT:' + node.s2cmdtype);
				node.log('- ');
				node.log("-   this.s2server.sessionKey: " + sessionKey);
				node.log('-   <<<' + i + '>>>' + ' - received payload: ' + msg);
				node.log('-------------------------------------------------------');
				
				var payload_in = msg.payload;
				msg.payload = {};

				if (node.s2cmdtype =="QUERY"){	// *********************** QUERY *********************
					node.log('>>>>>>>>>>>>>>>>> QUERY <<<<<<<<<<<<<<<<');
					
					// *** If the incoming payload is not empty it overrides query field in the configuration
					// TODO: create a function and reuse this for every statement
					var query_cmd;
					if((payload_in==null)||(payload_in=="")) {
						node.log("Using command from configuration...");
						query_cmd = node.s2cmd;
					} else {
						node.log("Using command from incoming payload...");
						query_cmd = payload_in;
					}

					node.log('s2cmdtype: ' + node.s2cmdtype);
					node.log('query to be performed: ' + query_cmd);
					node.log('s2ontology: ' + node.s2ontology);
					node.log('sessionKey: ' + sessionKey);
						
					var ssapMessageQUERY = ssapMessageGenerator.generateQueryWithQueryTypeMessage(query_cmd, node.s2ontology , "SQLLIKE", null, sessionKey);
					node.log('ssapMessageQUERY: ' + ssapMessageQUERY);
					
					// perform the query
					myKp.send(ssapMessageQUERY)
					.then(function(queryResponse) {
						var queryResponseBody = JSON.parse(queryResponse.body);
						if (queryResponseBody.ok) {
							node.log('Query return: ' + queryResponseBody.data);
							node.log('Query Response OK');
							msg.payload = queryResponseBody.data;
						} else {
							// Don't throw exceptions to avoid Node crash!
							node.error('Error executing query in the SIB: ' + queryResponse.body, msg);
						}
					})
					.done(function() {
						node.log('<<<' + i + '>>>' + ' Query - Done');
						node.send(msg);
					});

				} else if (node.s2cmdtype =="INSERT"){	// *********************** INSERT *********************
					node.log('>>>>>>>>>>>>>>>>> INSERT <<<<<<<<<<<<<<<<');

					// TODO: create a function and reuse this for every statement
					var insert_cmd;
					if((payload_in==null)||(payload_in=="")) {
						node.log("Using command from configuration...");
						insert_cmd = node.s2cmd;
					} else {
						node.log("Using command from incoming payload...");
						insert_cmd = payload_in;
					}
					node.log('s2cmdtype: ' + node.s2cmdtype);
					node.log('query to be performed: ' + insert_cmd);
					node.log('s2ontology: ' + node.s2ontology);
					node.log('sessionKey: ' + sessionKey);

					var ssapMessageINSERT = ssapMessageGenerator.generateInsertMessage(insert_cmd, node.s2ontology, sessionKey);
						
					myKp.send(ssapMessageINSERT)
					.then(function(insertResponse) {
						var insertResponseBody = JSON.parse(insertResponse.body);
						if (insertResponseBody.ok) {
							node.log('Ontology Instance inserted in the SIB with ObjectId: ' + insertResponseBody.data);
							msg.payload = 'Ontology instance inserted: ' + insertResponseBody.data;	// TODO: change this with a return code or something
						} else {
							// Don't throw exceptions to avoid Node crash!
							node.error('Error inserting Ontology Instance in the SIB: ' + insertResponse.body, msg);
						}
					})
					.done(function() {
						node.log('<<<' + i + '>>>' + ' Insert - Done');
						node.send(msg);
					});
					
				} else if (node.s2cmdtype =="SUBSCRIBE"){	// *********************** SUBSCRIBE *********************
					node.log('>>>>>>>>>>>>>>>>> SUBSCRIBE <<<<<<<<<<<<<<<<');
					/*
						SUBSCRIBE has two outputs [msg, msg2]:
						* msg : SUBSCRIBE command return status
						* msg2 : INDICATIONS return values
					*/
					var msg2 = { payload:"" };	// Message for notifications
					node.log('query: ' + node.s2cmd);
					node.log('s2ontology: ' + node.s2ontology);
					node.log('s2querytype: ' + node.s2querytype);
					node.log('sessionKey: ' + sessionKey);
					
					// NOTIFICATION function. Gets invoked asynchronously whenever the subscribed event is matched
					var notificationPromise = new Promise(function(resolve, reject) {
						var onNotification = function(message) {
							//node.log("======> Notification for messageId: " + JSON.parse(message).messageId);	// Show the originating subscriptionID
							var notificationMessageBody = JSON.parse(message.body);
							if (notificationMessageBody.ok) {
								node.log("--");
								node.log('Received notification message with data: ' + notificationMessageBody.data);
								msg2.payload = notificationMessageBody.data;
								node.send([null,msg2]);
							} else {
								// Don't throw exceptions to avoid Node crash!
								node.error('Error in notification message: ' + notificationMessage.body);
							}
						};
						// ***** Register the callback ***
						myKp.setNotificationCallback(onNotification);
					});

					// TODO: retrieve the subscribed event from incoming payload? This could be tricky!
					var ssapMessageQUERY = ssapMessageGenerator.generateSubscribeWithQueryTypeMessage(node.s2cmd, node.s2ontology , node.s2querytype, 1000, sessionKey);	// TODO: parametrize the "1000" timeframe value somehow
					node.log('MessageSubscribe: ' + ssapMessageQUERY);
					myKp.send(ssapMessageQUERY)
					.then(function(subscribeResponse) {
						var queryResponseBody = JSON.parse(subscribeResponse.body);
						if (queryResponseBody.ok) {
							node.log('Subscribe OK - Subscription ID: '+ queryResponseBody.data);	// TODO: store this value and avoid multiple subscriptions
							msg.payload = 'Subscribed: ' + queryResponseBody.data;
						} else {
							node.error('Error executing Subscribe in the SIB: ' + notificationMessage.body, msg);
							//throw new Error('Error executing Subscribe in the SIB: ' + subscribeResponse.body);
						}
					})
					.done(function() {
						// Just send Subscribe result output (not the notifications):
						node.log('<<<' + i + '>>>' + ' Subscribe - Done');
						node.send([msg, null]);
					});	
				}
				// TODO: implement and manage UNSUBSCRIBE (how?)
				// TODO: implement and manage CONFIG (see http://about.sofia2.com/2014/04/14/conociendo-el-protocolo-de-interoperabilidad-de-sofia2-ssap/)
				
			} catch(e) {
				node.error('<<<' + i + '>>>' + ' ERROR: '+e.message);
			}
        });
    }
    RED.nodes.registerType("sofia2",Sofia2InNode);
}
