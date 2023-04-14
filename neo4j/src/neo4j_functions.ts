import * as neo4j from 'neo4j-driver';
import { v4 as uuid } from 'uuid';
import { printResults } from './neo4j_index';

export const driver = neo4j.driver(
  `neo4j://localhost:7687`,
  neo4j.auth.basic(`neo4j`, `password`),
  { disableLosslessIntegers: true },
);
export const session = driver.session();

function getRandomInt(max: number) {
  return Math.floor(Math.random() * max);
}

export async function createData({
  nodesNum = 100,
  edgesNum = 7,
  deleteData = false,
}) {
  if (deleteData) {
    console.log(`Deleting`);
    await session.run(`
    MATCH (n)
    CALL {
      WITH n
      DETACH DELETE n
    } IN TRANSACTIONS
    `);
  }

  const nodes = [];
  const edges = [];

  for (var i = 0; i < nodesNum; i++) {
    nodes.push(`node${i}`);
  }

  edgesNum = nodesNum * edgesNum;
  for (var i = 0; i < edgesNum; i++) {
    const a = nodes[Math.floor(Math.random() * nodesNum)];
    let b = nodes[Math.floor(Math.random() * nodesNum)];
    while (a === b) {
      b = nodes[Math.floor(Math.random() * nodesNum)];
    }
    edges.push({ a, b });
  }

  console.log(`create nodes ${nodesNum}`);

  await session.run(
    `UNWIND $nodes as node
    MERGE (p:Person {userId: toString(node)})
    WITH p
    CREATE (d:MetaData)
    SET d.hot = toString(toInteger(rand()*10))
    MERGE (p)-[:USER_ATTRIBUTES_CONSTANT]->(d);
    `,
    { nodes: nodes },
  );

  console.log(`create edges ${edgesNum}`);

  await session.run(
    `
    UNWIND $edges as edge MATCH (a1:Person)-[rel1:USER_ATTRIBUTES_CONSTANT]->(b1:MetaData), (a2:Person)-[rel2:USER_ATTRIBUTES_CONSTANT]->(b2:MetaData)
    WHERE a1.userId = toString(edge.a) AND a2.userId = toString(edge.b) 
    CREATE (a1)-[f1:FEEDBACK {score: toInteger(b2.hot)}]->(a2)
    CREATE (a2)-[f2:FEEDBACK {score: toInteger(b1.hot)}]->(a1)
    `,
    { edges: edges },
  );

  // CREATE (a1)-[f1:FEEDBACK {score: CASE WHEN b1.hot <= b2.hot THEN 10 ELSE -10 END}]->(a2)
  // CREATE (a2)-[f2:FEEDBACK {score: CASE WHEN b2.hot <= b1.hot THEN 10 ELSE -10 END}]->(a1)

  console.log(`done`);
}
export async function getUsers() {
  console.log();
  console.log(`running getUsers`);

  const start_time = performance.now();

  let result;

  result = await session.run(
    `
    MATCH (a:Person)-[rel:USER_ATTRIBUTES_CONSTANT]->(b:MetaData)
    RETURN a.userId, a.community, a.priority, b.hot
    ORDER BY a.priority DESCENDING
    `,
  );

  // ORDER BY rel.score DESCENDING

  const end_time = performance.now();

  console.log(`getUsers`, end_time - start_time);

  return result;
}

