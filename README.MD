

[中文文档](https://screeps-cn.github.io/api/)
[在线地址](https://screeps.com/a/#!/room/shard1/E13S39)


1. 根据spawn 扫描房间内的资源矿的位置 定位附近可以建造的点 创建 container
2. 根据spawn 所在房间 查看


## worker设计
1. 如果有待治疗work，待修复的建筑，从存储桶中拿到能量去修复（todo）
2. 如果有矿可以挖，挖矿，优先送到 spwan extension 中
   
## harvester设计
1. 扫描房间中的source 是否有container，如果container 则生产harvester
2. 创建的时候直接指定source，移动到source指定的container，绑定container绑定
3. 

## spawner生产队列设计
1. 队列中，每个类型只能有一个，生产去重
2. 

### 自动renew设计
1. screep空闲的时候，去spawn附近
2. 更改spawn的renewTargetId，进行renew
3. 


### 外矿机器人

### 守护者设计
1. 指定房间扫描，扫描敌人数
2. 按照顺序逐一击杀，杀完了记录 ticksToSpawn
3. 


### 自动创建设计

对于功能单一的，比如能量矿、资源矿旁边的harvester，还是用role驱动

对于carry 多功能work，使用任务驱动