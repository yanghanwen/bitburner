import * as utils from "utils.js"

/** @param {NS} ns **/
export async function main(ns) { 
	var servers = ns.getPurchasedServers();
	var except = [];
	for(var i in servers)
	{
		var server = servers[i];
		
		//拷贝文件 
		await ns.sleep(1000);
		await ns.scp(['b.js','batch1.js','grow.js','hack.js','weaken.js'],'home',server);

		await ns.sleep(1000);

		//获取最高价值的目标
		var target  = utils.getCustomer(ns,except);
		except.push(target);

		//执行
		var key = ns.getTimeSinceLastAug() + Math.random().toString(); 
		ns.exec('b.js',server,1,target,key);

		ns.tprintf("在服务器 %s 上执行攻击，目标 %s",server,target);
	}
}