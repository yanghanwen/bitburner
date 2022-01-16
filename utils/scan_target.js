import * as scan from '/utils/scan.js'

/** @param {NS} ns **/
export async function main(ns) {
	if(ns.args.length==0)
	{
		ns.alert("args error");
		return;
	}
	
	var target = ns.args[0];

	var path = await scan.scanPath(ns,target); 
	var r = ""; 
	path = path.reverse();
	for(var i in path)
	{
		var temp = path[i];
		if(temp=='home')
		{
			continue;
		}
		r+="connect "+ temp +"; ";
	}	

	if(r!="")
	{ 
		ns.tprintf("获取目标成功，复制以下命令运行：");
		ns.tprintf(r);
	}
	else
	{
		ns.tprintf("获取目标失败"); 
	}
}