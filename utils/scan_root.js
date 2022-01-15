import * as scan from "/utils/scan.js"

let rootScript = '/utils/root.js'

/** 
 * root所有已知节点
 * @param {NS} ns
 *  
 * **/
export async function main(ns) {
	//var host = ns.getHostname();
	var scans = scan.scan(ns);
	for(var i in scans)
	{
		var temp = scans[i];
		var pid = 0;
		while(pid == 0)
		{
		    pid = ns.exec(rootScript,'home',1,temp);

			if(pid == 0)
			{
				ns.print("调用root失败");
				await ns.sleep(100);
			}
		}
	}
	ns.tprint("----- 全部列表root完毕");
}