export async function getVarience() {
  console.log();
  console.log(`running getVarience`);

  const start_time = performance.now();

  let result;

  // result = await session.run(
  //   `
  //   MATCH (n:Person)
  //     WHERE n.community = 88
  //     WITH avg(n.priority) as mean_priority, collect(n.priority) as priorities
  //     WITH mean_priority, reduce(s = 0.0, p IN priorities | s + (p - mean_priority) ^ 2) as sum_square_diffs, size(priorities) as num_nodes
  //     RETURN sum_square_diffs / (num_nodes - 1) as variance;
  //   `,
  // );

  result = await session.run(
    `
    MATCH (n:Person)-[rel:USER_ATTRIBUTES_CONSTANT]->(b:MetaData)
      WITH n.community as community, avg(n.priority) as mean_priority, collect(n.priority) as priorities, avg(toFloat(b.hot)) as mean_hot, max(toFloat(b.hot)) as max_hot, min(toFloat(b.hot)) as min_hot
      WITH community, mean_priority, reduce(s = 0.0, p IN priorities | s + (p - mean_priority) ^ 2) as sum_square_diffs, size(priorities) as num_nodes, mean_hot, max_hot, min_hot
      RETURN community, sum_square_diffs / (num_nodes) as variance, num_nodes, mean_hot, max_hot, min_hot
      ORDER BY num_nodes DESCENDING;
  `,
  );

  // ORDER BY rel.score DESCENDING

  const end_time = performance.now();

  console.log(`getVarience`, end_time - start_time);

  return result;
}

export async function createFriends() {
  let start_time = performance.now();
  let result;
  // delete friends
  result = await session.run(
    `
    MATCH ()-[r:FRIENDS]-()
    DELETE r
    RETURN r
  `,
  );

  console.log(`deleted friends: ${result.records.length}`);

  // create friends
  result = await session.run(
    `
      MATCH (a)-[r1:FEEDBACK]->(b), (a)<-[r2:FEEDBACK]-(b)
      WHERE r1.score > 0 AND r2.score > 0 AND id(a) > id(b)
      MERGE (a)-[r:FRIENDS]-(b)
      RETURN r
  `,
  );
  console.log(`created friends: ${result.records.length}`);
  console.log(`createFriends`, performance.now() - start_time);

  return result;
}

export async function createFeedback2() {
  let start_time = performance.now();
  let result;
  // delete friends
  result = await session.run(
    `
    MATCH ()-[r:FEEDBACK2]-()
    DELETE r
    RETURN r
  `,
  );

  console.log(`deleted FEEDBACK2: ${result.records.length}`);

  // create friends
  result = await session.run(
    `
      MATCH (a)-[r:FEEDBACK]->(b)
      WITH a, b, r
      MERGE (a)-[r2:FEEDBACK2]->(b)
      SET r2.score = CASE
        WHEN r.score < -9 THEN -10
        ELSE 10
      END
      return r2
  `,
  );

  // MATCH (a)-[r1:FEEDBACK]->(b)
  // WHERE r1.score > -5
  // MERGE (a)-[r:FEEDBACK2{score:10}]-(b)
  // RETURN r
  console.log(`created FEEDBACK2: ${result.records.length}`);
  console.log(`createFeedback2`, performance.now() - start_time);

  return result;
}

export async function createGraph() {
  let result;
  // delete myGraph if it exists
  try {
    result = await session.run(`CALL gds.graph.drop('myGraph');`);
    console.log(`graph delete successfully`);
  } catch (e) {
    console.log(`graph doesn't exist`);
  }

  let start_time = performance.now();
  // create myGraph
  console.log(`creating graph`);
  // `CALL gds.graph.project( 'myGraph', {Person:{}, MetaData:{}}, {FRIENDS:{orientation:'UNDIRECTED'}, FEEDBACK:{}, USER_ATTRIBUTES_CONSTANT: {}}, {relationshipProperties: ['score'] });`
  result = await session.run(
    `CALL gds.graph.project( 
      'myGraph', 
      {Person:{}, MetaData:{}}, 
      {FRIENDS:{orientation:'UNDIRECTED'}, FEEDBACK:{}, USER_ATTRIBUTES_CONSTANT: {}},
      {relationshipProperties: ['score'] }
    );`,
  );
  console.log(`created graph`, performance.now() - start_time);

  return result;
}

