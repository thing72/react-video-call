import { delay, getLogger } from 'react-video-call-common';
import { mainRedisClient, pubRedisClient } from './socketio_server';
import { Socket } from 'socket.io';
import * as common from 'react-video-call-common';

const logger = getLogger();

const socketio_server_heartbeat = `socketio_server_heartbeat`;

const getServerKey = () => {
  return `socketio_server_${process.env.HOSTNAME}`;
};

const heartbeatPrefix = `socketio_headbeat_`;
export const registerServerHeartbeat = async () => {
  // register time to server heartbeat key
  const time = await mainRedisClient.time();
  await mainRedisClient.set(heartbeatPrefix + getServerKey(), time[0]);
};

export const registerSocket = async (socket: Socket) => {
  await mainRedisClient.hset(
    common.connectedAuthMapName,
    socket.data.auth,
    socket.id,
  );
  await mainRedisClient.sadd(common.activeSetName, socket.data.auth);
  await mainRedisClient.sadd(getServerKey(), socket.data.auth);
};

export const registerSocketReady = async (socket: Socket) => {
  await mainRedisClient.sadd(common.readySetName, socket.data.auth);
};

export const cleanSocket = async (
  auth: string,
  server_key: string = getServerKey(),
) => {
  await mainRedisClient.hdel(common.connectedAuthMapName, auth);
  await mainRedisClient.srem(common.activeSetName, auth);
  await mainRedisClient.srem(common.readySetName, auth);
  await pubRedisClient.publish(common.activeCountChannel, `change`);
  await mainRedisClient.srem(server_key, auth);
};

const cleanSocketServer = async (server_hostname: string) => {
  logger.info(`cleanSocketServer server_hostname: ${server_hostname}`);
  const connectedAuths = await mainRedisClient.smembers(server_hostname);

  for (const auth of connectedAuths) {
    await cleanSocket(auth, server_hostname);
  }
  await mainRedisClient.del(heartbeatPrefix + server_hostname);
};

export const cleanMySocketServer = async () => {
  await cleanSocketServer(getServerKey());
};

export const cleanAllSocketServer = async () => {
  scanKeys(heartbeatPrefix + `*`).then(async (heartbeat_ids) => {
    for (const heartbeat_id of heartbeat_ids) {
      const time = (await mainRedisClient.time())[0];
      const heartbeat_time = await mainRedisClient.get(heartbeat_id);
      if (heartbeat_time == null) {
        continue;
      }

      logger.error(
        `time - parseFloat(heartbeat_time) ${
          time - parseFloat(heartbeat_time)
        } ... ${heartbeat_id}`,
      );

      if (time - parseFloat(heartbeat_time) > 60) {
        await cleanSocketServer(heartbeat_id.substring(heartbeatPrefix.length));
      }
    }
  });
};

const scanKeys = async (prefix = ``): Promise<Set<string>> => {
  let stream = mainRedisClient.scanStream({
    match: prefix,
  });
  return new Promise((res, rej) => {
    let keysSet = new Set<string>();
    stream.on(`data`, async (keys: string[] = []) => {
      for (const key of keys) {
        keysSet.add(key);
      }
    });
    stream.on(`end`, () => {
      res(keysSet);
    });
  });
};
