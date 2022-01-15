import * as scan from 'utils/scan.js'

let deployScript = 'server/deploy.js'

/** 
 * 需要在home主机调用
 * 一键启动部署（所有已购买的）服务器
 * @param {NS} ns 
 * **/
export async function main(ns) 
{ 
	if(ns.args.length<1)
	{
		ns.tprint('error args');
		return;
	}
	var target = ns.args[0];

	//部署购买的服务器
	var all = ns.getPurchasedServers();
	for(var i in all)
	{
		ns.tprintf("服务器 [%s] 部署",server);
		var server = all[i];
		ns.exec(deployScript,'home',1,server,target);
	} 

	//部署全部正常机器
	var scans = scan.scan(ns);
	for(var i in scans)
	{
		ns.tprintf("网络节点 [%s] 部署",server); 
		var server = scans[i];
		ns.exec(deployScript,'home',1,server,target);
	}
}