import * as utils from "utils.js"

/** @param {NS} ns **/
export async function main(ns) {
	var myServers = ns.getPurchasedServers();
	myServers.push('home');

	var scans = utils.scan(ns);
	for(var i in scans)
	{
		var temp = scans[i];

		if(myServers.includes(temp))
		{
			ns.print("忽略 %s",temp);
			continue;
		}

		ns.tprintf("=============== 开始处理 %s",temp);
		
		//拷贝
		await ns.scp([
			'root.js',
			'hack_self_1.js',
			'hack_3.js',

			//批处理
			'hack.js',
			'weaken.js',
			'grow.js',
			'batch1.js',
			'b.js',
			
			],ns.getHostname(),temp); 
		ns.tprintf("拷贝完成 %s",temp);

		//执行ROOT
		if(!ns.hasRootAccess(temp)){
			var pid = ns.run('root.js',1,temp);
			if(pid==0)
			{
				ns.print("执行 root.js 失败");
			}
			else
			{
				ns.print("执行 root.js 成功");
				await ns.sleep(100);
			}
		} 
		
		if(ns.hasRootAccess(temp))
		{
			//杀掉目标进程
			//ns.killall(temp);
			//await ns.sleep(100);

			pid = ns.exec('hack_self_1.js',temp,1,temp); 
			if(pid==0)
			{
				ns.print("执行 hack_self_1.js 失败");
			}
			else
			{
				ns.print("执行 hack_self_1.js 成功"); 
			}
		}
		else
		{
				ns.print("hack 跳过，目标无root权限"); 
		}
		
		ns.tprintf("处理结束 %s",temp);
	}
}