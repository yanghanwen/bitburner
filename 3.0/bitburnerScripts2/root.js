//定义你需要指定的程序
//会按照数组顺序依次执行
//如果不存在则不会执行
var utils = ["BruteSSH.exe", "FTPCrack.exe", "relaySMTP.exe", "HTTPWorm.exe", "SQLInject.exe", "NUKE.exe"];

/** 
 * 尝试对目标使用所有程序,获取ROOT权限
 * @param {NS} ns  
 **/
export async function main(ns) {

    var target = ns.args[0];
    ns.print("<<<<<<<<<<<<<<<< 运行root.js start", target);

    root(ns, target);

    ns.print(">>>>>>>>>>>>>>>> 运行root.js end ", target);
}

/** 
 * 尝试对目标使用所有程序,获取ROOT权限
 * @param {NS} ns 
 * @param host 目标主机 
 **/
function root(ns, host) {
    for (var i in utils) {
        runFile(ns, utils[i], host);
    }
}

/** 
 * 尝试对目标使用指定程序
 * @param {NS} ns 
 * @param file 指定程序 
 * @param host 目标主机 
 **/
function runFile(ns, file, host) {
    var flag = true;

    //file 理论上应该是home拥有了就可以使用
    if (utils.includes(file) && ns.fileExists(file, 'home')) {
        ns.print("尝试使用程序", file);

        switch (file) {
            case "NUKE.exe":
                {
                    if (isPortOpen(ns, host)) {
                        ns.nuke(host);
                    } else {
                        ns.tprintf("端口不满足NUKE运行条件");
                        flag = false;
                    }
                }
                break;
            case "BruteSSH.exe":
                {
                    ns.brutessh(host);
                }
                break;
            case "FTPCrack.exe":
                {
                    ns.ftpcrack(host);
                }
                break;
            case "relaySMTP.exe":
                {
                    ns.relaysmtp(host);
                }
                break;
            case "HTTPWorm.exe":
                {
                    ns.httpworm(host);
                }
                break;
            case "SQLInject.exe":
                {
                    ns.sqlinject(host);
                }
                break;
            default:
                {
                    flag = false;
                }
                break;
        }
    } else {
        flag = false;
    }

    if (flag) {
        ns.tprintf("[%s] run [%s] 成功", host, file);
    } else {
        ns.tprintf("[%s] run [%s] 失败", host, file);
    }
    return flag;
}

/** 
 * 目标的端口是否满足需要
 * @param {NS} ns  
 * @param host 目标主机 
 **/
function isPortOpen(ns, host) {
    var server = ns.getServer(host);
    return server.openPortCount >= server.numOpenPortsRequired;
}