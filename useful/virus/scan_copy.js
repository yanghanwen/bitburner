var require = [
    //基本工具
    "root.js", "hack1.js", "hack2.js",
    //二次封装
    "scan_copy.js",
    "scan_root.js",
    "scan_run_hack.js",
    "scan_virus.js",
    "scan_virus2.js",
    //库函数 
    //"func1.js",
];

/**
 *  @param {NS} ns 
 * 
 *  对周边节点拷贝需要的
 **/
export async function main(ns) {
    var host = ns.getHostname();
    var all = ns.scan();

    for (var i in all) {
        var serverName = all[i];
        if (serverName == 'home') {
            ns.tprintf("忽略 %s ====> home", host);
            continue;
        }

        for (var j in require) {
            if (!ns.hasRootAccess(serverName)) {
                ns.tprintf("拷贝 %s ====> %s 失败，目标无ROOT权限", host, serverName);
                continue;
            }
            var s = require[j];
            await ns.scp(s, host, serverName);
        }

        ns.tprintf("拷贝结束 %s ====> %s ", host, serverName);
        // ns.run(callback,1,ns.args); 
    }

}