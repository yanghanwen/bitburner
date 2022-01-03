/** @param {NS} ns **/
export async function main(ns) {
	//在自己所有服务器上执行指定代码（目前默认会把target作为参数传给代码）

	var script = ns.args[0]; //执行脚本
	var target = ns.args[1];//执行目标

	if(script=="")
	{
		tprint("参数[0] 需要脚本名");
		return;
	}
	if(target=="")
	{
		tprint("参数[1] 需要执行目标");
		return;
	}

	var servers = ns.getPurchasedServers();
	for(var i = 0;i<servers.length;++i)
	{
		var serverName = servers[i];
		var server = ns.getServer(serverName);
		
		//停止正在运行的脚本
		ns.killall(serverName); 

		//吃光内存
		var needRam = ns.getScriptRam(script,serverName);
		var maxRam = ns.getServerMaxRam(serverName);
		var thread = Math.floor(maxRam/needRam);

		await ns.scp(script,'home',serverName); 
		ns.tprintf("拷贝 %s 到 %s ",script,serverName);     
        await ns.exec(script,serverName,thread,target); 
	}
}
