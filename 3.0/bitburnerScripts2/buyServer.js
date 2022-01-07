/** @param {NS} ns **/
export async function main(ns) { 
	var servers = ns.getPurchasedServers();
	var serverAmount = servers.length;
	var limitCount = ns.getPurchasedServerLimit();
	if(serverAmount>=limitCount)
	{
		ns.tprint("购买数量超过上限");
		return;
	}

	//cost
	var money = ns.getServerMoneyAvailable('home'); 
	var suc = false;
	var ram = 0;
	var cost = 0;
	for(var i = 20; i>=1;--i)
	{
		ram = Math.pow(2,i);
		cost = ns.getPurchasedServerCost(ram);
		if(money>=cost)
		{
			suc = true;
			break;
		}
	} 
	if(!suc)
	{ 
		ns.tprintf("无法购买服务器（最低等级）,Cost=%s",cost);
		return;
	}
 
	ns.tprintf("购买服务器 Cost=%s , Ram=%s",cost,ram);

	//买服务器
	var server = ns.purchaseServer('pserv-'+serverAmount,ram);

	//拷贝文件
	await ns.scp(['b.js','batch1.js','grow.js','hack.js','weaken.js'],'home',server);

	//执行
	var key = ns.getTimeSinceLastAug() + Math.random().toString(); 
	ns.exec('b.js',server,1,'n00dles',key);
	
	ns.tprintf("服务器 部署完成");
}