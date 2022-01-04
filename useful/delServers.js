/** @param {NS} ns **/
export async function main(ns) {
	var servers = ns.getPurchasedServers();
	for(var i =0;i<servers.length;++i)
	{
		var host = servers[i];
		ns.killall(host);
		if(ns.deleteServer(host)){
			ns.tprintf("删除服务器 %s",host);
		}else{
			ns.tprintf("删除服务器失败");
		}
	}
}
