const http = require('http');
const cluster = require('cluster');
const os = require('os');

const MAX_CLUSTER_PROCESS = os.cpus().length;

if(cluster.isMaster){

  console.log(`Master/Parent process with pid ${process.pid} starting...`);
  console.log('schedulingPolicy',cluster.SCHED_RR, cluster.SCHED_NONE, cluster.schedulingPolicy)
  for(let i=0; i<MAX_CLUSTER_PROCESS; i++){
    cluster.fork();
  }

  cluster.on('exit', (worker, code, singal) => {
    console.log(`worker with id:${worker.id} & pid:${worker.process.pid} died with code:${code} and signal:${signal}`);
  })

  cluster.on('online', (worker) => {
    console.log(`worker with id:${worker.id} & pid:${worker.process.pid} is online`)
  })

  cluster.on('message', (worker, message, handle) => {
    console.log(`Message from worker ${worker.id}: ${message}`);
    if(message === 'EXIT'){
      console.log('Exiting master/parent process because one of worker/child process signaled to EXIT');
      process.exit();
    }
  })

}else{

  console.log(`Worker/Child process with pid ${process.pid} starting...`);
  let httpServer = http.createServer((req, res) => {
    res.writeHead(200);
    res.end(`hello world from worker/child process with id:${cluster.worker.id} & pid:${process.pid}`);
    res.end();
  }).listen(3000);

  httpServer.listen(3001);
  console.log(httpServer.keepAliveTimeout);
  httpServer.keepAliveTimeout = 1;

  httpServer.on('error', (err) => {
    console.log('server could not bound to port 3000 due to ', err);
    cluster.worker.send('EXIT');
  })

  httpServer.on('listening', () => {
    console.log('server is listening on port 3000');
  })

}