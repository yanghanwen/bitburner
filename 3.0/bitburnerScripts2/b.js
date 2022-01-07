/** @param {NS} ns **/
export async function main(ns) {
	var host = ns.getHostname();
	var target = ns.args[0]; 

	ns.tprintf("from %s run hack to =%s",host,target);
	
	//清除缓存 TODO
	
	await ns.sleep(300);

	while(true)
	{ 
		var rand = ns.getTimeSinceLastAug() + Math.random().toString();//Math.random();   
		var key = rand.toString();

		var pid = ns.exec("batch1.js",host,1,target,key);
		if(pid == 0)
		{
			ns.tprintf("运行失败");
		} 
		
		await ns.sleep(1000);
	}
}