export async function callAlgo() {
  // run simularity
  console.log(``);
  console.log(`--- callAlgo`);

  const query1 = `
      CALL gds.nodeSimilarity.stream('myGraph' , {})
          YIELD node1, node2, similarity
          RETURN gds.util.asNode(node1).userid
          AS User1, gds.util.asNode(node2).userid
          AS User2, similarity 
          ORDER BY similarity DESCENDING, User1, User2
          `;

  const query2 = `
      CALL gds.knn.stream('myGraph', {
              topK: 1,
              randomSeed: 1337,
              concurrency: 1,
              sampleRate: 1.0,
              deltaThreshold: 0.0
          })
          YIELD node1, node2, similarity
          RETURN gds.util.asNode(node1).name AS Person1, gds.util.asNode(node2).name AS Person2, similarity
          ORDER BY similarity DESCENDING, Person1, Person2`;

  const query3 = `
      CALL gds.pageRank.stream('myGraph')
          YIELD nodeId, score
          RETURN gds.util.asNode(nodeId).name AS name, score
          ORDER BY score DESC, name ASC`;

  const query4 = `
          CALL gds.betweenness.stream('myGraph')
            YIELD nodeId, score
            RETURN gds.util.asNode(nodeId).name AS name, score
            ORDER BY score ASC`;

  const query5 = `WITH ['node1', 'node2', 'node3', 'node4'] AS names
          CALL gds.nodeSimilarity.stream('myGraph', {})
            YIELD node1, node2, similarity
            WHERE gds.util.asNode(node1).name IN names
            AND gds.util.asNode(node2).name IN names
            AND gds.util.asNode(node1).name <> gds.util.asNode(node2).name
            RETURN gds.util.asNode(node1).name AS Person1,
              gds.util.asNode(node2).name AS Person2,
              similarity
            ORDER BY similarity DESCENDING, Person1, Person2
          `;

  const query6 = `WITH ['node1', 'node2', 'node3', 'node4'] AS nodeNames
          MATCH (n)
          WHERE n.name IN nodeNames
          CALL gds.nodeSimilarity.stream('myGraph', {
            nodeProjection: 'n'
          })
          YIELD node1, node2, similarity
          RETURN gds.util.asNode(node1).name AS Person1,
                 gds.util.asNode(node2).name AS Person2,
                 similarity
          ORDER BY similarity DESCENDING, Person1, Person2
          `;

  const query7 = `CALL gds.nodeSimilarity.write('myGraph', {
            writeRelationshipType: 'SIMILAR',
            writeProperty: 'score'
        })
        YIELD nodesCompared, relationshipsWritten`;

  //         MATCH (a:Person), (b:Person) WHERE a.name IN ['node1', 'node2', 'node3'] AND b.name IN ['node1', 'node2', 'node3'] AND a <> b
  // MATCH (a)-[r:SIMILAR]-(b)
  // RETURN a.name AS node1, b.name AS node2, r.value AS similarity
  // ORDER BY similarity DESCENDING;

  let start_time = performance.now();

  let result = await session.run(query7);

  const end_time = performance.now();

  console.log(`query`, end_time - start_time);

  return result;
}

export async function callWriteSimilar() {
  // run simularity
  console.log(``);
  console.log(`--- callWriteSimilar`);

  const query7 = `CALL gds.nodeSimilarity.write('myGraph', {
            writeRelationshipType: 'SIMILAR',
            writeProperty: 'score'
        })
        YIELD nodesCompared, relationshipsWritten`;

  let start_time = performance.now();

  let result = await session.run(query7);

  const end_time = performance.now();

  console.log(`query`, end_time - start_time);

  return result;
}

export async function callPriority() {
  console.log(``);
  console.log(`--- callPriority`);

  let start_time = performance.now();

  let result = await session.run(
    `
    CALL gds.articleRank.write('myGraph', {  
        scaler: "MinMax",
        relationshipTypes: ['FEEDBACK'],
        relationshipWeightProperty: 'score',
        writeProperty: 'priority' 
      }
    )
    YIELD nodePropertiesWritten, ranIterations
  `,
  );

  const end_time = performance.now();

  console.log(`query`, end_time - start_time);

  return result;
}

