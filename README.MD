

[中文文档](https://screeps-cn.github.io/api/)

### 自动renew设计
1. screep空闲的时候，去spawn附近
2. 更改spawn的renewTargetId，进行renew
3. 


### carry 任务队列设计
1. 由scanner扫描，当前的房间的任务，生成一个队列

### 外矿机器人

### 守护者设计
1. 指定房间扫描，扫描敌人数
2. 按照顺序逐一击杀，杀完了记录 ticksToSpawn
3. 


### 自动创建设计

对于功能单一的，比如能量矿、资源矿旁边的harvester，还是用role驱动

对于carry 多功能work，使用任务驱动