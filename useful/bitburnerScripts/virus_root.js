/** 
 * @param {NS} ns 
 * 对本机周边所有节点进行root
 * **/
export async function main(ns) { 
	var host = ns.getHostname();
	var all = ns.scan();
	var root = [];
	for(var i in all)
	{
		var serverName = all[i];
		if(serverName=='home')
		{
			tprintf("忽略 %s ====> home",host);
			continue;
		}

		ns.run("root.js",1,serverName);
		if(!ns.hasRootAccess(serverName))
		{
			ns.tprintf("获取 %s root权限失败",serverName);
		}
		else
		{ 
			ns.tprintf("获取 %s root权限成功",serverName); 
			root.push(serverName);
		}
 
		return root; 
	}

}