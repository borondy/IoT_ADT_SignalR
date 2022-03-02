-- SELECT EVERYTHING FROM DIGITALTWINS
SELECT * FROM digitaltwins

-- SELECT EVERY RELATIONSHIPS FROM DIGITALTWINS
SELECT * FROM RELATIONSHIPS

-- select every available workspace
SELECT * 
FROM digitaltwins 
WHERE 
    IS_OF_MODEL('dtmi:com:example:workspace;1')
    AND IS_Bool(isAvailable)
    AND isAvailable=true

-- select one specific workspace with its monitors
SELECT 
    workspace
    ,monitor
FROM 
    digitaltwins monitor 
JOIN 
    workspace RELATED monitor.belongsTo 
WHERE 
    workspace.$dtId='office-west-area1-workspace-1'


-- select only the monitors 
SELECT 
    monitor
FROM 
    digitaltwins monitor 
JOIN 
    workspace RELATED monitor.belongsTo 
WHERE 
    workspace.$dtId='office-west-area1-workspace-1'


--select every meeting room from openspace
--where capacity is greater than 3
SELECT 
    meetingRoom
FROM 
    digitaltwins openSpace
JOIN 
    meetingRoom RELATED openSpace.contains 
WHERE
    openSpace.$dtId='office-west'
    and meetingRoom.peopleCapacity>3
    and IS_OF_MODEL(meetingRoom, 'dtmi:com:example:meetingRoom;1')



-- WILL NOT WORK
-- select every meeting room from openspace
-- where capacity is greater than 3
-- with termostate
-- WILL NOT WORK, BECAUSE thermostat-[serves]->meetingRoom, and join joins on KNOWN
SELECT 
    meetingRoom, thermostat
FROM 
    digitaltwins openSpace
JOIN 
    meetingRoom RELATED openSpace.contains
JOIN
    thermostat RELATED thermostat.serves 
WHERE
    openSpace.$dtId='office-west'
    and meetingRoom.peopleCapacity>3
    and IS_OF_MODEL(meetingRoom, 'dtmi:com:example:meetingRoom;1')
    and IS_OF_MODEL(thermostate, 'dtmi:com:example:thermostat;1')


-- SOLUTION 1
-- WILL WORK if extra relationship added meetingRoom-[contains]->thermostat
SELECT 
    meetingRoom,
    thermostat
FROM 
    digitaltwins openSpace
JOIN 
    meetingRoom RELATED openSpace.contains
JOIN
    thermostat RELATED meetingRoom.contains 
WHERE
    openSpace.$dtId='office-west'
    and meetingRoom.peopleCapacity>3
    and IS_OF_MODEL(meetingRoom, 'dtmi:com:example:meetingRoom;1')
    and IS_OF_MODEL(thermostat,'dtmi:com:example:thermostat;1')

-- ONLY MEETING ROOM AND TEMPERATURE
SELECT 
    meetingRoom.$dtId,
    thermostat.temperatureInDegreeCelsius
FROM 
    digitaltwins openSpace
JOIN 
    meetingRoom RELATED openSpace.contains
JOIN
    thermostat RELATED meetingRoom.contains 
WHERE
    openSpace.$dtId='office-west'
    and meetingRoom.peopleCapacity>3
    and IS_OF_MODEL(meetingRoom, 'dtmi:com:example:meetingRoom;1')
    and IS_OF_MODEL(thermostat,'dtmi:com:example:thermostat;1')

-- SOLUTION 2 MATCH
SELECT 
    meetingRoom,
    thermostat
From digitaltwins
MATCH
    (openSpace)-[]-(meetingRoom)-[]-(thermostat)
WHERE   
    openSpace.$dtId='office-west'
    AND IS_OF_MODEL(meetingRoom, 'dtmi:com:example:meetingRoom;1')
    AND IS_OF_MODEL(thermostat, 'dtmi:com:example:thermostat;1')
-- COST 39

-- Refinement 1
SELECT 
    meetingRoom,
    thermostat
From digitaltwins
MATCH
    (openSpace)-[]->(meetingRoom)<-[]-(thermostat)
WHERE   
    openSpace.$dtId='office-west'
    AND IS_OF_MODEL(meetingRoom, 'dtmi:com:example:meetingRoom;1')
    AND IS_OF_MODEL(thermostat, 'dtmi:com:example:thermostat;1')

-- Refinement 2
SELECT 
    meetingRoom,
    thermostat
From digitaltwins
MATCH
    (openSpace)-[contains]->(meetingRoom)<-[serves]-(thermostat)
WHERE   
    openSpace.$dtId='office-west'
    AND IS_OF_MODEL(meetingRoom, 'dtmi:com:example:meetingRoom;1')
    AND IS_OF_MODEL(thermostat, 'dtmi:com:example:thermostat;1')

-- Refinement 3
SELECT 
    meetingRoom.$dtId,
    thermostat.temperatureInDegreeCelsius
From digitaltwins
MATCH
    (openSpace)-[contains]->(meetingRoom)<-[serves]-(thermostat)
WHERE   
    openSpace.$dtId='office-west'
    AND IS_OF_MODEL(meetingRoom, 'dtmi:com:example:meetingRoom;1')
    AND IS_OF_MODEL(thermostat, 'dtmi:com:example:thermostat;1')


-- Select every space which is served by a thermostat at maximum 5 level hop from root
SELECT 
    thermostat,
    space
From digitaltwins
MATCH
    (openSpace)-[*..5]-(space)<-[serves]-(thermostat)
WHERE   
    openSpace.$dtId='office-west'
    AND IS_OF_MODEL(thermostat, 'dtmi:com:example:thermostat;1')
    AND IS_OF_MODEL(space, 'dtmi:com:example:space;1')


-- Select every space which is served by a thermostate at minimum 1 and maximum 5 hop from root
SELECT 
    thermostat,
    space
From digitaltwins
MATCH
    (openSpace)-[*1..5]-(space)<-[serves]-(thermostat)
WHERE   
    openSpace.$dtId='office-west'
    AND IS_OF_MODEL(thermostat, 'dtmi:com:example:thermostat;1')
    AND IS_OF_MODEL(space, 'dtmi:com:example:space;1')
