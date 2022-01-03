var utils = ["NUKE.exe","BruteSSH.exe","FTPCrack.exe","relaySMTP.exe","HTTPWorm.exe","SQLInject.exe"];

/** @param {NS} ns **/
export async function main(ns) { 
}

//尝试对目标使用所有程序
export function runall(ns , host)
{
	ns.tprintf("尝试使用所有程序 at %s",host);
	for(var i in utils)
	{
		 run(ns , utils[i] , host);
	}
}

export function run(ns , file , host)
{ 
	var flag = true;
	if(utils.includes(file) && ns.fileExists(file))
	{
		ns.tprintf("尝试使用程序 %s",file);

		switch(file)
		{
			case "NUKE.exe":{
			 	ns.nuke(host);
			}
			break;
			case "BruteSSH.exe":{
				ns.brutessh(host);
			}
			break;
			case "FTPCrack.exe":{
				ns.ftpcrack(host);
			}
			break;
			case "relaySMTP.exe":{
				ns.relaysmtp(host);
			}
			break;
			case "HTTPWorm.exe":{
				ns.httpworm(host);
			}
			break;
			case "SQLInject.exe":{
				ns.sqlinject(host);
			}
			break;
			default:
			{
				flag=false; 
			}break;
		}
	}
	else
	{
		flag=false;
	}

	if(flag)
	{ 
		ns.tprintf("%s 成功使用 %s",host,file);  
	}
	else
	{
		ns.tprintf("%s 不存在、或者未安装 指定文件 %s",host,file);  
	}
}
