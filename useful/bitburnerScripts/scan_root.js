/** 
 * @param {NS} ns 
 * 对本机周边所有节点进行root
 * **/
export async function main(ns) {
    var host = ns.getHostname();
    var all = ns.scan();
    var root = [];
    for (var i in all) {
        var serverName = all[i];
        if (serverName == 'home') {
            tprintf("忽略 %s ====> home", host);
            continue;
        }

        if (!ns.hasRootAccess(serverName)) {
            ns.run("root.js", 1, serverName);
            if (!ns.hasRootAccess(serverName)) {
                ns.tprintf("%s root权限 已获取失败", serverName);
            }
        }

        if (ns.hasRootAccess(serverName)) {
            ns.tprintf("%s root权限 已获取", serverName);
            root.push(serverName);
        }
    }

}