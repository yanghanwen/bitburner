/** @param {NS} ns **/
export async function main(ns) {
    var host = ns.getHostname();

    ns.tprintf("============================ ROOT %s ====> %s ============================ ", host, serverName);
    ns.run("scan_root.js");
    await ns.sleep(1000);

    ns.tprintf("============================ COPY %s ====> %s ============================ ", host, serverName);
    ns.run('scan_copy.js');
    await ns.sleep(1000);

    ns.tprintf("============================ DIFFUSE %s ====> %s ============================ ", host, serverName);
    var root = ns.scan(host);
    var purchasedServer = ns.getPurchasedServers();
    for (var i in root) {
        var serverName = root[i];

        if (ns.isRunning('scan_virus.js', serverName)) {
            ns.tprintf("忽略已执行 scan_virus.js 的目标 %s ====> %s", host, serverName);
            continue;
        }

        if (purchasedServer.includes(serverName)) {
            ns.tprintf("忽略自身服务器 %s ====> %s", host, serverName);
            continue;
        }

        ns.tprintf("处理目标机 %s ====> %s", host, serverName);

        if (serverName == 'home') {
            ns.tprintf("忽略 %s ====> home", host);
            continue;
        }

        if (ns.hasRootAccess(serverName)) {
            var pid = ns.exec('scan_virus.js', serverName, 1);
            if (pid != 0) {
                ns.tprintf("在目标机链式执行 成功 %s ====> %s", host, serverName);
            } else {
                ns.tprintf("在目标机链式执行 失败，可能因为RAM不足 %s ====> %s", host, serverName);
            }
        } else {
            ns.tprintf("在目标机链式执行失败，无ROOT权限 %s ====> %s", host, serverName);
        }
    }


    if (host != 'home') {
        ns.tprintf("============================ HACK %s ====> %s ============================ ", host, serverName);
        ns.run('hack1.js', 1, host);
        await ns.sleep(1000);
    }

}