export async function callCommunities() {
  console.log(``);
  console.log(`--- callCommunities`);

  let start_time = performance.now();

  let result = await session.run(
    `
    CALL gds.louvain.write('myGraph', 
    {  
      relationshipTypes: ['FRIENDS'],
      writeProperty: 'community' 
    }
    )
      YIELD communityCount, modularity, modularities
  `,
  );

  const end_time = performance.now();

  console.log(`query`, end_time - start_time);

  return result;
}

export async function changeRandomReady() {
  //   const start_time = performance.now();
  //   // create myGraph
  //   let result;
  //   console.log(`running changeRandomReady`);
  //   result = await session.run(`
  //     MATCH (n) WHERE n.name = "node${getRandomInt(nodesNum)}"
  //       SET n.ready = true
  //   `);
  //   const end_time = performance.now();
  //   console.log(`it took: `, end_time - start_time);
  //   return result;
}

export async function test() {
  const start_time = performance.now();

  let result;
  console.log(`running getAllReady`);
  result = await session.run(`
    MATCH (n:Person{userId: 'k6_auth_1'}) return n
  `);
  const end_time = performance.now();
  console.log(`it took: `, end_time - start_time);
  return result;
}

export async function getFirstN() {
  const n = 100;
  const start_time = performance.now();

  let result;
  console.log(`running getFirstN n:${n}`);

  result = await session.run(`
    MATCH (n)
    RETURN n
    LIMIT ${n}
    `);

  const end_time = performance.now();

  console.log(`it took: `, end_time - start_time);

  return result;
}

export async function getSimilar(names: Array<string>) {
  console.log();
  console.log(`running getSimilar`);

  const start_time = performance.now();
  // create myGraph

  let result;

  result = await session.run(
    `
  MATCH (a)-[rel:SIMILAR]->(b) 
  WHERE a.userId < b.userId 
  AND a.userId IN $names
  AND b.userId IN $names
  RETURN a.userId, b.userId, rel.score
  ORDER BY rel.score DESCENDING
    `,
    { names },
  );

  // result = await session.run(`
  // MATCH (n:Person)-[r:SIMILAR]->(m:Person)
  // WHERE n.name IN ["node1", "node2", "node3"]
  // AND m.name IN ["node1", "node2", "node3"]
  // RETURN n.name AS node1, m.name AS node2, r.score AS similarity
  // ORDER BY r.score DESCENDING, node1, node2
  //     `);

  const end_time = performance.now();

  console.log(`it took: `, end_time - start_time);

  return result;
}

export async function getSimilarTarget(target: string, names: Array<string>) {
  console.log();
  console.log(`running getSimilar`);

  const start_time = performance.now();
  // create myGraph

  let result;

  result = await session.run(
    `
  MATCH (a)-[rel:SIMILAR]->(b) 
  WHERE a.userId = $target
  AND b.userId IN $names
  RETURN a.userId as targetId, b.userId as otherId, rel.score as score
  ORDER BY rel.score DESCENDING
    `,
    { target, names },
  );

  const end_time = performance.now();

  console.log(`it took: `, end_time - start_time);

  return result;
}

export async function mergePerson() {
  let result;

  // result = await session.run(`
  // MERGE (:Person {socketid: 'andrew1'})
  //   `);

  const toAdd: any[] = [];

  for (let i = 0; i < 200; i++) {
    toAdd.push({ socketid: uuid() });
  }

  const start_time = performance.now();

  // const session = driver.session();

  result = await session.run(
    `UNWIND $nodes as node
      MERGE (:Person {socketid: node.socketid});
      `,
    {
      nodes: toAdd,
    },
  );

  const end_time = performance.now();
  // await session.close();

  console.log(`it took: `, end_time - start_time);

  return result;
}
