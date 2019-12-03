# Packet Specification

### Packet `controller -> server`
```
$timestamp/$movementSpeed/$movementDirection/$shootingDirection
```
1. `timestamp` - ms from UTC 01.01.1970 00:00:00:0000
2. `movingSpeed` - float in [0, 1] or empty
3. `movingDirection` - integer in [0, 360) or empty
4. `shootingDirection` - integer in [0, 360) or empty

### Gameplay packet `server -> screen` !PRIORITY 
```
$id1/$x1/$x2/$rot1,$id2/$x2/$y2/$rot2(, ...):$id1/$x1/$y1/$rot1,$id2/$x2/$y2/$rot2(, ...)
```
1. `A:` - players list, separated by `,`, each player consists of
    1. `id` - integer uniquely identifying this player
    2. `x` - integer, x position
    3. `y` - integer, y position
    4. `rot` - integer in [0, 360), player's rotation
    
    player missing from this list = player dead
2. `:B` - missiles list, same as above

### Round packet `server -> screen`
```
$x1/$y1/$x2/$y2/$x3/$y3,$x1/$y1/$x2/$y2/$x3/$y3:$id1/$x1/$x2/$rot1,$id2/$x2/$y2/$rot2(, ...)
```
1. `A:` - map array
    1. `a,...` - single shape on map
        1. `x/y...` - shape point locations
2. `B:` - initial players' array
