import * as utils from "utils.js"

/** @param {NS} ns **/
export async function main(ns) {
	if(ns.args.length<1)
	{
		ns.tprint("需要填写攻击目标");
		return;
	}
	var target = ns.args[0];

	var ramMax = 8;
	var limit  =ns.getPurchasedServerLimit();
	var servers = ns.getPurchasedServers();
	while(true)
	{
		var money = ns.getServerMoneyAvailable('home');
		if(servers.length<limit && money>ns.getPurchasedServerCost(ramMax))
		{
			var index = servers.length+1;
			var name = ns.purchaseServer('pserver-'+index,ramMax);
			if(name!="")
			{
				servers.push(name);
			}
		}

		for(var i in servers)
		{
			var server = servers[i];

			var cost = ns.getScriptRam('server.js');
			var thread = Math.ceil( ramMax/cost);
			
			if(!ns.isRunning('server.js',server))
			{   
				await ns.scp('server.js','home', server);
				ns.exec('server.js',server,thread,target);
			} 
		}

		await ns.sleep(1000);
	}

}