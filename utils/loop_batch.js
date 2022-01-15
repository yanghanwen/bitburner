let batchScript = '/utils/batch.js'

/** @param {NS} ns 
 * 	@param  arg0 = targets
 * 	@param  arg1 = hack
 * 	@param  arg2 = weaken1
 * 	@param  arg3 = grow
 * 	@param  arg4 = weaken2
 * 	@param  arg5 = rand
 * **/
export async function main(ns) 
{ 
	var host = ns.getHostname(); 
	var rand = ns.args[5];
	while(true)
	{
		var key = rand.toString() + Math.random();
		ns.exec(batchScript, host, 1, ns.args[0], ns.args[1], ns.args[2], ns.args[3], ns.args[4], key); 
		await ns.sleep(4000);
	}
}