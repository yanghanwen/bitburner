import * as util from "hackUtils.js"

/** @param {NS} ns **/
export async function main(ns) { 

	//扫描伺服器
	var host = ns.getHostname();//ns.args[0]; 
	var scans = ns.scan(host); 

	var self = ns.getScriptName();
	var hack = 'hack1.js';

	//首先要保证本机上有可以执行的hack

	for(var i =0;i<scans.length;++i)
	{  
		ns.tprintf("<<<<<<<<<<<<<<<<<<<<<<<<<< [%s] ====> [%s] start <<<<<<<<<<<<<<<<<<<<<<<<<",host,scan); 

		var scan = scans[i];

		//获取ROOT权限
		if(!util.root(ns,scan))
		{ 
			ns.tprintf("-------- [%s] 未能正常破解，终止递归",scan);
			return;
		}


		//拷贝必要文件
		await ns.scp('hackUtils.js',host,scan);
		await ns.scp(hack,host,scan);
		await ns.scp(self,host,scan);  
		ns.tprintf("-------- [%s] 目标破解流程结束，拷贝必要资源",scan);

		if(ns.isRunning(hack,scan))
		{
			ns.tprintf("脚本 %s 已经在 %s 执行，终止递归",hack,scan);
			return;
		}

		//在目标机链式调用本代码
		var thread = util.getScriptThread(ns,self,scan);
		if(thread<=0)
		{
			ns.tprintf("无法在%s执行，thread = 0",host);
		}
		else
		{
			ns.tprintf("在 %s 上执行 %s，thread = [ %s ] ",scan,self,thread);
        	await ns.exec(self,scan,thread,scan); 
		}
		ns.tprintf("-------- [%s] ====> [%s] 病毒已传播",host,scan);

		/*
		//在目标机执行 hack
		var hackThread = util.getScriptThread(ns,hack,host); 
		if(hackThread<=0)
		{
			ns.tprintf("无法在%s执行，thread = 0",host);
		}
		else
		{
        	var pid = await ns.exec(hack,scan,hackThread,scan); 
			if(pid==0)
			{
				ns.tprintf("在 %s 上执行 %s 失败，thread = [ %s ] ",scan,hack,hackThread); 
			}
			else
			{ 
				ns.tprintf("在 %s 上执行 %s，thread = [ %s ] ",scan,hack,hackThread);
			}
		}
		*/
		
		ns.tprintf(">>>>>>>>>>>>>>>>>>>>>>>>>> [%s] ====> [%s] end >>>>>>>>>>>>>>>>>>>>>>>>>",host,scan); 

		await ns.sleep(100);
	}

	//因为这整套脚本的开销很大，因此需要在这个脚本最后调用spawn释放这个启动脚本
	//并且延时开启真正的主角 hack()
	ns.tprintf("----- [%s] ====> [%s] end 十秒后启动hack",host,scan); 
	var hackThread = util.getScriptThread(ns,hack,host); 
	ns.spawn(hack,hackThread,host);
}
