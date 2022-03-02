import { DigitalTwinsClient } from "@azure/digital-twins-core";
import { DefaultAzureCredential } from "@azure/identity";
import { config } from "dotenv";
config();

const adturl = process.env["ADT_URL"];
console.log("adtUrl", adturl);
const dtClient = new DigitalTwinsClient(adturl, new DefaultAzureCredential());

const main = async () => {
  const openSpaceId = await createOpenSpace();
  const areaIds = await createAreas(openSpaceId, 3);
  const meetingRoomIds = await createMeetingRooms(openSpaceId, [2, 2, 6, 6]);
  const thermostats = await createConnectedThermostats([
    ...areaIds,
    ...meetingRoomIds,
  ]);
};

const createConnectedThermostats = async (parentIds = []) => {
  const createdThermostats = [];

  const thermostatTwin = {
    targetTempInDegreeCelsius: 22,
    temperatureInDegreeCelsius: 21,
    status: "heating",
    $metadata: {
      $model: "dtmi:com:example:thermostat;1",
    },
  };
  parentIds.forEach((parent, index) => {
    const twinId = `thermostat-${index}`;
    dtClient.upsertDigitalTwin(twinId, JSON.stringify(thermostatTwin));
    createdThermostats.push(twinId);
  });

  await sleep(10000);

  parentIds.forEach((parentId, index) => {
    const osRoomRel = {
      $targetId: `${parentId}`,
      $relationshipName: "serves",
    };
    dtClient.upsertRelationship(
      createdThermostats[index],
      `${parentId}-thermostat`,
      osRoomRel
    );
  });
};
const createMeetingRooms = async (parentSpaceId, capacities = []) => {
  const createdRooms = [];
  capacities.forEach((capacity, index) => {
    const roomId = `meetingRoom-${index}`;
    const roomTwin = {
      peopleCapacity: capacity,
      $metadata: {
        $model: "dtmi:com:example:meetingRoom;1",
      },
    };

    dtClient.upsertDigitalTwin(roomId, JSON.stringify(roomTwin));
    createdRooms.push(roomId);
  });

  await sleep(10000);

  createdRooms.forEach((roomId) => {
    const osRoomRel = {
      $targetId: `${roomId}`,
      $relationshipName: "contains",
    };
    dtClient.upsertRelationship(
      parentSpaceId,
      `${parentSpaceId}-${roomId}`,
      osRoomRel
    );
  });

  return createdRooms;
};

const createOpenSpace = async () => {
  const twinId = "office-west";
  const osTwin = {
    $metadata: {
      $model: "dtmi:com:example:openSpace;1",
    },
  };

  dtClient.upsertDigitalTwin(twinId, JSON.stringify(osTwin));
  await sleep(10000);
  return twinId;
};

const createAreas = async (parentSpace, count = 3) => {
  const areaTwin = {
    $metadata: {
      $model: "dtmi:com:example:area;1",
    },
  };

  const createdAreas = [];
  for (let index = 1; index < count + 1; index++) {
    const areaId = `${parentSpace}-area${index}`;
    dtClient.upsertDigitalTwin(areaId, JSON.stringify(areaTwin));
    createdAreas.push(areaId);
  }
  await sleep(10000);

  createdAreas.forEach((areaId) => {
    createRelatedWorkspacesWithMonitors(areaId, 6);
  });

  createdAreas.forEach((areaId) => {
    const osAreaRel = {
      $targetId: `${areaId}`,
      $relationshipName: "contains",
    };
    dtClient.upsertRelationship(
      parentSpace,
      `${parentSpace}-${areaId}`,
      osAreaRel
    );
  });

  return createdAreas;
};

const createRelatedWorkspacesWithMonitors = async (parentAreaId, count = 6) => {
  let wpMonitors = [];
  const wpTwin = {
    isAvailable: true,
    $metadata: {
      $model: "dtmi:com:example:workspace;1",
    },
  };

  const monitorTwin = {
    $metadata: {
      $model: "dtmi:com:example:monitor;1",
    },
  };

  for (let index = 1; index < count + 1; index++) {
    const wpId = `${parentAreaId}-workspace-${index}`;
    wpTwin.isAvailable = getRandomIntInclusive(0, 1) == true;
    dtClient.upsertDigitalTwin(wpId, JSON.stringify(wpTwin));
    const monitorCount = getRandomIntInclusive(1, 2);
    for (let i = 1; i <= monitorCount; i++) {
      const monitorId = `${wpId}-monitor-${i}`;
      dtClient.upsertDigitalTwin(monitorId, JSON.stringify(monitorTwin));
      wpMonitors.push({ wpId, monitorId });
    }
  }
  await sleep(10000);
  wpMonitors.forEach((v) => {
    const rel = {
      $targetId: `${v.wpId}`,
      $relationshipName: "belongsTo",
    };

    console.log(JSON.stringify(rel));
    dtClient.upsertRelationship(v.monitorId, `${v.wpId}-${v.monitorId}`, rel);
  });
  const createdWorkSpaces = [...new Set(wpMonitors.map((wp) => wp.wpId))];

  createdWorkSpaces.forEach((wpId) => {
    const areaWpRel = {
      $targetId: `${wpId}`,
      $relationshipName: "contains",
    };

    dtClient.upsertRelationship(
      parentAreaId,
      `${parentAreaId}-${wpId}`,
      areaWpRel
    );
  });
};

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min);
}

let sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

main();
