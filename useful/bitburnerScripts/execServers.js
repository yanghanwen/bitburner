var scripts = [ "root.js","hack1.js","hack2.js","server1.js"];

/** 
 * @param {NS} ns 
 * 
 * （在home)一键部署所有（已拥有的）服务器
 * **/
export async function main(ns) { 
	var target = ns.args[0];//执行目标 

	var servers = ns.getPurchasedServers();
	for(var i = 0;i<servers.length;++i)
	{
		var serverName = servers[i];
		
		//停止正在运行的脚本
		ns.killall(serverName); 

		for(var j in scripts)
		{
			var script = scripts[j];
			await ns.scp(script,'home',serverName);  
			ns.tprintf("拷贝 %s 到 %s ",script,serverName); 
		}
		
        await ns.exec('server1.js',serverName,1,target);  
	}
}