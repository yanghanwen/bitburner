// /** 
//  * @param {NS} ns 
//  * **/
// export async function main(ns) { 
// 	var host = ns.getHostname();
// 	var all = ns.scan();
// 	for(var i in all)
// 	{
// 		var serverName = all[i];
// 		ns.tprintf("hack start %s ====> %s",host,serverName);

// 		if(serverName=='home')
// 		{
// 			ns.tprintf("忽略 %s ====> home",host);
// 			continue;
// 		}

// 		if(ns.hasRootAccess(serverName))
// 		{
// 			// ns.killall(serverName);
// 			ns.kill('hack1.js',serverName);
// 			ns.exec('hack1.js',serverName,1,serverName);

// 			ns.print("停止目标所有脚本并运行 hack1.js",host,"====>",serverName);
// 		}
// 	}

// }