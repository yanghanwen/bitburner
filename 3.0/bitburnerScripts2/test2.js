import * as utils from "utils.js"
  
/** @param {NS} ns **/
export async function main(ns) { 
	ns.deleteServer('pserv-0'); 
	ns.deleteServer('pserv-1');
}